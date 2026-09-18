'use client';

import { useRef } from 'react';
import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import {
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { FieldErrors } from '@/lib/api/apiError';
import { LIMITS } from '@/lib/dashboard/fields';
import { moveRow, type DraftRow } from '@/lib/dashboard/rows';

interface Props<K extends string> {
  title: string;
  rows: DraftRow<K>[];
  onChange: (rows: DraftRow<K>[]) => void;
  kinds: readonly { value: K; label: string }[];
  defaultKind: K;
  max: number;
  /** Prefijo del `field` que manda el backend: `links` o `assets`. */
  fieldPrefix: 'links' | 'assets';
  errors?: FieldErrors;
  disabled?: boolean;
  emptyText?: string;
}

export function RowsEditor<K extends string>({
  title,
  rows,
  onChange,
  kinds,
  defaultKind,
  max,
  fieldPrefix,
  errors = {},
  disabled = false,
  emptyText = 'Todavía no hay ninguno.',
}: Props<K>) {
  // Contador para los uid de las filas nuevas. Determinista, no aleatorio: el
  // componente también se renderiza en servidor durante el SSR.
  const nextUid = useRef(rows.length);

  const update = (index: number, patch: Partial<DraftRow<K>>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const add = () =>
    onChange([
      ...rows,
      { uid: `n${nextUid.current++}`, kind: defaultKind, url: '', label: '' },
    ]);

  const remove = (index: number) =>
    onChange(rows.filter((_, i) => i !== index));

  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {rows.length} / {max}
        </Typography>
      </Stack>

      {rows.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          {emptyText}
        </Typography>
      )}

      {rows.map((row, index) => {
        const urlError = errors[`${fieldPrefix}[${index}].url`];
        const kindError = errors[`${fieldPrefix}[${index}].kind`];
        const labelError = errors[`${fieldPrefix}[${index}].label`];

        return (
          <Paper key={row.uid} variant="outlined" sx={{ p: 1.5 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              sx={{ alignItems: 'flex-start' }}
            >
              <TextField
                select
                label="Tipo"
                value={row.kind}
                onChange={(e) => update(index, { kind: e.target.value as K })}
                error={Boolean(kindError)}
                helperText={kindError}
                disabled={disabled}
                size="small"
                sx={{ minWidth: 150 }}
              >
                {kinds.map((kind) => (
                  <MenuItem key={kind.value} value={kind.value}>
                    {kind.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="URL"
                value={row.url}
                onChange={(e) => update(index, { url: e.target.value })}
                error={Boolean(urlError)}
                helperText={urlError}
                disabled={disabled}
                size="small"
                fullWidth
              />

              <TextField
                label="Etiqueta"
                value={row.label}
                onChange={(e) => update(index, { label: e.target.value })}
                error={Boolean(labelError)}
                helperText={labelError}
                disabled={disabled}
                size="small"
                slotProps={{ htmlInput: { maxLength: LIMITS.label } }}
                sx={{ minWidth: 150 }}
              />

              <Stack direction="row" sx={{ pt: 0.5 }}>
                <IconButton
                  onClick={() => onChange(moveRow(rows, index, -1))}
                  disabled={disabled || index === 0}
                  aria-label="Subir"
                  size="small"
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() => onChange(moveRow(rows, index, 1))}
                  disabled={disabled || index === rows.length - 1}
                  aria-label="Bajar"
                  size="small"
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() => remove(index)}
                  disabled={disabled}
                  aria-label="Eliminar"
                  size="small"
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </Paper>
        );
      })}

      <Box>
        <Button
          onClick={add}
          startIcon={<AddIcon />}
          size="small"
          disabled={disabled || rows.length >= max}
        >
          Añadir
        </Button>
      </Box>
    </Stack>
  );
}
