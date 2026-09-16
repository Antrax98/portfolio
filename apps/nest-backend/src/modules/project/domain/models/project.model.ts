import { DomainErrorCollector } from '../../../../common/domain/error-collector';
import { ForbiddenException } from '../../../../common/exceptions/forbidden.exception';
import { AuthenticatedCaller } from '../../../auth/domain/interfaces/auth.interface';
import {
  ProjectProps,
  ProjectUpdateProps,
} from '../interfaces/project.interface';
import { ProjectAsset } from '../value-objects/project-asset.value-object';

const MAX_ASSETS = 20;
const MAX_TITLE = 140;
const MAX_SLUG = 140;
const MAX_DESCRIPTION = 10_000;
const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const INVALID_PROJECT = 'The project could not be saved: some data is invalid';

export class Project {
  static assertOwnedBy(
    project: ProjectProps,
    caller: AuthenticatedCaller,
  ): void {
    if (project.userId !== caller.userId) {
      throw new ForbiddenException('You cannot modify this project');
    }
  }

  static validate(changes: ProjectUpdateProps): ProjectUpdateProps {
    const errors = new DomainErrorCollector();

    const slug = Project.normalize(changes.slug)?.toLowerCase();
    if (slug !== undefined) {
      if (!slug || !SLUG_SHAPE.test(slug)) {
        errors.add('slug', 'Slug must be lowercase words separated by hyphens');
      } else if (slug.length > MAX_SLUG) {
        errors.add('slug', `Slug cannot be longer than ${MAX_SLUG} characters`);
      }
    }

    const title = Project.normalize(changes.title);
    if (title !== undefined) {
      if (!title) {
        errors.add('title', 'Title cannot be empty');
      } else if (title.length > MAX_TITLE) {
        errors.add(
          'title',
          `Title cannot be longer than ${MAX_TITLE} characters`,
        );
      }
    }

    const description = Project.normalizeMarkdown(changes.description);
    if (
      description !== undefined &&
      description !== null &&
      description.length > MAX_DESCRIPTION
    ) {
      errors.add(
        'description',
        `Description cannot be longer than ${MAX_DESCRIPTION} characters`,
      );
    }

    if (
      changes.startedAt != null &&
      changes.endedAt != null &&
      changes.endedAt < changes.startedAt
    ) {
      errors.add('endedAt', 'End date cannot be before the start date');
    }

    const normalized: ProjectUpdateProps = {
      ...changes,
      ...(slug !== undefined ? { slug: slug ?? '' } : {}),
      ...(title !== undefined ? { title: title ?? '' } : {}),
      ...(description !== undefined ? { description } : {}),
    };

    if (changes.assets === undefined) {
      errors.throwIfAny(INVALID_PROJECT);
      return normalized;
    }

    if (changes.assets.length > MAX_ASSETS) {
      errors.add(
        'assets',
        `A project cannot have more than ${MAX_ASSETS} assets`,
      );
    }

    const built = changes.assets.map((asset, index) =>
      ProjectAsset.create(asset, index, errors),
    );

    errors.throwIfAny(INVALID_PROJECT);

    return {
      ...normalized,
      assets: built
        .filter((asset): asset is ProjectAsset => asset !== null)
        .map((asset) => asset.toProps()),
    };
  }

  private static normalize(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) return undefined;
    return value?.trim() || null;
  }

  private static normalizeMarkdown(
    value: string | null | undefined,
  ): string | null | undefined {
    if (value === undefined) return undefined;
    return value?.replace(/\r\n/g, '\n').trim() || null;
  }
}
