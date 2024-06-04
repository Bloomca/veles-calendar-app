import { createState } from "veles";

import type { State } from "veles";

function selectState<F, T>(
  state: State<F>,
  selector: (state: F) => T
): State<T> {
  const initialValue = selector(state.getValue());

  const newState = createState(initialValue);
  state.trackValueSelector(
    selector,
    (selectedState) => {
      newState.setValue(selectedState);
    },
    { skipFirstCall: true }
  );

  return newState;
}

export { selectState };
