import { store } from "../store";

import type { Task } from "../types";
import type { State } from "veles";

export function CalendarTask({ taskState }: { taskState: State<Task> }) {
  return (
    <li class="calendar-task">
      <div
        class={taskState.useAttribute(
          (task) => `calendar-task-priority priority-${task.priority}`
        )}
        onClick={() => {
          store.getState().completeTask(taskState.getValue().id);
        }}
      ></div>
      <div class="calendar-task-title">
        {taskState.useValueSelector(
          (task) => task.title,
          (title) => title
        )}
      </div>
    </li>
  );
}
