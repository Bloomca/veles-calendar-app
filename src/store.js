import { createStore } from "zustand/vanilla";
import { createState } from "veles";

export const store = createStore((set) => ({
  initialized: false,
  tasks: [],
  addTask: (tasks) => {
    set((state) => ({ tasks: state.tasks.concat(tasks) }));
  },
}));

window.store = store;

const NO_VALUE = "NO_VALUE";

export function createStoreState(selector) {
  let prevValue = NO_VALUE;
  const initialValue = selector(store.getState());
  return createState(initialValue, (setStoreValue) => {
    const unsubscribe = store.subscribe((newState, prevState) => {
      const newValue = selector(newState);

      if (newValue !== prevValue) {
        prevValue = newValue;
        setStoreValue(() => newValue);
      }
    });

    return unsubscribe;
  });
}
