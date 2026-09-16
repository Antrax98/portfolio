export interface UserProps {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export type UserNewProps = Pick<UserProps, 'username' | 'email'>;

export interface UserFilterProps {
  id?: number;
  email?: string;
}
