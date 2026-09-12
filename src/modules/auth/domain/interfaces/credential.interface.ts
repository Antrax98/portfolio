export interface CredentialProps {
  id: number;
  userId: number;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CredentialNewProps = Pick<
  CredentialProps,
  'userId' | 'passwordHash'
>;

export interface CredentialSummary {
  userId: number;
  createdAt: Date;
}
