export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface ApiResponse<T = unknown> {
  code: number;
  data: T | null;
  message: string;
  errors: ApiErrorDetail[] | null;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface IssuedToken {
  token: string;
}

export interface ProjectAssetProps {
  kind: string;
  url: string;
  label: string | null;
  position: number;
}

export interface ProjectProps {
  id: number;
  userId: number;
  slug: string;
  title: string;
  description: string | null;
  startedAt: string | null;
  endedAt: string | null;
  published: boolean;
  position: number;
  assets: ProjectAssetProps[];
  createdAt: string;
  updatedAt: string;
}

export type CreateProjectBody = Pick<ProjectProps, 'slug' | 'title'> &
  Partial<
    Pick<
      ProjectProps,
      | 'description'
      | 'startedAt'
      | 'endedAt'
      | 'published'
      | 'position'
      | 'assets'
    >
  >;

export type UpdateProjectBody = Partial<CreateProjectBody>;
