import { Box, Button } from '@mui/material';
import type { ProjectAsset } from '@/lib/api/schemas';

const FILE_EXTENSIONS = /\.(mp4|webm|ogg|mov)$/i;
const YOUTUBE =
  /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/;
const VIMEO = /vimeo\.com\/(\d+)/;

function embedUrl(url: string): string | null {
  const youtube = YOUTUBE.exec(url);
  // nocookie: no deja cookies de seguimiento hasta que el visitante le da al play.
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}`;

  const vimeo = VIMEO.exec(url);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;

  return null;
}

export function VideoPlayer({ asset }: { asset: ProjectAsset }) {
  if (FILE_EXTENSIONS.test(asset.url)) {
    return (
      <Box
        component="video"
        controls
        preload="metadata"
        src={asset.url}
        sx={{ width: '100%', borderRadius: 1, display: 'block' }}
      />
    );
  }

  const embed = embedUrl(asset.url);

  if (embed) {
    return (
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          component="iframe"
          src={embed}
          title={asset.label ?? 'Video'}
          allow="accelerometer; clipboard-write; encrypted-media; picture-in-picture"
          allowFullScreen
          sx={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </Box>
    );
  }

  return (
    <Button
      variant="outlined"
      href={asset.url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {asset.label ?? 'Ver video'}
    </Button>
  );
}
