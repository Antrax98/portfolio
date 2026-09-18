import CodeIcon from '@mui/icons-material/Code';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import type { SvgIconComponent } from '@mui/icons-material';
import {
  siBitbucket,
  siCodeberg,
  siForgejo,
  siGitea,
  siGithub,
  siGitlab,
  siSwagger,
} from 'simple-icons';
import type { ProjectAsset } from '@/lib/api/schemas';
import { brandIcon } from './BrandIcon';

interface AssetLook {
  icon: SvgIconComponent;
  label: string;
}

/**
 * La forja se deduce del dominio, no de un `kind` propio: para el backend todos
 * son `repository`. Añadir una forja es una línea aquí, sin migración.
 */
const FORGES: { match: RegExp; look: AssetLook }[] = [
  {
    match: /github\.com/i,
    look: { icon: brandIcon(siGithub), label: 'GitHub' },
  },
  { match: /gitlab\./i, look: { icon: brandIcon(siGitlab), label: 'GitLab' } },
  {
    match: /codeberg\.org/i,
    look: { icon: brandIcon(siCodeberg), label: 'Codeberg' },
  },
  {
    match: /bitbucket\.org/i,
    look: { icon: brandIcon(siBitbucket), label: 'Bitbucket' },
  },
  {
    match: /forgejo|forge\./i,
    look: { icon: brandIcon(siForgejo), label: 'Forgejo' },
  },
  { match: /gitea/i, look: { icon: brandIcon(siGitea), label: 'Gitea' } },
];

const DOC_HINTS: { match: RegExp; look: AssetLook }[] = [
  {
    match: /swagger|\/api-json|openapi/i,
    look: { icon: brandIcon(siSwagger), label: 'Swagger' },
  },
];

const DEFAULTS: Record<ProjectAsset['kind'], AssetLook> = {
  repository: { icon: CodeIcon, label: 'Repositorio' },
  demo: { icon: RocketLaunchIcon, label: 'Demo' },
  doc: { icon: MenuBookIcon, label: 'Documentación' },
  video: { icon: OpenInNewIcon, label: 'Video' },
  image: { icon: OpenInNewIcon, label: 'Imagen' },
};

export function lookFor(asset: ProjectAsset): AssetLook {
  const hints = asset.kind === 'repository' ? FORGES : DOC_HINTS;
  const hint = hints.find((h) => h.match.test(asset.url));

  const base = hint?.look ?? DEFAULTS[asset.kind];

  // Un label explícito del backend siempre gana al deducido.
  return { icon: base.icon, label: asset.label ?? base.label };
}
