import EmailIcon from '@mui/icons-material/Email';
import GitHubIcon from '@mui/icons-material/GitHub';
import LanguageIcon from '@mui/icons-material/Language';
import LinkIcon from '@mui/icons-material/Link';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import type { SvgIconComponent } from '@mui/icons-material';
import type { LinkKind } from '@/lib/api/schemas';

const ICONS: Record<LinkKind, SvgIconComponent> = {
  github: GitHubIcon,
  linkedin: LinkedInIcon,
  web: LanguageIcon,
  email: EmailIcon,
  other: LinkIcon,
};

export function iconFor(kind: LinkKind): SvgIconComponent {
  return ICONS[kind];
}
