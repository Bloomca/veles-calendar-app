import { combineState } from "veles/utils";
import { createStoreState, store } from "./store";

import type { Project } from "./types";
import type { State } from "veles";

function Sidebar() {
  const projectsState = createStoreState((state) =>
    Object.values(state.projects)
  );
  const activeProjectState = createStoreState((state) => state.activeProject);

  return (
    <div class="sidebar">
      List of projects:
      <ul>
        {projectsState.useValueIterator<Project>(
          { key: "id" },
          ({ elementState }) => (
            <SidebarProject
              projectState={elementState}
              activeState={activeProjectState}
            />
          )
        )}
      </ul>
    </div>
  );
}

function SidebarProject({
  projectState,
  activeState,
}: {
  projectState: State<Project>;
  activeState: State<number>;
}) {
  const combinedState = combineState(projectState, activeState);
  const tasksState = createStoreState((state) => state.tasks);
  const tasksCombinedState = combineState(projectState, tasksState);

  return (
    <li
      onClick={() => {
        store.getState().setActiveProject(projectState.getValue().id);
      }}
      class={combinedState.useAttribute(([project, activeProjectId]) =>
        project.id === activeProjectId
          ? "sidebar-project active"
          : "sidebar-project"
      )}
    >
      {projectState.useValueSelector((project) => project.name)}

      <div class="sidebar-project-count">
        {tasksCombinedState.useValueSelector(
          ([project, tasks]) =>
            Object.values(tasks).filter(
              (task) => !task.completed && task.projectId === project.id
            ).length
        )}
      </div>
    </li>
  );
}

export { Sidebar };
