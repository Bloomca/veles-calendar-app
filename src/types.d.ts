export type Project = {
  id: number;
  name: string;
};

export type Section = {
  id: number;
  name: string;
  projectId: number;
};

export type Task = {
  id: number;
  title: string;
  dueDate: Date;
  priority: 1 | 2 | 3 | 4;
  projectId: number;
  sectionId: number | null;
};
