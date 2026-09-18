'use client';

import { useMemo, useState, type SubmitEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, Box, Button, Stack, TextField } from '@mui/material';
import { fieldErrorsOf, type FieldErrors } from '@/lib/api/apiError';
import { profileApi } from '@/lib/api/client/profile';
import type { LinkKind, Profile } from '@/lib/api/schemas';
import { buildProfilePatch, profileValuesOf } from '@/lib/dashboard/diff';
import { LIMITS } from '@/lib/dashboard/fields';
import {
  LINK_KIND_OPTIONS,
  toDrafts,
  type DraftRow,
} from '@/lib/dashboard/rows';
import { errorMessage } from '@/lib/errors';
import { useFeedback } from '../_components/Feedback';
import { SectionTitle } from '../_components/SectionTitle';
import { MarkdownField } from '../_components/MarkdownField';
import { RowsEditor } from '../_components/RowsEditor';

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const notify = useFeedback();

  // El baseline es la última verdad conocida del servidor, no las props: si
  // `router.refresh()` llega mientras editas, las props cambian y pisarían el
  // formulario.
  const [baseline, setBaseline] = useState(profile);
  const [values, setValues] = useState(() => profileValuesOf(profile));
  const [links, setLinks] = useState<DraftRow<LinkKind>[]>(() =>
    toDrafts(profile.links),
  );

  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const patch = useMemo(
    () => buildProfilePatch(baseline, values, links),
    [baseline, values, links],
  );
  const dirty = Object.keys(patch).length > 0;

  const set =
    (key: keyof typeof values) => (e: { target: { value: string } }) =>
      setValues((current) => ({ ...current, [key]: e.target.value }));

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (values.fullName.trim() === '') {
      setFieldErrors({ fullName: 'El nombre es obligatorio' });
      return;
    }

    setLoading(true);
    try {
      const saved = await profileApi.update(patch);

      // La respuesta es la nueva verdad: el servidor normaliza (recorta
      // espacios, colapsa vacíos) y el siguiente diff tiene que partir de ahí.
      setBaseline(saved);
      setValues(profileValuesOf(saved));
      setLinks(toDrafts(saved.links));

      notify('Perfil guardado');
      router.refresh();
    } catch (err) {
      setError(errorMessage(err));
      setFieldErrors(fieldErrorsOf(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2}>
        {error && <Alert severity="error">{error}</Alert>}

        <SectionTitle>Presentación</SectionTitle>

        <TextField
          label="Nombre"
          value={values.fullName}
          onChange={set('fullName')}
          error={Boolean(fieldErrors.fullName)}
          helperText={fieldErrors.fullName}
          slotProps={{ htmlInput: { maxLength: LIMITS.fullName } }}
          fullWidth
        />

        <TextField
          label="Titular"
          value={values.headline}
          onChange={set('headline')}
          error={Boolean(fieldErrors.headline)}
          helperText={fieldErrors.headline ?? 'Una línea bajo tu nombre'}
          slotProps={{ htmlInput: { maxLength: LIMITS.headline } }}
          fullWidth
        />

        <TextField
          label="Ubicación"
          value={values.location}
          onChange={set('location')}
          error={Boolean(fieldErrors.location)}
          helperText={fieldErrors.location}
          slotProps={{ htmlInput: { maxLength: LIMITS.location } }}
          fullWidth
        />

        <TextField
          label="Email público"
          type="email"
          value={values.publicEmail}
          onChange={set('publicEmail')}
          error={Boolean(fieldErrors.publicEmail)}
          helperText={
            fieldErrors.publicEmail ?? 'Distinto del que usas para entrar'
          }
          fullWidth
        />

        <TextField
          label="URL del avatar"
          value={values.avatarUrl}
          onChange={set('avatarUrl')}
          error={Boolean(fieldErrors.avatarUrl)}
          helperText={fieldErrors.avatarUrl}
          fullWidth
        />

        <MarkdownField
          title="Sobre mí"
          value={values.bio}
          onChange={(bio) => setValues((c) => ({ ...c, bio }))}
          max={LIMITS.bio}
          error={fieldErrors.bio}
          disabled={loading}
          placeholder="A qué te dedicas, qué te interesa, cómo trabajas..."
        />

        <RowsEditor<LinkKind>
          title="Enlaces"
          rows={links}
          onChange={setLinks}
          kinds={LINK_KIND_OPTIONS}
          defaultKind="web"
          max={LIMITS.links}
          fieldPrefix="links"
          errors={fieldErrors}
          disabled={loading}
          emptyText="Sin enlaces. GitHub, LinkedIn, tu web..."
        />

        <Box>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || !dirty}
          >
            {loading ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
