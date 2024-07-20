import { addOneTask } from "./data/generate-data";

export function InlineGenerator({
  getMonth,
  getYear,
}: {
  getMonth?: () => number;
  getYear?: () => number;
}) {
  return (
    <div>
      <button
        onClick={() => {
          const month = getMonth?.();
          const year = getYear?.();
          addOneTask({ month, year });
        }}
      >
        Add a random task
      </button>
    </div>
  );
}
