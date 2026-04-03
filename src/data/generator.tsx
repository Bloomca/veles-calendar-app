import { createState } from "veles";
import { generateData } from "./generate-data";
import { store } from "../store";

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
            tasksNumber: Number(tasksPerMonthState.get()),
            monthsNumber: Number(monthsState.get()),
            projectsNumber: Number(projectsState.get()),
            sectionsNumber: Number(sectionsState.get()),
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
            onInput={(e) => tasksPerMonthState.set(e.target?.value)}
            value={tasksPerMonthState.attribute()}
          />
        </label>
        <label>
          <span>Fill months with tasks (starting with the current month):</span>
          <input
            type="number"
            name="monthsNumber"
            onInput={(e) => monthsState.set(e.target?.value)}
            value={monthsState.attribute()}
          />
        </label>
        <label>
          <span>Number of projects:</span>
          <input
            type="number"
            name="projectsNumber"
            onInput={(e) => projectsState.set(e.target?.value)}
            value={projectsState.attribute()}
          />
        </label>
        <label>
          <span>Number of sections per project:</span>
          <input
            type="number"
            name="sectionsNumber"
            onInput={(e) => sectionsState.set(e.target?.value)}
            value={sectionsState.attribute()}
          />
        </label>

        <button type="submit">Generate</button>
      </form>
    </div>
  );
}

export { DataGenerator };
