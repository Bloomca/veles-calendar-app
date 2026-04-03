import type { State } from "veles";
import type { LabelEntity, Task } from "./types";

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

export { TaskInfo };
