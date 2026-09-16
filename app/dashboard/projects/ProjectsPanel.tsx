'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi } from '@/lib/api/client/projects';
import type { Project } from '@/lib/api/schemas';
import { errorMessage } from '@/lib/errors';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useFeedback } from '../components/Feedback';
import { ProjectForm } from './ProjectForm';
import { ProjectList } from './ProjectList';

type View =
  { mode: 'list' } | { mode: 'create' } | { mode: 'edit'; slug: string };

export function ProjectsPanel({ projects: initial }: { projects: Project[] }) {
  const router = useRouter();
  const notify = useFeedback();

  const [projects, setProjects] = useState(initial);
  const [view, setView] = useState<View>({ mode: 'list' });
  const [pendingDelete, setPendingDelete] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  const editing =
    view.mode === 'edit'
      ? (projects.find((p) => p.slug === view.slug) ?? null)
      : null;

  // El proyecto que se editaba ya no está (se borró): volver a la lista en vez
  // de quedarse en un editor vacío.
  if (view.mode === 'edit' && editing === null) {
    setView({ mode: 'list' });
  }

  function handleSaved(saved: Project, created: boolean) {
    // Por `id` y no por slug: el slug es precisamente lo que el formulario
    // puede haber cambiado, y el id no se mueve nunca.
    setProjects((current) =>
      created
        ? [...current, saved]
        : current.map((p) => (p.id === saved.id ? saved : p)),
    );

    // Si el slug cambió, el estado tiene que apuntar al nuevo.
    setView({ mode: 'edit', slug: saved.slug });
    router.refresh();
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    setDeleting(true);
    try {
      await projectsApi.remove(pendingDelete.slug);

      setProjects((current) =>
        current.filter((p) => p.slug !== pendingDelete.slug),
      );
      setView({ mode: 'list' });
      notify('Proyecto eliminado');
      router.refresh();
    } catch (err) {
      notify(errorMessage(err), 'error');
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <>
      {view.mode === 'list' ? (
        <ProjectList
          projects={projects}
          onCreate={() => setView({ mode: 'create' })}
          onEdit={(slug) => setView({ mode: 'edit', slug })}
          onDelete={setPendingDelete}
        />
      ) : (
        <ProjectForm
          project={editing}
          onBack={() => setView({ mode: 'list' })}
          onSaved={handleSaved}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="¿Eliminar el proyecto?"
        description={
          pendingDelete
            ? `Se eliminará "${pendingDelete.title}" y sus recursos. No se puede deshacer.`
            : undefined
        }
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
}
