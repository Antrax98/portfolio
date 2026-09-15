import type { components } from '../api-types';

export type LoginBody = components['schemas']['LoginDto'];
export type RegisterBody = components['schemas']['RegisterDto'];
export type IssuedToken = components['schemas']['TokenDto'];
export type CredentialSummary = components['schemas']['CredentialSummaryDto'];