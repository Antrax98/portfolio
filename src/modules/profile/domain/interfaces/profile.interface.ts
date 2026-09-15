export interface ProfileLinkProps {
  kind: string;
  url: string;
  label: string | null;
  position: number;
}

export interface ProfileProps {
  id: number;
  userId: number;
  fullName: string;
  headline: string | null;
  bio: string | null;
  location: string | null;
  publicEmail: string | null;
  avatarUrl: string | null;
  links: ProfileLinkProps[];
  updatedAt: Date;
}

export type ProfileUpdateProps = Partial<
  Omit<ProfileProps, 'id' | 'userId' | 'updatedAt'>
>;
