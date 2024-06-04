import { addOneTask } from "./generate-data";

export function InlineGenerator() {
  return (
    <div>
      <button
        onClick={() => {
          addOneTask();
        }}
      >
        Add a random task
      </button>
    </div>
  );
}
