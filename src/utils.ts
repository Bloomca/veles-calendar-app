import type { State } from "veles";

function selectState<F, T>(state: State<F>, selector: (state: F) => T): State<T> {
  return state.map(selector);
}

export { selectState };
