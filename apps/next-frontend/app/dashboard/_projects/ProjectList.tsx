'use client';

import AddIcon from '@mui/icons-material/Add';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';
import type { Project } from '@/lib/api/schemas';
import { excerpt } from '@/lib/assets';

interface Props {
  projects: Project[];
  onCreate: () => void;
  onEdit: (slug: string) => void;
  onDelete: (project: Project) => void;
  onMove: (index: number, delta: -1 | 1) => void;
  /** El orden en pantalla ya no es el guardado. */
  orderChanged: boolean;
  onSaveOrder: () => void;
  onDiscardOrder: () => void;
  savingOrder: boolean;
}

export function ProjectList({
  projects,
  onCreate,
  onEdit,
  onDelete,
  onMove,
  orderChanged,
  onSaveOrder,
  onDiscardOrder,
  savingOrder,
}: Props) {
  return (
    <Stack spacing={2}>
      <Box>
        <Button onClick={onCreate} startIcon={<AddIcon />} variant="contained">
          Nuevo proyecto
        </Button>
      </Box>

      {/*
        Las flechas solo reordenan en pantalla; guardar es un paso aparte, igual
        que en los enlaces del perfil. Cada movimiento son varias peticiones —una
        por proyecto que cambia de sitio— y mandarlas en cada clic llenaría la red
        de escrituras que el siguiente clic deja obsoletas.
      */}
      {orderChanged && (
        <Alert
          severity="info"
          action={
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                color="inherit"
                onClick={onDiscardOrder}
                disabled={savingOrder}
              >
                Descartar
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={onSaveOrder}
                disabled={savingOrder}
              >
                {savingOrder ? 'Guardando...' : 'Guardar orden'}
              </Button>
            </Stack>
          }
        >
          Cambiaste el orden y todavía no está guardado.
        </Alert>
      )}

      {projects.length === 0 && (
        <Typography color="text.secondary">
          Todavía no hay proyectos. Crea el primero.
        </Typography>
      )}

      {projects.map((project, index) => (
        <Card key={project.id} variant="outlined">
          <CardContent>
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
            >
              <Stack spacing={1} sx={{ minWidth: 0 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {project.title}
                  </Typography>

                  <Chip
                    label={project.published ? 'Publicado' : 'Borrador'}
                    size="small"
                    color={project.published ? 'primary' : 'default'}
                    variant={project.published ? 'filled' : 'outlined'}
                  />
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  /{project.slug} · {project.assets.length} recurso
                  {project.assets.length === 1 ? '' : 's'}
                </Typography>

                {project.description && (
                  <Typography variant="body2" color="text.secondary">
                    {excerpt(project.description, 120)}
                  </Typography>
                )}
              </Stack>

              <Stack direction="row" sx={{ alignItems: 'center' }}>
                <IconButton
                  onClick={() => onMove(index, -1)}
                  aria-label={`Subir ${project.title}`}
                  size="small"
                  disabled={index === 0 || savingOrder}
                >
                  <ArrowUpwardIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() => onMove(index, 1)}
                  aria-label={`Bajar ${project.title}`}
                  size="small"
                  disabled={index === projects.length - 1 || savingOrder}
                >
                  <ArrowDownwardIcon fontSize="small" />
                </IconButton>

                <Box sx={{ width: 8 }} />

                <IconButton
                  onClick={() => onEdit(project.slug)}
                  aria-label={`Editar ${project.title}`}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>

                <IconButton
                  onClick={() => onDelete(project)}
                  aria-label={`Eliminar ${project.title}`}
                  size="small"
                >
                  <DeleteOutlinedIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
