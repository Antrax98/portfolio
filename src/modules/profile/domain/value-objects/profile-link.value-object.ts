import { DomainErrorCollector } from '../../../../common/domain/error-collector';
import { ProfileLinkProps } from '../interfaces/profile.interface';

export const LINK_KINDS = [
  'github',
  'linkedin',
  'web',
  'email',
  'other',
] as const;

export type LinkKind = (typeof LINK_KINDS)[number];

const MAX_LABEL = 120;

export class ProfileLink {
  private constructor(
    private readonly kind: LinkKind,
    private readonly url: string,
    private readonly label: string | null,
    private readonly position: number,
  ) {}

  static create(
    props: ProfileLinkProps,
    position: number,
    errors: DomainErrorCollector,
  ): ProfileLink | null {
    const field = `links[${position}]`;
    let valid = true;

    if (!LINK_KINDS.includes(props.kind as LinkKind)) {
      errors.add(`${field}.kind`, `Unknown link kind: ${props.kind}`);
      valid = false;
    }

    if (typeof props.url !== 'string' || !URL.canParse(props.url)) {
      errors.add(`${field}.url`, `"${props.url}" is not a valid URL`);
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

    return new ProfileLink(
      props.kind as LinkKind,
      props.url.trim(),
      label,
      position,
    );
  }

  toProps(): ProfileLinkProps {
    return {
      kind: this.kind,
      url: this.url,
      label: this.label,
      position: this.position,
    };
  }
}
