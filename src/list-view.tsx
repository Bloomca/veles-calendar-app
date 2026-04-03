import { createState } from "veles";
import { createStoreState, store } from "./store";
import { InlineGenerator } from "./inline-generator";

import type { LabelEntity, Section, Task } from "./types";
import type { State } from "veles";

type SectionId = number | null;
type DragPayload = {
  taskId: number;
  projectId: number;
  sourceSectionId: SectionId;
};
type DropPlacement = "before" | "after" | "end" | "empty";
type DropTarget = {
  sectionId: SectionId;
  placement: DropPlacement;
  targetTaskId?: number;
};

const shortDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
});

const shortDateWithYearFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

function toStartOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function getDueDateVariant(dueDate: Date): "past" | "soon" | "future" {
  const dueDateStart = toStartOfDay(dueDate);
  const todayStart = toStartOfDay(new Date());
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setDate(tomorrowStart.getDate() + 1);

  if (dueDateStart.getTime() < todayStart.getTime()) {
    return "past";
  }

  if (
    dueDateStart.getTime() === todayStart.getTime() ||
    dueDateStart.getTime() === tomorrowStart.getTime()
  ) {
    return "soon";
  }

  return "future";
}

function formatDueDate(dueDate: Date) {
  const currentYear = new Date().getFullYear();
  return dueDate.getFullYear() === currentYear
    ? shortDateFormatter.format(dueDate)
    : shortDateWithYearFormatter.format(dueDate);
}

function sortTasksByOrder(tasks: Task[]) {
  return [...tasks].sort((task1, task2) => task1.order - task2.order || task1.id - task2.id);
}

function isSameDropTarget(
  target1: DropTarget | null,
  target2: DropTarget | null
) {
  if (!target1 || !target2) {
    return target1 === target2;
  }

  return (
    target1.sectionId === target2.sectionId &&
    target1.placement === target2.placement &&
    target1.targetTaskId === target2.targetTaskId
  );
}

function ListView() {
  const sectionsState = createStoreState((state) => {
    const activeProjectId = state.activeProject;
    return Object.values(state.sections).filter(
      (section) => section.projectId === activeProjectId
    );
  });
  const dragPayloadState = createState<DragPayload | null>(null);
  const dropTargetState = createState<DropTarget | null>(null);

  return (
    <div>
      <InlineGenerator
        getMonth={() => new Date().getMonth()}
        getYear={() => new Date().getFullYear()}
      />
      <div class="list-view-container">
        <NoSection
          dragPayloadState={dragPayloadState}
          dropTargetState={dropTargetState}
        />
        {sectionsState.renderEach<Section>({ key: "id" }, ({ elementState }) => (
          <Section
            sectionState={elementState}
            dragPayloadState={dragPayloadState}
            dropTargetState={dropTargetState}
          />
        ))}
      </div>
    </div>
  );
}

function NoSection({
  dragPayloadState,
  dropTargetState,
}: {
  dragPayloadState: State<DragPayload | null>;
  dropTargetState: State<DropTarget | null>;
}) {
  const tasksState = createStoreState((state) => {
    const activeProjectId = state.activeProject;

    return sortTasksByOrder(
      Object.values(state.tasks).filter(
        (task) =>
          !task.completed && task.projectId === activeProjectId && !task.sectionId
      )
    );
  });

  return (
    <div>
      <TaskList
        sectionId={null}
        tasksState={tasksState}
        dragPayloadState={dragPayloadState}
        dropTargetState={dropTargetState}
      />
    </div>
  );
}

function Section({
  sectionState,
  dragPayloadState,
  dropTargetState,
}: {
  sectionState: State<Section>;
  dragPayloadState: State<DragPayload | null>;
  dropTargetState: State<DropTarget | null>;
}) {
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
    <div>
      <h2>{sectionState.renderSelected((section) => section.name)}</h2>
      <TaskList
        sectionId={sectionState.get().id}
        tasksState={sectionTasksState}
        dragPayloadState={dragPayloadState}
        dropTargetState={dropTargetState}
      />
    </div>
  );
}

function TaskList({
  sectionId,
  tasksState,
  dragPayloadState,
  dropTargetState,
}: {
  sectionId: SectionId;
  tasksState: State<Task[]>;
  dragPayloadState: State<DragPayload | null>;
  dropTargetState: State<DropTarget | null>;
}) {
  const labelsState = createStoreState((state) => state.labels);

  const listDropZoneClassState = tasksState
    .combine(dropTargetState)
    .map(([tasks, dropTarget]) => {
      if (!dropTarget || dropTarget.sectionId !== sectionId) {
        return "";
      }

      if (dropTarget.placement === "empty" && tasks.length === 0) {
        return "task-list-drop-zone-active-empty";
      }

      if (dropTarget.placement === "end" || dropTarget.placement === "empty") {
        return "task-list-drop-zone-active-end";
      }

      return "";
    });

  const isListEmptyState = tasksState.map((tasks) => tasks.length === 0);

  const setDropTarget = (newDropTarget: DropTarget | null) => {
    const currentDropTarget = dropTargetState.get();

    if (isSameDropTarget(currentDropTarget, newDropTarget)) {
      return;
    }

    dropTargetState.set(newDropTarget);
  };

  const applyDrop = (dropTarget: DropTarget) => {
    const dragPayload = dragPayloadState.get();

    if (!dragPayload) {
      return;
    }

    const tasks = tasksState.get();
    let targetIndex = tasks.length;

    if (dropTarget.placement === "before" || dropTarget.placement === "after") {
      if (!dropTarget.targetTaskId || dropTarget.targetTaskId === dragPayload.taskId) {
        dragPayloadState.set(null);
        setDropTarget(null);
        return;
      }

      const foundTaskIndex = tasks.findIndex(
        (task) => task.id === dropTarget.targetTaskId
      );
      if (foundTaskIndex === -1) {
        dragPayloadState.set(null);
        setDropTarget(null);
        return;
      }

      targetIndex =
        dropTarget.placement === "before" ? foundTaskIndex : foundTaskIndex + 1;
    }

    store.getState().moveTask({
      taskId: dragPayload.taskId,
      targetSectionId: sectionId,
      targetIndex,
    });

    dragPayloadState.set(null);
    setDropTarget(null);
  };

  const setListDropTarget = () => {
    const dragPayload = dragPayloadState.get();

    if (!dragPayload) {
      return;
    }

    const listTasks = tasksState.get();

    setDropTarget({
      sectionId,
      placement: listTasks.length === 0 ? "empty" : "end",
    });
  };

  return (
    <div class="task-list">
      {tasksState.renderEach<Task>({ key: "id" }, ({ elementState }) => (
        <Task
          sectionId={sectionId}
          taskState={elementState}
          labelsState={labelsState}
          dragPayloadState={dragPayloadState}
          dropTargetState={dropTargetState}
          setDropTarget={setDropTarget}
          applyDrop={applyDrop}
        />
      ))}
      <div
        class={listDropZoneClassState.attribute(
          (dropClass) => `task-list-drop-zone ${dropClass}`
        )}
        onDragOver={(e) => {
          if (!dragPayloadState.get()) {
            return;
          }

          e.preventDefault();
          setListDropTarget();
        }}
        onDrop={(e) => {
          if (!dragPayloadState.get()) {
            return;
          }

          e.preventDefault();
          applyDrop({
            sectionId,
            placement: tasksState.get().length === 0 ? "empty" : "end",
          });
        }}
      >
        {isListEmptyState.render((isEmpty) =>
          isEmpty ? <span class="task-list-drop-zone-text">Drop tasks here</span> : null
        )}
      </div>
    </div>
  );
}

function Task({
  sectionId,
  taskState,
  labelsState,
  dragPayloadState,
  dropTargetState,
  setDropTarget,
  applyDrop,
}: {
  sectionId: SectionId;
  taskState: State<Task>;
  labelsState: State<{ [id: number]: LabelEntity }>;
  dragPayloadState: State<DragPayload | null>;
  dropTargetState: State<DropTarget | null>;
  setDropTarget: (newDropTarget: DropTarget | null) => void;
  applyDrop: (dropTarget: DropTarget) => void;
}) {
  const taskLabelsState = taskState.combine(labelsState).map(([task, labels]) =>
    task.labelIds
      .map((labelId) => labels[labelId])
      .filter((label): label is LabelEntity => Boolean(label))
  );

  const taskClassState = taskState
    .combine(dropTargetState, dragPayloadState)
    .map(([task, dropTarget, dragPayload]) => {
      const classes: string[] = [];

      if (dragPayload?.taskId === task.id) {
        classes.push("task-is-dragging");
      }

      if (
        dropTarget &&
        dropTarget.sectionId === sectionId &&
        dropTarget.targetTaskId === task.id
      ) {
        if (dropTarget.placement === "before") {
          classes.push("task-drop-before");
        } else if (dropTarget.placement === "after") {
          classes.push("task-drop-after");
        }
      }

      return classes.join(" ");
    });

  return (
    <div
      class={taskClassState.attribute(
        (taskClass) => `task-list-task-container ${taskClass}`
      )}
      onDragOver={(e) => {
        if (!dragPayloadState.get()) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const targetElement = e.currentTarget as HTMLElement;
        const targetRect = targetElement.getBoundingClientRect();
        const placement: DropPlacement =
          e.clientY - targetRect.top < targetRect.height / 2 ? "before" : "after";

        setDropTarget({
          sectionId,
          placement,
          targetTaskId: taskState.get().id,
        });
      }}
      onDrop={(e) => {
        if (!dragPayloadState.get()) {
          return;
        }

        e.preventDefault();
        e.stopPropagation();

        const targetElement = e.currentTarget as HTMLElement;
        const targetRect = targetElement.getBoundingClientRect();
        const placement: DropPlacement =
          e.clientY - targetRect.top < targetRect.height / 2 ? "before" : "after";

        applyDrop({
          sectionId,
          placement,
          targetTaskId: taskState.get().id,
        });
      }}
    >
      <div
        class="task-drag-handle"
        draggable={"true"}
        title="Drag task"
        onDragStart={(e) => {
          const task = taskState.get();
          dragPayloadState.set({
            taskId: task.id,
            projectId: task.projectId,
            sourceSectionId: sectionId,
          });
          setDropTarget(null);

          if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", String(task.id));

            const rowElement = (e.currentTarget as HTMLElement).closest(
              ".task-list-task-container"
            ) as HTMLElement | null;

            if (rowElement) {
              const rowBounds = rowElement.getBoundingClientRect();
              const offsetX = e.clientX - rowBounds.left;
              const offsetY = e.clientY - rowBounds.top;
              e.dataTransfer.setDragImage(rowElement, offsetX, offsetY);
            }
          }
        }}
        onDragEnd={() => {
          dragPayloadState.set(null);
          setDropTarget(null);
        }}
      >
        ⋮⋮
      </div>
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
        <TaskInfo taskState={taskState} taskLabelsState={taskLabelsState} />
      </div>
    </div>
  );
}

function TaskInfo({
  taskState,
  taskLabelsState,
}: {
  taskState: State<Task>;
  taskLabelsState: State<LabelEntity[]>;
}) {
  return (
    <div class="task-list-task-info">
      {taskState.renderSelected((task) => task.dueDate, (dueDate) => (
        <span class={`task-due-date task-due-date-${getDueDateVariant(dueDate)}`}>
          {formatDueDate(dueDate)}
        </span>
      ))}
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
