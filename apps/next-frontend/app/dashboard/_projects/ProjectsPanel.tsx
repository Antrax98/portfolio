'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { projectsApi } from '@/lib/api/client/projects';
import type { Project } from '@/lib/api/schemas';
import { moveRow } from '@/lib/dashboard/rows';
import { errorMessage } from '@/lib/errors';
import { ConfirmDialog } from '../_components/ConfirmDialog';
import { useFeedback } from '../_components/Feedback';
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

  // El orden que está en el servidor, por id. Sirve de referencia para saber si
  // lo que se ve en pantalla difiere de lo guardado.
  const [savedOrder, setSavedOrder] = useState(() => initial.map((p) => p.id));
  const [savingOrder, setSavingOrder] = useState(false);

  const orderChanged =
    projects.length === savedOrder.length &&
    projects.some((project, index) => project.id !== savedOrder[index]);

  /** Sustituye la lista y da por bueno su orden: para crear, editar y borrar. */
  function replaceProjects(next: Project[]) {
    setProjects(next);
    setSavedOrder(next.map((p) => p.id));
  }

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
    replaceProjects(
      created
        ? [...projects, saved]
        : projects.map((p) => (p.id === saved.id ? saved : p)),
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

      replaceProjects(projects.filter((p) => p.slug !== pendingDelete.slug));
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

  async function saveOrder() {
    setSavingOrder(true);
    try {
      // Solo los que cambiaron de sitio. Al mover uno, son dos: el que subió y
      // el que bajó. Y de paso renumera de 0 en adelante, así que arregla los
      // empates si dos proyectos quedaron con la misma posición.
      const pending = projects
        .map((project, index) => ({ project, index }))
        .filter(({ project, index }) => project.position !== index);

      const saved = await Promise.all(
        pending.map(({ project, index }) =>
          projectsApi.update(project.slug, { position: index }),
        ),
      );

      const byId = new Map(saved.map((project) => [project.id, project]));
      replaceProjects(projects.map((p) => byId.get(p.id) ?? p));

      notify('Orden guardado');
      router.refresh();
    } catch (err) {
      notify(errorMessage(err), 'error');
      // Puede haberse guardado una parte: recargar para ver el estado real en
      // vez de dejar la pantalla mintiendo.
      router.refresh();
    } finally {
      setSavingOrder(false);
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
          onMove={(index, delta) =>
            setProjects((current) => moveRow(current, index, delta))
          }
          orderChanged={orderChanged}
          onSaveOrder={saveOrder}
          onDiscardOrder={() =>
            setProjects((current) =>
              [...current].sort(
                (a, b) => savedOrder.indexOf(a.id) - savedOrder.indexOf(b.id),
              ),
            )
          }
          savingOrder={savingOrder}
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
