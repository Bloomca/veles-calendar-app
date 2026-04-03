import { createState } from "veles";
import { createStoreState, store } from "../store";
import { renderMonth } from "./calendar-utils";
import { CalendarTask } from "./task";
import { Popover } from "../popover";

import type { State } from "veles";
import type { Task } from "../types";

const MAX_AMOUNT_TASKS_PER_DAY = 8;

function resolveDisplayedDayYear({
  dayMonth,
  currentMonth,
  currentYear,
}: {
  dayMonth: number;
  currentMonth: number;
  currentYear: number;
}) {
  const previousMonth = (currentMonth + 11) % 12;
  const nextMonth = (currentMonth + 1) % 12;

  if (dayMonth === currentMonth) {
    return currentYear;
  }

  if (dayMonth === previousMonth) {
    return currentMonth === 0 ? currentYear - 1 : currentYear;
  }

  if (dayMonth === nextMonth) {
    return currentMonth === 11 ? currentYear + 1 : currentYear;
  }

  return currentYear;
}

function areSameDate(
  date1: { day: number; month: number; year: number } | null,
  date2: { day: number; month: number; year: number } | null
) {
  if (!date1 || !date2) {
    return false;
  }

  return (
    date1.day === date2.day &&
    date1.month === date2.month &&
    date1.year === date2.year
  );
}

export function CalendarDay({
  data,
  currentMonth,
  currentYear,
  draggedTaskIdState,
  dragTargetDateState,
}: {
  data: { day: number; month: number };
  currentMonth: number;
  currentYear: number;
  draggedTaskIdState: State<number | null>;
  dragTargetDateState: State<{ day: number; month: number; year: number } | null>;
}) {
  const dayYear = resolveDisplayedDayYear({
    dayMonth: data.month,
    currentMonth,
    currentYear,
  });

  const currentDayDate = {
    day: data.day,
    month: data.month,
    year: dayYear,
  };

  const dayState = createStoreState((state) => {
    const selectedProjectId = state.activeProject;
    return Object.values(state.tasks).filter(
      (task) =>
        !task.completed &&
        task.projectId === selectedProjectId &&
        task.dueDate.getDate() === data.day &&
        task.dueDate.getMonth() === data.month &&
        task.dueDate.getFullYear() === dayYear
    );
  });

  const dayClassState = dragTargetDateState
    .combine(draggedTaskIdState)
    .map(([targetDate, draggedTaskId]) => {
      const isDropTarget =
        draggedTaskId !== null && areSameDate(targetDate, currentDayDate);

      return isDropTarget ? "calendar-day calendar-day-drop-target" : "calendar-day";
    });

  return (
    <div
      class={dayClassState.attribute()}
      onDragOver={(e) => {
        if (!draggedTaskIdState.get()) {
          return;
        }

        e.preventDefault();

        const currentDragTarget = dragTargetDateState.get();

        if (!areSameDate(currentDragTarget, currentDayDate)) {
          dragTargetDateState.set(currentDayDate);
        }
      }}
      onDrop={(e) => {
        const draggedTaskId = draggedTaskIdState.get();

        if (!draggedTaskId) {
          return;
        }

        e.preventDefault();

        const targetDueDate = new Date(
          currentDayDate.year,
          currentDayDate.month,
          currentDayDate.day
        );

        store.getState().updateTaskDueDate({
          taskId: draggedTaskId,
          dueDate: targetDueDate,
        });

        draggedTaskIdState.set(null);
        dragTargetDateState.set(null);
      }}
    >
      <div
        class={`calendar-date ${
          data.month !== currentMonth ? "non-current" : ""
        }`}
      >
        {String(data.day)}
        {data.day === 1 ? ` ${renderMonth(data.month)}` : ""}
      </div>
      <ul class="calendar-tasks-list">
        {dayState.renderEach(
          {
            key: "id",
            selector: (allTasks) =>
              allTasks.length > MAX_AMOUNT_TASKS_PER_DAY
                ? allTasks.slice(0, MAX_AMOUNT_TASKS_PER_DAY - 1)
                : allTasks,
          },
          ({ elementState }) => (
            <CalendarTask
              taskState={elementState}
              draggedTaskIdState={draggedTaskIdState}
              dragTargetDateState={dragTargetDateState}
            />
          )
        )}
        {dayState.renderSelected(
          (tasks) => tasks.length > MAX_AMOUNT_TASKS_PER_DAY,
          (hasMoreTasks) =>
            hasMoreTasks ? (
              <CalendarDayMoreTasks
                dayTasksState={dayState}
                draggedTaskIdState={draggedTaskIdState}
                dragTargetDateState={dragTargetDateState}
              />
            ) : null
        )}
      </ul>
    </div>
  );
}

// define in the same file to avoid any potential circular dependencies
export function CalendarDayMoreTasks({
  dayTasksState,
  draggedTaskIdState,
  dragTargetDateState,
}: {
  dayTasksState: State<Task[]>;
  draggedTaskIdState: State<number | null>;
  dragTargetDateState: State<{ day: number; month: number; year: number } | null>;
}) {
  const showState = createState(false);
  return (
    <li class="calendar-task" onClick={() => showState.set(true)} role="button">
      <div class="calendar-task-title">
        {dayTasksState.render((tasks) => `total tasks: ${tasks.length}`)}
      </div>
      {showState.render((shouldShow) =>
        shouldShow ? (
          <Popover onClose={() => showState.set(false)}>
            <ul class="calendar-tasks-list">
              {dayTasksState.renderEach<Task>({ key: "id" }, ({ elementState }) => (
                <CalendarTask
                  taskState={elementState}
                  draggedTaskIdState={draggedTaskIdState}
                  dragTargetDateState={dragTargetDateState}
                />
              ))}
            </ul>
          </Popover>
        ) : null
      )}
    </li>
  );
}
