import { store } from "../store";

import type { Task } from "../types";
import type { State } from "veles";

export function CalendarTask({
  taskState,
  draggedTaskIdState,
  dragTargetDateState,
}: {
  taskState: State<Task>;
  draggedTaskIdState: State<number | null>;
  dragTargetDateState: State<{ day: number; month: number; year: number } | null>;
}) {
  const taskClassState = taskState
    .combine(draggedTaskIdState)
    .map(([task, draggedTaskId]) =>
      draggedTaskId === task.id ? "calendar-task calendar-task-dragging" : "calendar-task"
    );

  return (
    <li
      class={taskClassState.attribute()}
      draggable={"true" as any}
      onDragStart={(e) => {
        const task = taskState.get();

        draggedTaskIdState.set(task.id);
        dragTargetDateState.set(null);

        if (e.dataTransfer) {
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", String(task.id));

          const rowElement = e.currentTarget as HTMLElement;
          const rowBounds = rowElement.getBoundingClientRect();
          const offsetX = e.clientX - rowBounds.left;
          const offsetY = e.clientY - rowBounds.top;
          e.dataTransfer.setDragImage(rowElement, offsetX, offsetY);
        }
      }}
      onDragEnd={() => {
        draggedTaskIdState.set(null);
        dragTargetDateState.set(null);
      }}
    >
      <div
        class={taskState.attribute(
          (task) => `calendar-task-priority priority-${task.priority}`
        )}
        onClick={() => {
          store.getState().completeTask(taskState.get().id);
        }}
      ></div>
      <div class="calendar-task-title">
        {taskState.renderSelected(
          (task) => task.title,
          (title) => title
        )}
      </div>
    </li>
  );
}
