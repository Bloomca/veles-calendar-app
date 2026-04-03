import { createState } from "veles";

import { Calendar } from "./calendar/calendar";
import { ListView } from "./list-view";
import { BoardView } from "./board-view";
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
      {viewSettings.renderSelected((settings) => settings.type, (type) => {
        if (type === "calendar") {
          return <Calendar />;
        }

        if (type === "board") {
          return <BoardView />;
        }

        return <ListView />;
      })}
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
      <h1>{activeProjectState.render()}</h1>
      <Settings viewSettings={viewSettings} />
    </div>
  );
}

function Settings({ viewSettings }: { viewSettings: State<ViewSettings> }) {
  return (
    <div class="settings-container">
      <div>
        <button
          class={viewSettings.attribute((settings) =>
            settings.type === "list"
              ? "view-type-button active"
              : "view-type-button"
          )}
          onClick={() =>
            viewSettings.update((currentValue) => ({
              ...currentValue,
              type: "list",
            }))
          }
        >
          List view
        </button>
        <button
          class={viewSettings.attribute((settings) =>
            settings.type === "board"
              ? "view-type-button active"
              : "view-type-button"
          )}
          onClick={() =>
            viewSettings.update((currentValue) => ({
              ...currentValue,
              type: "board",
            }))
          }
        >
          Board
        </button>
        <button
          class={viewSettings.attribute((settings) =>
            settings.type === "calendar"
              ? "view-type-button active"
              : "view-type-button"
          )}
          onClick={() =>
            viewSettings.update((currentValue) => ({
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
