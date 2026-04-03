import { createStore } from "zustand/vanilla";
import { createState } from "veles";

import { Task, Project, Section, LabelEntity } from "./types";

type StoreState = {
  initialized: boolean;
  activeProject: number;
  tasks: { [id: number]: Task };
  projects: { [id: number]: Project };
  sections: { [id: number]: Section };
  labels: { [id: number]: LabelEntity };
  addTask: (tasks: Task | Task[]) => void;
  completeTask: (taskId: Task["id"]) => void;
  moveTask: (options: {
    taskId: Task["id"];
    targetSectionId: Task["sectionId"];
    targetIndex: number;
  }) => void;
  updateTaskDueDate: (options: {
    taskId: Task["id"];
    dueDate: Date;
  }) => void;
  addData: (data: {
    projects: { [id: number]: Project };
    sections: { [id: number]: Section };
    tasks: { [id: number]: Task };
    labels: { [id: number]: LabelEntity };
  }) => void;
  setActiveProject: (newActiveProject: number) => void;
};

export const store = createStore<StoreState>((set, get) => ({
  initialized: false,
  activeProject: 0,
  tasks: {},
  projects: {},
  sections: {},
  labels: {},
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
  moveTask: ({ taskId, targetSectionId, targetIndex }) => {
    const currentTask = get().tasks[taskId];
    if (!currentTask) {
      return;
    }

    set((state) => {
      const sortTasksByOrder = (tasks: Task[]) =>
        [...tasks].sort((task1, task2) => task1.order - task2.order || task1.id - task2.id);

      const sourceSectionId = currentTask.sectionId;
      const sourceList = sortTasksByOrder(
        Object.values(state.tasks).filter(
          (task) =>
            task.projectId === currentTask.projectId &&
            task.sectionId === sourceSectionId &&
            task.id !== taskId
        )
      );
      const targetList = sortTasksByOrder(
        Object.values(state.tasks).filter(
          (task) =>
            task.projectId === currentTask.projectId &&
            task.sectionId === targetSectionId &&
            task.id !== taskId
        )
      );

      let normalizedTargetIndex = Math.max(
        0,
        Math.min(targetIndex, targetList.length)
      );

      if (sourceSectionId === targetSectionId) {
        const sourceListWithTask = sortTasksByOrder(
          Object.values(state.tasks).filter(
            (task) =>
              task.projectId === currentTask.projectId &&
              task.sectionId === sourceSectionId
          )
        );

        const sourceTaskIndex = sourceListWithTask.findIndex(
          (task) => task.id === taskId
        );

        if (sourceTaskIndex !== -1 && normalizedTargetIndex > sourceTaskIndex) {
          normalizedTargetIndex = normalizedTargetIndex - 1;
        }
      }

      const movedTask = {
        ...currentTask,
        sectionId: targetSectionId,
      };

      const nextTargetList = [
        ...targetList.slice(0, normalizedTargetIndex),
        movedTask,
        ...targetList.slice(normalizedTargetIndex),
      ];

      const updatedTasks = { ...state.tasks };

      if (sourceSectionId !== targetSectionId) {
        sourceList.forEach((task, index) => {
          updatedTasks[task.id] = {
            ...updatedTasks[task.id],
            order: index,
            sectionId: sourceSectionId,
          };
        });
      }

      nextTargetList.forEach((task, index) => {
        updatedTasks[task.id] = {
          ...updatedTasks[task.id],
          order: index,
          sectionId: targetSectionId,
        };
      });

      return {
        tasks: updatedTasks,
      };
    });
  },
  updateTaskDueDate: ({ taskId, dueDate }) => {
    const currentTask = get().tasks[taskId];

    if (!currentTask) {
      return;
    }

    set((state) => ({
      tasks: {
        ...state.tasks,
        [taskId]: {
          ...currentTask,
          dueDate,
        },
      },
    }));
  },
  addData: (data) => {
    set((state) => ({
      tasks: { ...state.tasks, ...data.tasks },
      sections: { ...state.sections, ...data.sections },
      projects: { ...state.projects, ...data.projects },
      labels: { ...state.labels, ...data.labels },
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
