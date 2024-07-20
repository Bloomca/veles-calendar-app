import { renderMonth } from "./calendar-utils";

import type { State } from "veles";
import type { CalendarState } from "./types";

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

export { CalendarControls };
