import { createState } from "veles";
import { generateData } from "./generate-data";
import { store } from "./store";

function DataGenerator() {
  const tasksPerMonthState = createState("200");
  const monthsState = createState("3");
  const projectsState = createState("4");
  const sectionsState = createState("10");
  return (
    <div class="generator-container">
      <h1>Generate data</h1>
      <p>
        This will generate a lot of data to show in the application. Each
        project has sections, and each section has tasks.
      </p>
      <hr />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = {
            tasksNumber: Number(tasksPerMonthState.getValue()),
            monthsNumber: Number(monthsState.getValue()),
            projectsNumber: Number(projectsState.getValue()),
            sectionsNumber: Number(sectionsState.getValue()),
          };
          generateData(data);
          store.setState({ initialized: true });
          return false;
        }}
      >
        <label>
          <span>Tasks per month (for each project):</span>
          <input
            type="number"
            name="tasksNumber"
            // @ts-expect-error
            onInput={(e) => tasksPerMonthState.setValue(e.target?.value)}
            value={tasksPerMonthState.useAttribute()}
          />
        </label>
        <label>
          <span>Fill months with tasks (starting with the current month):</span>
          <input
            type="number"
            name="monthsNumber"
            // @ts-expect-error
            onInput={(e) => monthsState.setValue(e.target?.value)}
            value={monthsState.useAttribute()}
          />
        </label>
        <label>
          <span>Number of projects:</span>
          <input
            type="number"
            name="projectsNumber"
            // @ts-expect-error
            onInput={(e) => projectsState.setValue(e.target?.value)}
            value={projectsState.useAttribute()}
          />
        </label>
        <label>
          <span>Number of sections per project:</span>
          <input
            type="number"
            name="sectionsNumber"
            // @ts-expect-error
            onInput={(e) => sectionsState.setValue(e.target?.value)}
            value={sectionsState.useAttribute()}
          />
        </label>

        <button type="submit">Generate</button>
      </form>
    </div>
  );
}

export { DataGenerator };
