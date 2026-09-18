import { Type } from 'class-transformer';
import { PartialType } from '@nestjs/swagger';
import { IsParsableUrl } from '../../../../common/validators/is-parsable-url.validator';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ProjectAssetProps,
  ProjectProps,
} from '../../domain/interfaces/project.interface';
import { ASSET_KINDS } from '../../domain/value-objects/project-asset.value-object';
import { Page } from '../../../../common/interfaces/page.interface';

export class ProjectAssetDto implements ProjectAssetProps {
  @IsIn(ASSET_KINDS)
  kind: string;

  @IsParsableUrl()
  url: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  label: string | null;

  @IsInt()
  @Min(0)
  position: number;
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  slug: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  title: string;

  /** Markdown. El cliente lo renderiza; el servidor guarda la fuente. */
  @IsOptional()
  @IsString()
  description?: string | null;

  @IsOptional()
  @IsDateString()
  startedAt?: string | null;

  @IsOptional()
  @IsDateString()
  endedAt?: string | null;

  @IsOptional()
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  position?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectAssetDto)
  assets?: ProjectAssetDto[];
}

/**
 * Todo opcional: un PATCH manda solo lo que cambia.
 *
 * `PartialType` de @nestjs/swagger y no `extends CreateProjectDto` con campos
 * redeclarados: la redeclaración con `declare` no emite la propiedad, así que el
 * plugin no la veía y el spec seguía anunciando `slug` y `title` como
 * requeridos. Los tipos que genera el frontend salen de ese spec, así que la
 * mentira llegaba hasta allí.
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectDto implements ProjectProps {
  id: number;
  userId: number;
  slug: string;
  title: string;
  description: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  published: boolean;
  position: number;
  assets: ProjectAssetDto[];
  createdAt: Date;
  updatedAt: Date;
}

export class ProjectPageDto implements Page<ProjectProps> {
  items: ProjectDto[];

  total: number;
  page: number;
  size: number;
}
