'use client';

import { useMemo, useState, type SubmitEvent } from 'react';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { fieldErrorsOf, type FieldErrors } from '@/lib/api/apiError';
import { projectsApi } from '@/lib/api/client/projects';
import type { AssetKind, Project } from '@/lib/api/schemas';
import {
  buildProjectCreate,
  buildProjectPatch,
  projectValuesOf,
  type ProjectValues,
} from '@/lib/dashboard/diff';
import { LIMITS, SLUG_SHAPE, slugify } from '@/lib/dashboard/fields';
import {
  ASSET_KIND_OPTIONS,
  toDrafts,
  type DraftRow,
} from '@/lib/dashboard/rows';
import { errorMessage } from '@/lib/errors';
import { useFeedback } from '../components/Feedback';
import { SectionTitle } from '../components/SectionTitle';
import { MarkdownField } from '../components/MarkdownField';
import { RowsEditor } from '../components/RowsEditor';

const EMPTY: ProjectValues = {
  slug: '',
  title: '',
  description: '',
  startedAt: '',
  endedAt: '',
  published: false,
};

interface Props {
  project: Project | null;
  onBack: () => void;
  onSaved: (project: Project, created: boolean) => void;
}

export function ProjectForm({ project, onBack, onSaved }: Props) {
  const notify = useFeedback();

  const [baseline, setBaseline] = useState(project);
  const [values, setValues] = useState<ProjectValues>(() =>
    project ? projectValuesOf(project) : EMPTY,
  );
  const [assets, setAssets] = useState<DraftRow<AssetKind>[]>(() =>
    toDrafts(project?.assets ?? []),
  );

  // Mientras no lo toque a mano, el slug sigue al título.
  const [slugTouched, setSlugTouched] = useState(project !== null);

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const patch = useMemo(
    () => (baseline ? buildProjectPatch(baseline, values, assets) : null),
    [baseline, values, assets],
  );
  const dirty = patch === null || Object.keys(patch).length > 0;

  function setTitle(title: string) {
    setValues((current) => ({
      ...current,
      title,
      slug: slugTouched ? current.slug : slugify(title),
    }));
  }

  function localErrors(): FieldErrors {
    const found: FieldErrors = {};

    if (values.title.trim() === '') found.title = 'El título es obligatorio';

    const slug = values.slug.trim();
    if (slug === '') found.slug = 'El slug es obligatorio';
    else if (!SLUG_SHAPE.test(slug))
      found.slug = 'Solo minúsculas, números y guiones';

    if (values.startedAt && values.endedAt && values.endedAt < values.startedAt)
      found.endedAt = 'No puede ser anterior al inicio';

    return found;
  }

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const found = localErrors();
    if (Object.keys(found).length > 0) {
      setFieldErrors(found);
      return;
    }
    setFieldErrors({});

    setLoading(true);
    try {
      if (baseline === null) {
        const created = await projectsApi.create(
          buildProjectCreate(values, assets),
        );
        adopt(created);
        notify('Proyecto creado');
        onSaved(created, true);
      } else {
        // El slug de la URL es el viejo; el nuevo llega en la respuesta.
        const saved = await projectsApi.update(baseline.slug, patch ?? {});
        adopt(saved);
        notify('Proyecto actualizado');
        onSaved(saved, false);
      }
    } catch (err) {
      setError(errorMessage(err));
      setFieldErrors(fieldErrorsOf(err));
    } finally {
      setLoading(false);
    }
  }

  /** La respuesta del servidor es la nueva verdad: normaliza el slug y demás. */
  function adopt(saved: Project) {
    setBaseline(saved);
    setValues(projectValuesOf(saved));
    setAssets(toDrafts(saved.assets));
    setSlugTouched(true);
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        <Box>
          <Button
            onClick={onBack}
            startIcon={<ArrowBackIcon />}
            size="small"
            sx={{ ml: -1, color: 'text.secondary' }}
          >
            Volver a la lista
          </Button>
        </Box>

        {error && <Alert severity="error">{error}</Alert>}

        <Paper variant="outlined" sx={{ px: 2, py: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={values.published}
                onChange={(e) =>
                  setValues((c) => ({ ...c, published: e.target.checked }))
                }
              />
            }
            label={
              <Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Visibilidad
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {values.published
                    ? 'Visible en el portafolio'
                    : 'Borrador: solo tú lo ves'}
                </Typography>
              </Stack>
            }
          />
        </Paper>

        <SectionTitle>Datos</SectionTitle>

        <TextField
          label="Título"
          value={values.title}
          onChange={(e) => setTitle(e.target.value)}
          error={Boolean(fieldErrors.title)}
          helperText={fieldErrors.title}
          slotProps={{ htmlInput: { maxLength: LIMITS.title } }}
          fullWidth
        />

        <TextField
          label="Slug"
          value={values.slug}
          onChange={(e) => {
            setSlugTouched(true);
            setValues((current) => ({ ...current, slug: e.target.value }));
          }}
          error={Boolean(fieldErrors.slug)}
          helperText={
            fieldErrors.slug ?? `La URL será /proyectos/${values.slug || '...'}`
          }
          slotProps={{ htmlInput: { maxLength: LIMITS.slug } }}
          fullWidth
        />

        <SectionTitle>Fechas</SectionTitle>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Inicio"
            type="date"
            value={values.startedAt}
            onChange={(e) =>
              setValues((c) => ({ ...c, startedAt: e.target.value }))
            }
            error={Boolean(fieldErrors.startedAt)}
            helperText={fieldErrors.startedAt}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />

          <TextField
            label="Fin"
            type="date"
            value={values.endedAt}
            onChange={(e) =>
              setValues((c) => ({ ...c, endedAt: e.target.value }))
            }
            error={Boolean(fieldErrors.endedAt)}
            helperText={fieldErrors.endedAt ?? 'Vacío si sigue en curso'}
            slotProps={{ inputLabel: { shrink: true } }}
            fullWidth
          />
        </Stack>

        <MarkdownField
          title="Descripción"
          value={values.description}
          onChange={(description) => setValues((c) => ({ ...c, description }))}
          max={LIMITS.description}
          error={fieldErrors.description}
          disabled={loading}
          placeholder="Qué es, qué resuelve, con qué está hecho..."
        />

        <RowsEditor<AssetKind>
          title="Recursos"
          rows={assets}
          onChange={setAssets}
          kinds={ASSET_KIND_OPTIONS}
          defaultKind="repository"
          max={LIMITS.assets}
          fieldPrefix="assets"
          errors={fieldErrors}
          disabled={loading}
          emptyText="Sin recursos. Repositorio, demo, capturas..."
        />

        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !dirty}
          >
            {loading
              ? 'Guardando...'
              : baseline === null
                ? 'Crear proyecto'
                : 'Guardar cambios'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
