import { Box, Stack, Typography } from '@mui/material';
import type { ProjectAsset } from '@/lib/api/schemas';

export function ProjectGallery({ images }: { images: ProjectAsset[] }) {
  return (
    <Stack spacing={3}>
      {images.map((image) => (
        <Stack key={image.url} spacing={0.5}>
          <Box
            component="img"
            src={image.url}
            alt={image.label ?? ''}
            loading="lazy"
            sx={{
              width: '100%',
              borderRadius: 1,
              border: 1,
              borderColor: 'divider',
              display: 'block',
            }}
          />
          {image.label && (
            <Typography variant="caption" color="text.secondary">
              {image.label}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
}
