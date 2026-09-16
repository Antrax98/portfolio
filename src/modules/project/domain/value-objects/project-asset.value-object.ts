import { DomainErrorCollector } from '../../../../common/domain/error-collector';
import { SAFE_URL_MESSAGE, isSafeUrl } from '../../../../common/domain/url';
import { ProjectAssetProps } from '../interfaces/project.interface';

export const ASSET_KINDS = [
  'repository',
  'demo',
  'image',
  'video',
  'doc',
] as const;

export type AssetKind = (typeof ASSET_KINDS)[number];

const MAX_LABEL = 120;

export class ProjectAsset {
  private constructor(
    private readonly kind: AssetKind,
    private readonly url: string,
    private readonly label: string | null,
    private readonly position: number,
  ) {}

  static create(
    props: ProjectAssetProps,
    position: number,
    errors: DomainErrorCollector,
  ): ProjectAsset | null {
    const field = `assets[${position}]`;
    let valid = true;

    if (!ASSET_KINDS.includes(props.kind as AssetKind)) {
      errors.add(`${field}.kind`, `Unknown asset kind: ${props.kind}`);
      valid = false;
    }

    if (!isSafeUrl(props.url)) {
      errors.add(`${field}.url`, `"${props.url}" ${SAFE_URL_MESSAGE}`);
      valid = false;
    }

    const label = props.label?.trim() || null;
    if (label !== null && label.length > MAX_LABEL) {
      errors.add(
        `${field}.label`,
        `Label cannot be longer than ${MAX_LABEL} characters`,
      );
      valid = false;
    }

    if (!valid) return null;

    return new ProjectAsset(
      props.kind as AssetKind,
      props.url.trim(),
      label,
      position,
    );
  }

  toProps(): ProjectAssetProps {
    return {
      kind: this.kind,
      url: this.url,
      label: this.label,
      position: this.position,
    };
  }
}
