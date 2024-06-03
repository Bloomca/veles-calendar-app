import { createStore } from "zustand/vanilla";
import { createState } from "veles";

import { Task } from "./types";

type StoreState = {
  initialized: boolean;
  tasks: Task[];
  addTask: (tasks: Task | Task[]) => void;
};

export const store = createStore<StoreState>((set) => ({
  initialized: false,
  tasks: [],
  addTask: (tasks) => {
    set((state) => ({ tasks: state.tasks.concat(tasks) }));
  },
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
        setStoreValue(() => newValue);
      }
    });

    return unsubscribe;
  });
}
