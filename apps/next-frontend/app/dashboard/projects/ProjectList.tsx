'use client';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import {
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
}

export function ProjectList({ projects, onCreate, onEdit, onDelete }: Props) {
  return (
    <Stack spacing={2}>
      <Box>
        <Button onClick={onCreate} startIcon={<AddIcon />} variant="contained">
          Nuevo proyecto
        </Button>
      </Box>

      {projects.length === 0 && (
        <Typography color="text.secondary">
          Todavía no hay proyectos. Crea el primero.
        </Typography>
      )}

      {projects.map((project) => (
        <Card key={project.slug} variant="outlined">
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

              <Stack direction="row">
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
