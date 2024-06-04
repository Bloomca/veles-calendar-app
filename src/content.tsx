import { Calendar } from "./calendar";
import { InlineGenerator } from "./inline-generator";
import { createStoreState } from "./store";

function Content() {
  return (
    <div>
      <ProjectHeader />
      <InlineGenerator />
      <Calendar />
    </div>
  );
}

function ProjectHeader() {
  const activeProjectState = createStoreState((state) => {
    const projectActiveId = state.activeProject;

    const activeProject = state.projects[projectActiveId];

    if (!activeProject) {
      return "";
    }

    return activeProject.name;
  });

  return (
    <div>
      <h1>{activeProjectState.useValue()}</h1>
    </div>
  );
}

export { Content };
