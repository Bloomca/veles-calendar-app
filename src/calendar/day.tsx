import { createState } from "veles";
import { createStoreState } from "../store";
import { renderMonth } from "./calendar-utils";
import { CalendarTask } from "./task";
import { Popover } from "../popover";

import type { State } from "veles";
import type { Task } from "../types";

const MAX_AMOUNT_TASKS_PER_DAY = 8;

export function CalendarDay({
  data,
  isActive,
  currentMonth,
}: {
  data: { day: number; month: number };
  isActive: boolean;
  currentMonth: number;
}) {
  const dayState = createStoreState((state) => {
    const selectedProjectId = state.activeProject;
    return Object.values(state.tasks).filter(
      (task) =>
        task.projectId === selectedProjectId &&
        task.dueDate.getDate() === data.day &&
        task.dueDate.getMonth() === data.month
    );
  });
  return (
    <div class="calendar-day">
      <div
        class={`calendar-date ${
          data.month !== currentMonth ? "non-current" : ""
        }`}
      >
        {String(data.day)}
        {data.day === 1 ? ` ${renderMonth(data.month)}` : ""}
      </div>
      <ul class="calendar-tasks-list">
        {dayState.useValueIterator(
          {
            key: "id",
            selector: (allTasks) =>
              allTasks.length > MAX_AMOUNT_TASKS_PER_DAY
                ? allTasks.slice(0, MAX_AMOUNT_TASKS_PER_DAY - 1)
                : allTasks,
          },
          ({ elementState }) => (
            <CalendarTask taskState={elementState} />
          )
        )}
        {dayState.useValueSelector(
          (tasks) => tasks.length > MAX_AMOUNT_TASKS_PER_DAY,
          (hasMoreTasks) =>
            hasMoreTasks ? (
              <CalendarDayMoreTasks dayTasksState={dayState} />
            ) : null
        )}
      </ul>
    </div>
  );
}

// define in the same file to avoid any potential circular dependencies
export function CalendarDayMoreTasks({
  dayTasksState,
}: {
  dayTasksState: State<Task[]>;
}) {
  const showState = createState(false);
  return (
    <li
      class="calendar-task"
      onClick={() => showState.setValue(true)}
      role="button"
    >
      <div class="calendar-task-title">
        {dayTasksState.useValue((tasks) => `total tasks: ${tasks.length}`)}
      </div>
      {showState.useValue((shouldShow) =>
        shouldShow ? (
          <Popover onClose={() => showState.setValue(false)}>
            <ul class="calendar-tasks-list">
              {dayTasksState.useValueIterator<Task>(
                { key: "id" },
                ({ elementState }) => (
                  <CalendarTask taskState={elementState} />
                )
              )}
            </ul>
          </Popover>
        ) : null
      )}
    </li>
  );
}
