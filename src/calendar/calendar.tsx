import { createState } from "veles";
import { createCalendarData } from "./calendar-utils";
import { InlineGenerator } from "../inline-generator";
import { selectState } from "../utils";
import { CalendarControls } from "./controls";
import { CalendarDay } from "./day";

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
      <InlineGenerator
        getMonth={() => calendarState.getValue().month}
        getYear={() => calendarState.getValue().year}
      />
      <CalendarControls calendarState={calendarState} />
      <CalendarGrid calendarState={calendarState} />
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

export { Calendar };
