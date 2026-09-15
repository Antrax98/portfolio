import { DomainErrorCollector } from '../../../../common/domain/error-collector';
import {
  ProfileProps,
  ProfileUpdateProps,
} from '../interfaces/profile.interface';
import { ProfileLink } from '../value-objects/profile-link.value-object';

const MAX_LINKS = 10;
const MAX_BIO = 10_000;
const MAX_FULL_NAME = 120;
const INVALID_PROFILE = 'The profile could not be saved: some data is invalid';

export class Profile {
  static validateUpdate(changes: ProfileUpdateProps): ProfileUpdateProps {
    const errors = new DomainErrorCollector();

    const fullName = Profile.normalizeText(changes.fullName);
    if (fullName !== undefined) {
      if (fullName === null || fullName.length === 0) {
        errors.add('fullName', 'Full name cannot be empty');
      } else if (fullName.length > MAX_FULL_NAME) {
        errors.add(
          'fullName',
          `Full name cannot be longer than ${MAX_FULL_NAME} characters`,
        );
      }
    }

    const bio = Profile.normalizeBio(changes.bio);
    if (bio !== undefined && bio !== null && bio.length > MAX_BIO) {
      errors.add('bio', `Bio cannot be longer than ${MAX_BIO} characters`);
    }

    const normalized: ProfileUpdateProps = {
      ...changes,
      ...(fullName !== undefined ? { fullName: fullName ?? '' } : {}),
      ...(bio !== undefined ? { bio } : {}),
      ...(changes.headline !== undefined
        ? { headline: Profile.normalizeText(changes.headline) ?? null }
        : {}),
      ...(changes.location !== undefined
        ? { location: Profile.normalizeText(changes.location) ?? null }
        : {}),
    };

    if (changes.links === undefined) {
      errors.throwIfAny(INVALID_PROFILE);
      return normalized;
    }

    if (changes.links.length > MAX_LINKS) {
      errors.add('links', `A profile cannot have more than ${MAX_LINKS} links`);
    }

    const built = changes.links.map((link, index) =>
      ProfileLink.create(link, index, errors),
    );

    errors.throwIfAny(INVALID_PROFILE);

    return {
      ...normalized,
      links: built
        .filter((link): link is ProfileLink => link !== null)
        .map((link) => link.toProps()),
    };
  }

  static empty(userId: number): ProfileProps {
    return {
      id: 0,
      userId,
      fullName: '',
      headline: null,
      bio: null,
      location: null,
      publicEmail: null,
      avatarUrl: null,
      links: [],
      updatedAt: new Date(),
    };
  }

  private static normalizeText(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) return undefined;
    return value?.trim() || null;
  }

  private static normalizeBio(
    bio: string | null | undefined,
  ): string | null | undefined {
    if (bio === undefined) return undefined;
    return bio?.replace(/\r\n/g, '\n').trim() || null;
  }
}
