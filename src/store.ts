import { createStore } from "zustand/vanilla";
import { createState } from "veles";

import { Task, Project, Section } from "./types";

type StoreState = {
  initialized: boolean;
  activeProject: number;
  tasks: { [id: number]: Task };
  projects: { [id: number]: Project };
  sections: { [id: number]: Section };
  addTask: (tasks: Task | Task[]) => void;
  completeTask: (taskId: Task["id"]) => void;
  addData: (data: {
    projects: { [id: number]: Project };
    sections: { [id: number]: Section };
    tasks: { [id: number]: Task };
  }) => void;
  setActiveProject: (newActiveProject: number) => void;
};

export const store = createStore<StoreState>((set, get) => ({
  initialized: false,
  activeProject: 0,
  tasks: {},
  projects: {},
  sections: {},
  addTask: (tasks) => {
    set((state) => {
      const newTasksState = (Array.isArray(tasks) ? tasks : [tasks]).reduce<
        StoreState["tasks"]
      >((acc, task) => {
        acc[task.id] = task;
        return acc;
      }, {});

      return { tasks: { ...state.tasks, ...newTasksState } };
    });
  },
  completeTask: (taskId) => {
    const task = get().tasks[taskId];
    if (task) {
      set((state) => {
        return {
          tasks: {
            ...state.tasks,
            [task.id]: {
              ...task,
              completed: true,
            },
          },
        };
      });
    }
  },
  addData: (data) => {
    set((state) => ({
      tasks: { ...state.tasks, ...data.tasks },
      sections: { ...state.sections, ...data.sections },
      projects: { ...state.projects, ...data.projects },
      activeProject: Number(Object.keys(data.projects)[0]),
    }));
  },
  setActiveProject: (newProjectId) =>
    set(() => ({ activeProject: newProjectId })),
}));

// @ts-expect-error
window.store = store;

const NO_VALUE = "NO_VALUE";

export function createStoreState<T>(selector: (state: StoreState) => T) {
  let prevValue: T | string = NO_VALUE;
  const initialValue = selector(store.getState());
  return createState(initialValue, (setStoreValue) => {
    const unsubscribe = store.subscribe((newState) => {
      const newValue = selector(newState);

      if (newValue !== prevValue) {
        prevValue = newValue;
        setStoreValue(newValue);
      }
    });

    return unsubscribe;
  });
}
