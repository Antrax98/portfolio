import { Type } from 'class-transformer';
import { IsParsableUrl } from '../../../../common/validators/is-parsable-url.validator';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ProfileLinkProps,
  ProfileProps,
} from '../../domain/interfaces/profile.interface';
import { LINK_KINDS } from '../../domain/value-objects/profile-link.value-object';

export class ProfileLinkDto implements ProfileLinkProps {
  @IsIn(LINK_KINDS)
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

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  headline?: string | null;

  /** Markdown. El cliente lo renderiza; el servidor guarda la fuente. */
  @IsOptional()
  @IsString()
  bio?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  location?: string | null;

  @IsOptional()
  @IsEmail()
  publicEmail?: string | null;

  @IsOptional()
  @IsUrl()
  avatarUrl?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProfileLinkDto)
  links?: ProfileLinkDto[];
}

export class ProfileDto implements ProfileProps {
  id: number;
  userId: number;
  fullName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  publicEmail: string | null;
  avatarUrl: string | null;
  links: ProfileLinkDto[];
  updatedAt: Date;
}
