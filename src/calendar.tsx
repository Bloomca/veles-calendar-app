import { createState } from "veles";
import { createCalendarData, renderMonth } from "./calendar-utils";
import { createStoreState } from "./store";
import { Popover } from "./popover";
import { selectState } from "./utils";

import type { Task } from "./types";
import type { State } from "veles";

type CalendarState = { month: number; year: number };

function Calendar() {
  const currentDate = new Date();
  const calendarState = createState<CalendarState>({
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
  });
  return (
    <div>
      <CalendarControls calendarState={calendarState} />
      <CalendarGrid calendarState={calendarState} />
    </div>
  );
}

function CalendarControls({
  calendarState,
}: {
  calendarState: State<CalendarState>;
}) {
  return (
    <div class="calendar-controls">
      <div class="calendar-controls-date">
        <strong>
          {calendarState.useValueSelector(
            (state) => state.month,
            (monthNumber) => renderMonth(monthNumber)
          )}
        </strong>{" "}
        {calendarState.useValueSelector((state) => state.year)}
      </div>
      <div>
        <button
          onClick={() => {
            calendarState.setValue((currentValue) => {
              const newMonth =
                currentValue.month === 0 ? 11 : currentValue.month - 1;
              const newYear =
                newMonth === 11 ? currentValue.year - 1 : currentValue.year;

              return { month: newMonth, year: newYear };
            });
          }}
        >
          {"<"}
        </button>
        <button
          onClick={() => {
            const currentDate = new Date();
            calendarState.setValue({
              month: currentDate.getMonth(),
              year: currentDate.getFullYear(),
            });
          }}
        >
          Today
        </button>
        <button
          onClick={() => {
            calendarState.setValue((currentValue) => {
              const newMonth =
                currentValue.month === 11 ? 0 : currentValue.month + 1;
              const newYear =
                newMonth === 0 ? currentValue.year + 1 : currentValue.year;

              return { month: newMonth, year: newYear };
            });
          }}
        >
          {">"}
        </button>
      </div>
    </div>
  );
}

function CalendarGrid({
  calendarState,
}: {
  calendarState: State<CalendarState>;
}) {
  const monthlyCalendarState = selectState(calendarState, (calendarData) =>
    createCalendarData(calendarData)
  );

  return (
    <div class="calendar-grid">
      {monthlyCalendarState.useValue((result) => {
        const firstWeek = result.slice(0, 7);
        const secondWeek = result.slice(7, 14);
        const thirdWeek = result.slice(14, 21);
        const fourthWeek = result.slice(21, 28);
        const fifthWeek = result.slice(28, 35);
        const sixthWeek = result.slice(35, 42);
        // don't do this
        const currentMonth = calendarState.getValue().month;
        return (
          <div>
            <CalendarRow dates={firstWeek} currentMonth={currentMonth} />
            <CalendarRow dates={secondWeek} currentMonth={currentMonth} />
            <CalendarRow dates={thirdWeek} currentMonth={currentMonth} />
            <CalendarRow dates={fourthWeek} currentMonth={currentMonth} />
            {fifthWeek.length ? (
              <CalendarRow dates={fifthWeek} currentMonth={currentMonth} />
            ) : null}
            {sixthWeek.length ? (
              <CalendarRow dates={sixthWeek} currentMonth={currentMonth} />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function CalendarRow({
  dates,
  currentMonth,
}: {
  dates: { day: number; month: number }[];
  currentMonth: number;
}) {
  return (
    <div class="calendar-row">
      {dates.map((data) => (
        <CalendarDay data={data} isActive={false} currentMonth={currentMonth} />
      ))}
    </div>
  );
}

const MAX_AMOUNT_TASKS_PER_DAY = 8;

function CalendarDay({
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

function CalendarTask({ taskState }: { taskState: State<Task> }) {
  return (
    <li class="calendar-task">
      <div
        class={taskState.useAttribute(
          (task) => `calendar-task-priority priority-${task.priority}`
        )}
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

function CalendarDayMoreTasks({
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

export { Calendar };
