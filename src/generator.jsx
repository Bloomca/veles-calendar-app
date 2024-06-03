import { createState } from "veles";
import { generateTasks } from "./generate-tasks";
import { store } from "./store";

function DataGenerator() {
  const numberState = createState(300);
  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          generateTasks(numberState.getValue());
          store.setState({ initialized: true });
          return false;
        }}
      >
        <input
          type="number"
          name="tasksNumber"
          onInput={(e) => numberState.setValue(() => Number(e.target.value))}
          value={numberState.useAttribute((value) => String(value))}
        />
        <button type="submit">Generate</button>
      </form>
    </div>
  );
}

export { DataGenerator };
