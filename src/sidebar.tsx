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
      <h3>Projects</h3>
      <ul>
        {projectsState.renderEach<Project>(
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
  const combinedState = projectState.combine(activeState);
  const tasksState = createStoreState((state) => state.tasks);
  const tasksCombinedState = projectState.combine(tasksState);

  return (
    <li
      onClick={() => {
        store.getState().setActiveProject(projectState.get().id);
      }}
      class={combinedState.attribute(([project, activeProjectId]) =>
        project.id === activeProjectId
          ? "sidebar-project active"
          : "sidebar-project"
      )}
    >
      {projectState.renderSelected((project) => project.name)}

      <div class="sidebar-project-count">
        {tasksCombinedState.renderSelected(
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
