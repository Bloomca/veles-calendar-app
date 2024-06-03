import { createState } from "veles";
import { createCalendarData } from "./calendar-utils";
import { createStoreState } from "./store";
import { Popover } from "./popover";

function Calendar() {
  return (
    <div>
      <CalendarGrid />
    </div>
  );
}

function CalendarGrid() {
  const result = createCalendarData();

  const firstWeek = result.slice(0, 7);
  const secondWeek = result.slice(7, 14);
  const thirdWeek = result.slice(14, 21);
  const fourthWeek = result.slice(21, 28);
  const fifthWeek = result.slice(28, 35);
  const sixthWeek = result.slice(35, 42);

  return (
    <div class="calendar-grid">
      <CalendarRow dates={firstWeek} />
      <CalendarRow dates={secondWeek} />
      <CalendarRow dates={thirdWeek} />
      <CalendarRow dates={fourthWeek} />
      {fifthWeek.length ? <CalendarRow dates={fifthWeek} /> : null}
      {sixthWeek.length ? <CalendarRow dates={sixthWeek} /> : null}
    </div>
  );
}

function CalendarRow({ dates }) {
  return (
    <div class="calendar-row">
      {dates.map((data) => (
        <CalendarDay data={data} isActive={false} />
      ))}
    </div>
  );
}

const MAX_AMOUNT_TASKS_PER_DAY = 8;

function CalendarDay({ data, isActive }) {
  const dayState = createStoreState((state) =>
    state.tasks.filter((task) => {
      return (
        task.dueDate.getDate() === data.day &&
        task.dueDate.getMonth() === data.month
      );
    })
  );
  return (
    <div class="calendar-day">
      <div class="calendar-date">{String(data.day)}</div>
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

function CalendarTask({ taskState }) {
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

function CalendarDayMoreTasks({ dayTasksState }) {
  const showState = createState(false);
  return (
    <li
      class="calendar-task"
      onClick={() => showState.setValue(() => true)}
      role="button"
    >
      <div class="calendar-task-title">
        {dayTasksState.useValueSelector(
          (allDayTasks) => allDayTasks.length - MAX_AMOUNT_TASKS_PER_DAY + 1,
          (moreTasksNumber) => `${moreTasksNumber} more tasks`
        )}
      </div>
      {showState.useValue((shouldShow) =>
        shouldShow ? (
          <Popover onClose={() => showState.setValue(() => false)}>
            <ul class="calendar-tasks-list">
              {dayTasksState.useValueIterator(
                {
                  key: "id",
                },
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
