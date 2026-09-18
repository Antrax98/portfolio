import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function Markdown({ children }: { children: string }) {
  return (
    <Box
      sx={{
        '& > :first-of-type': { mt: 0 },
        '& > :last-child': { mb: 0 },
        '& p': { my: 1 },
        '& h1, & h2, & h3': { mt: 3, mb: 1, fontWeight: 600 },
        '& ul, & ol': { pl: 3, my: 1 },
        '& li': { mb: 0.5 },
        '& a': { color: 'primary.main' },
        '& code': {
          fontFamily: 'monospace',
          fontSize: '0.9em',
          bgcolor: 'action.hover',
          px: 0.5,
          borderRadius: 0.5,
        },
        '& pre': {
          bgcolor: 'action.hover',
          p: 2,
          borderRadius: 1,
          overflowX: 'auto',
        },
        '& pre code': { bgcolor: 'transparent', px: 0 },
        '& blockquote': {
          borderLeft: 3,
          borderColor: 'divider',
          pl: 2,
          ml: 0,
          color: 'text.secondary',
        },
        '& table': { borderCollapse: 'collapse', my: 2 },
        '& th, & td': { border: 1, borderColor: 'divider', px: 1, py: 0.5 },
      }}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </Box>
  );
}
