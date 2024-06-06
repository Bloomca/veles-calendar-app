import { combineState, selectState } from "veles/utils";
import { createStoreState } from "./store";

import type { Section, Task } from "./types";
import type { State } from "veles";

function ListView() {
  const sectionsState = createStoreState((state) => {
    const activeProjectId = state.activeProject;
    return Object.values(state.sections).filter(
      (section) => section.projectId === activeProjectId
    );
  });

  return (
    <div class="list-view-container">
      <NoSection />
      {sectionsState.useValueIterator<Section>(
        { key: "id" },
        ({ elementState }) => (
          <Section sectionState={elementState} />
        )
      )}
    </div>
  );
}

function NoSection() {
  const tasksState = createStoreState((state) => {
    const activeProjectId = state.activeProject;

    return Object.values(state.tasks).filter(
      (task) => task.projectId === activeProjectId && !task.sectionId
    );
  });

  return (
    <div>
      <TaskList tasksState={tasksState} />
    </div>
  );
}

function Section({ sectionState }: { sectionState: State<Section> }) {
  const tasksState = createStoreState((state) => state.tasks);
  const sectionTasksState = selectState(
    combineState(tasksState, sectionState),
    ([tasks, section]) =>
      Object.values(tasks).filter(
        (task) =>
          task.sectionId === section.id && task.projectId === section.projectId
      )
  );

  return (
    <div>
      <h2>{sectionState.useValueSelector((section) => section.name)}</h2>
      <TaskList tasksState={sectionTasksState} />
    </div>
  );
}

function TaskList({ tasksState }: { tasksState: State<Task[]> }) {
  return (
    <div>
      {tasksState.useValueIterator<Task>({ key: "id" }, ({ elementState }) => (
        <Task taskState={elementState} />
      ))}
    </div>
  );
}

function Task({ taskState }: { taskState: State<Task> }) {
  return (
    <div class="task-list-task-container">
      <div
        class={taskState.useAttribute(
          (task) => `task-complete task-priority-${task.priority}`
        )}
      ></div>
      {taskState.useValueSelector((task) => task.title)}
    </div>
  );
}

export { ListView };
