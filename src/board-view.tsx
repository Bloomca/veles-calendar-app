import { createStoreState, store } from "./store";
import { InlineGenerator } from "./inline-generator";
import { TaskInfo } from "./task-info";

import type { LabelEntity, Section, Task } from "./types";
import type { State } from "veles";

function sortTasksByOrder(tasks: Task[]) {
  return [...tasks].sort(
    (task1, task2) => task1.order - task2.order || task1.id - task2.id
  );
}

function BoardView() {
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
      <div class="board-view-scroll-container">
        <div class="board-view-container">
          <NoSectionColumn />
          {sectionsState.renderEach<Section>({ key: "id" }, ({ elementState }) => (
            <SectionColumn sectionState={elementState} />
          ))}
        </div>
      </div>
    </div>
  );
}

function NoSectionColumn() {
  const tasksState = createStoreState((state) => {
    const activeProjectId = state.activeProject;

    return sortTasksByOrder(
      Object.values(state.tasks).filter(
        (task) =>
          !task.completed && task.projectId === activeProjectId && !task.sectionId
      )
    );
  });

  return <BoardColumn title="no section" tasksState={tasksState} />;
}

function SectionColumn({ sectionState }: { sectionState: State<Section> }) {
  const tasksState = createStoreState((state) => state.tasks);
  const sectionTasksState = tasksState
    .combine(sectionState)
    .map(([tasks, section]) => {
      return sortTasksByOrder(
        Object.values(tasks).filter(
          (task) =>
            !task.completed &&
            task.sectionId === section.id &&
            task.projectId === section.projectId
        )
      );
    });

  return (
    <div class="board-column">
      <h2 class="board-column-title">
        {sectionState.renderSelected((section) => section.name)}
      </h2>
      <BoardTaskList tasksState={sectionTasksState} />
    </div>
  );
}

function BoardColumn({
  title,
  tasksState,
}: {
  title: string;
  tasksState: State<Task[]>;
}) {
  return (
    <div class="board-column">
      <h2 class="board-column-title">{title}</h2>
      <BoardTaskList tasksState={tasksState} />
    </div>
  );
}

function BoardTaskList({
  tasksState,
}: {
  tasksState: State<Task[]>;
}) {
  const labelsState = createStoreState((state) => state.labels);

  return (
    <div class="board-column-tasks">
      {tasksState.renderEach<Task>({ key: "id" }, ({ elementState }) => (
        <BoardTaskCard taskState={elementState} labelsState={labelsState} />
      ))}
    </div>
  );
}

function BoardTaskCard({
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
    <div class="board-task-card">
      <div
        class={taskState.attribute(
          (task) => `task-complete task-priority-${task.priority}`
        )}
        onClick={() => {
          store.getState().completeTask(taskState.get().id);
        }}
      />
      <div class="board-task-content">
        <div class="board-task-title">
          {taskState.renderSelected((task) => task.title)}
        </div>
        <TaskInfo taskState={taskState} taskLabelsState={taskLabelsState} />
      </div>
    </div>
  );
}

export { BoardView };
