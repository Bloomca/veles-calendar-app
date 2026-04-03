import { store } from "../store";

import type { Task } from "../types";
import type { State } from "veles";

export function CalendarTask({ taskState }: { taskState: State<Task> }) {
  return (
    <li class="calendar-task">
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
