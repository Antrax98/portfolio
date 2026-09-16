import type { components } from './generated';

export type LoginBody = components['schemas']['LoginDto'];
export type RegisterBody = components['schemas']['RegisterDto'];
export type IssuedToken = components['schemas']['TokenDto'];
export type CredentialSummary = components['schemas']['CredentialSummaryDto'];

export type Portfolio = components['schemas']['PortfolioDto'];
export type Profile = components['schemas']['ProfileDto'];
export type ProfileLink = components['schemas']['ProfileLinkDto'];
export type Project = components['schemas']['ProjectDto'];
export type ProjectAsset = components['schemas']['ProjectAssetDto'];

export type LinkKind = ProfileLink['kind'];
export type AssetKind = ProjectAsset['kind'];

export type CreateProjectBody = components['schemas']['CreateProjectDto'];
export type UpdateProjectBody = components['schemas']['UpdateProjectDto'];
export type UpdateProfileBody = components['schemas']['UpdateProfileDto'];
