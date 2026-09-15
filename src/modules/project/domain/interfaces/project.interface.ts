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
  startedAt: Date | null;
  endedAt: Date | null;
  published: boolean;
  position: number;
  assets: ProjectAssetProps[];
  createdAt: Date;
  updatedAt: Date;
}

export type ProjectNewProps = Pick<ProjectProps, 'slug' | 'title'> &
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

export type ProjectUpdateProps = Partial<
  Omit<ProjectProps, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
>;
