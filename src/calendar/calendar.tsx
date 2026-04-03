import { createState } from "veles";
import { createCalendarData } from "./calendar-utils";
import { InlineGenerator } from "../inline-generator";
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
  const draggedTaskIdState = createState<number | null>(null);
  const dragTargetDateState = createState<
    { day: number; month: number; year: number } | null
  >(null);
  return (
    <div>
      <InlineGenerator
        getMonth={() => calendarState.get().month}
        getYear={() => calendarState.get().year}
      />
      <CalendarControls calendarState={calendarState} />
      <CalendarGrid
        calendarState={calendarState}
        draggedTaskIdState={draggedTaskIdState}
        dragTargetDateState={dragTargetDateState}
      />
    </div>
  );
}

function CalendarGrid({
  calendarState,
  draggedTaskIdState,
  dragTargetDateState,
}: {
  calendarState: State<CalendarState>;
  draggedTaskIdState: State<number | null>;
  dragTargetDateState: State<{ day: number; month: number; year: number } | null>;
}) {
  const monthlyCalendarState = calendarState.map((calendarData) =>
    createCalendarData(calendarData)
  );

  return (
    <div class="calendar-grid">
      {monthlyCalendarState.render((result) => {
        const firstWeek = result.slice(0, 7);
        const secondWeek = result.slice(7, 14);
        const thirdWeek = result.slice(14, 21);
        const fourthWeek = result.slice(21, 28);
        const fifthWeek = result.slice(28, 35);
        const sixthWeek = result.slice(35, 42);
        // don't do this
        const currentMonth = calendarState.get().month;
        const currentYear = calendarState.get().year;
        return (
          <div>
            <CalendarRow
              dates={firstWeek}
              currentMonth={currentMonth}
              currentYear={currentYear}
              draggedTaskIdState={draggedTaskIdState}
              dragTargetDateState={dragTargetDateState}
            />
            <CalendarRow
              dates={secondWeek}
              currentMonth={currentMonth}
              currentYear={currentYear}
              draggedTaskIdState={draggedTaskIdState}
              dragTargetDateState={dragTargetDateState}
            />
            <CalendarRow
              dates={thirdWeek}
              currentMonth={currentMonth}
              currentYear={currentYear}
              draggedTaskIdState={draggedTaskIdState}
              dragTargetDateState={dragTargetDateState}
            />
            <CalendarRow
              dates={fourthWeek}
              currentMonth={currentMonth}
              currentYear={currentYear}
              draggedTaskIdState={draggedTaskIdState}
              dragTargetDateState={dragTargetDateState}
            />
            {fifthWeek.length ? (
              <CalendarRow
                dates={fifthWeek}
                currentMonth={currentMonth}
                currentYear={currentYear}
                draggedTaskIdState={draggedTaskIdState}
                dragTargetDateState={dragTargetDateState}
              />
            ) : null}
            {sixthWeek.length ? (
              <CalendarRow
                dates={sixthWeek}
                currentMonth={currentMonth}
                currentYear={currentYear}
                draggedTaskIdState={draggedTaskIdState}
                dragTargetDateState={dragTargetDateState}
              />
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
  currentYear,
  draggedTaskIdState,
  dragTargetDateState,
}: {
  dates: { day: number; month: number }[];
  currentMonth: number;
  currentYear: number;
  draggedTaskIdState: State<number | null>;
  dragTargetDateState: State<{ day: number; month: number; year: number } | null>;
}) {
  return (
    <div class="calendar-row">
      {dates.map((data) => (
        <CalendarDay
          data={data}
          currentMonth={currentMonth}
          currentYear={currentYear}
          draggedTaskIdState={draggedTaskIdState}
          dragTargetDateState={dragTargetDateState}
        />
      ))}
    </div>
  );
}

export { Calendar };
