import { createState } from "veles";

import { Calendar } from "./calendar/calendar";
import { ListView } from "./list-view";
import { createStoreState } from "./store";

import type { State } from "veles";
import type { ViewSettings } from "./types";

function Content() {
  const viewSettings = createState<ViewSettings>({
    type: "calendar",
  });
  return (
    <div>
      <ProjectHeader viewSettings={viewSettings} />
      {viewSettings.useValueSelector(
        (settings) => settings.type,
        (type) => (type === "calendar" ? <Calendar /> : <ListView />)
      )}
    </div>
  );
}

function ProjectHeader({
  viewSettings,
}: {
  viewSettings: State<ViewSettings>;
}) {
  const activeProjectState = createStoreState((state) => {
    const projectActiveId = state.activeProject;

    const activeProject = state.projects[projectActiveId];

    if (!activeProject) {
      return "";
    }

    return activeProject.name;
  });

  return (
    <div class="project-header-container">
      <h1>{activeProjectState.useValue()}</h1>
      <Settings viewSettings={viewSettings} />
    </div>
  );
}

function Settings({ viewSettings }: { viewSettings: State<ViewSettings> }) {
  return (
    <div class="settings-container">
      <div>
        <button
          class={viewSettings.useAttribute((settings) =>
            settings.type === "list"
              ? "view-type-button active"
              : "view-type-button"
          )}
          onClick={() =>
            viewSettings.setValue((currentValue) => ({
              ...currentValue,
              type: "list",
            }))
          }
        >
          List view
        </button>
        <button
          class={viewSettings.useAttribute((settings) =>
            settings.type === "calendar"
              ? "view-type-button active"
              : "view-type-button"
          )}
          onClick={() =>
            viewSettings.setValue((currentValue) => ({
              ...currentValue,
              type: "calendar",
            }))
          }
        >
          Calendar view
        </button>
      </div>
    </div>
  );
}

export { Content };
