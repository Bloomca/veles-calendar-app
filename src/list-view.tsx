import { createStoreState, store } from "./store";
import { InlineGenerator } from "./inline-generator";

import type { LabelEntity, Section, Task } from "./types";
import type { State } from "veles";

function ListView() {
  const sectionsState = createStoreState((state) => {
    const activeProjectId = state.activeProject;
    return Object.values(state.sections).filter(
      (section) => section.projectId === activeProjectId
    );
  });

  return (
    <div>
      <InlineGenerator
        getMonth={() => new Date().getMonth()}
        getYear={() => new Date().getFullYear()}
      />
      <div class="list-view-container">
        <NoSection />
        {sectionsState.renderEach<Section>({ key: "id" }, ({ elementState }) => (
          <Section sectionState={elementState} />
        ))}
      </div>
    </div>
  );
}

function NoSection() {
  const tasksState = createStoreState((state) => {
    const activeProjectId = state.activeProject;

    return Object.values(state.tasks).filter(
      (task) =>
        !task.completed && task.projectId === activeProjectId && !task.sectionId
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
  const sectionTasksState = tasksState
    .combine(sectionState)
    .map(([tasks, section]) => {
      return Object.values(tasks).filter(
        (task) =>
          !task.completed &&
          task.sectionId === section.id &&
          task.projectId === section.projectId
      );
    });

  return (
    <div>
      <h2>{sectionState.renderSelected((section) => section.name)}</h2>
      <TaskList tasksState={sectionTasksState} />
    </div>
  );
}

function TaskList({ tasksState }: { tasksState: State<Task[]> }) {
  const labelsState = createStoreState((state) => state.labels);

  return (
    <div>
      {tasksState.renderEach<Task>({ key: "id" }, ({ elementState }) => (
        <Task taskState={elementState} labelsState={labelsState} />
      ))}
    </div>
  );
}

function Task({
  taskState,
  labelsState,
}: {
  taskState: State<Task>;
  labelsState: State<{ [id: number]: LabelEntity }>;
}) {
  const taskLabelsState = taskState.combine(labelsState).map(([task, labels]) =>
    task.labelIds
      .map((labelId) => labels[labelId])
      .filter((label): label is LabelEntity => Boolean(label))
  );

  return (
    <div class="task-list-task-container">
      <div
        class={taskState.attribute(
          (task) => `task-complete task-priority-${task.priority}`
        )}
        onClick={() => {
          store.getState().completeTask(taskState.get().id);
        }}
      />
      <div class="task-list-task-content">
        <div class="task-list-task-title">
          {taskState.renderSelected((task) => task.title)}
        </div>
        <TaskInfo taskLabelsState={taskLabelsState} />
      </div>
    </div>
  );
}

function TaskInfo({ taskLabelsState }: { taskLabelsState: State<LabelEntity[]> }) {
  return (
    <div class="task-list-task-info">
      {taskLabelsState.render((labels) =>
        labels.length > 0 ? (
          <div class="task-list-labels">
            {labels.map((label) => (
              <span class="task-label">{label.name}</span>
            ))}
          </div>
        ) : null
      )}
    </div>
  );
}

export { ListView };
