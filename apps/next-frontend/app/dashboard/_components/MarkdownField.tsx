'use client';

import { useState } from 'react';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Box,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Markdown } from '@/app/_components/Markdown';

interface Props {
  title: string;
  value: string;
  onChange: (value: string) => void;
  max: number;
  error?: string;
  disabled?: boolean;
  /** Alto máximo del editor antes de hacer scroll, en filas de texto. */
  maxRows?: number;
  placeholder?: string;
}

export function MarkdownField({
  title,
  value,
  onChange,
  max,
  error,
  disabled = false,
  maxRows = 16,
  placeholder,
}: Props) {
  const [preview, setPreview] = useState(false);

  return (
    <Stack spacing={1.5}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <Typography
            variant="caption"
            color={value.length > max ? 'error' : 'text.secondary'}
          >
            {value.length} / {max}
          </Typography>

          <ToggleButtonGroup
            value={preview ? 'preview' : 'write'}
            exclusive
            size="small"
            onChange={(_, next: string | null) => {
              if (next) setPreview(next === 'preview');
            }}
          >
            <ToggleButton value="write" aria-label="Escribir">
              <EditIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="preview" aria-label="Previsualizar">
              <VisibilityIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {preview ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            // El mismo alto que el editor, para que alternar no dé saltos.
            minHeight: `${maxRows * 1.5}em`,
            maxHeight: `${maxRows * 1.5}em`,
            overflowY: 'auto',
          }}
        >
          {value.trim() === '' ? (
            <Typography variant="body2" color="text.secondary">
              Nada que previsualizar.
            </Typography>
          ) : (
            <Markdown>{value}</Markdown>
          )}
        </Paper>
      ) : (
        <TextField
          value={value}
          onChange={(e) => onChange(e.target.value)}
          error={Boolean(error)}
          helperText={error}
          placeholder={placeholder}
          disabled={disabled}
          multiline
          minRows={maxRows}
          maxRows={maxRows}
          fullWidth
        />
      )}

      {!preview && (
        <Box>
          <Typography variant="caption" color="text.secondary">
            Acepta Markdown: **negrita**, ## títulos, - listas, [enlaces](url)
          </Typography>
        </Box>
      )}
    </Stack>
  );
}
