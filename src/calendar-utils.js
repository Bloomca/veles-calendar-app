export function createCalendarData() {
  const nowDate = new Date();

  const currentDay = nowDate.getDay();
  const currentMonthDay = nowDate.getDate();
  const currentYear = nowDate.getFullYear();
  const currentMonth = nowDate.getMonth();
  const previousMonth = currentMonth === 0 ? 12 : currentMonth - 1;
  const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;

  const firstMonthDay = new Date(currentYear, currentMonth, 1);
  const firstMonthDayNumber = firstMonthDay.getDay();

  let result = [];

  // if the month started on Monday, we don't need to pad first week
  if (firstMonthDayNumber === 1) {
    // full first week
    result = result.concat([
      createDay(1, currentMonth),
      createDay(2, currentMonth),
      createDay(3, currentMonth),
      createDay(4, currentMonth),
      createDay(5, currentMonth),
      createDay(6, currentMonth),
      createDay(7, currentMonth),
    ]);
  } else {
    const prevMonthDays = firstMonthDayNumber - 1;
    const firstWeekDay = new Date(
      currentYear,
      currentMonth,
      1 - prevMonthDays
    ).getDate();

    for (let i = 1; i <= 7; i++) {
      if (i <= prevMonthDays) {
        // because we start at 1
        result.push(createDay(firstWeekDay + i - 1, previousMonth));
      } else {
        result.push(createDay(i - prevMonthDays, currentMonth));
      }
    }
  }

  // easier to calculate this way to avoid manual accounting for the leap year
  let lastMonthDay = new Date(currentYear, currentMonth, 31);
  const lastDayNumber = lastMonthDay.getDate();

  const startingNumber = result[result.length - 1].day;

  // every month has at least 28 days
  for (let i = startingNumber + 1; i <= 28; i++) {
    result.push(createDay(i, currentMonth));
  }

  // great, the month has 31 days
  if (lastDayNumber === 31) {
    result = result.concat([
      currentDay(29, currentMonth),
      createDay(30, currentMonth),
      createDay(31, currentMonth),
    ]);
  } else if (lastDayNumber === 1) {
    const lastWeekLength = result.length % 7;

    // we end with a perfect week
    if (lastWeekLength === 5) {
      result = result.concat([
        createDay(29, currentMonth),
        createDay(30, currentMonth),
      ]);
    } else {
      result = result.concat([
        createDay(29, currentMonth),
        createDay(30, currentMonth),
        createDay(1, nextMonth),
      ]);
    }
  } else if (lastDayNumber === 2) {
    const lastWeekLength = result.length % 7;
    // we end with a perfect week
    if (lastWeekLength === 6) {
      result = result.concat([createDay(29, currentMonth)]);
    } else if (lastWeekLength === 5) {
      result = result.concat([
        createDay(29, currentMonth),
        createDay(1, nextMonth),
      ]);
    } else {
      result = result.concat([
        createDay(29, currentMonth),
        createDay(1, nextMonth),
        createDay(2, nextMonth),
      ]);
    }
  } else {
    const lastWeekLength = result.length % 7;
    if (lastWeekLength === 7) {
      // do nothing
    } else if (lastWeekLength === 6) {
      result = result.concat([createDay(1, nextMonth)]);
    } else if (lastWeekLength === 5) {
      result = result.concat([
        createDay(1, nextMonth),
        createDay(2, nextMonth),
      ]);
    } else {
      result = result.concat([
        createDay(1, nextMonth),
        createDay(2, nextMonth),
        createDay(3, nextMonth),
      ]);
    }
  }

  const lastWeekLength = result.length % 7;

  if (lastWeekLength !== 0) {
    for (let i = 1; i <= 7 - lastWeekLength; i++) {
      result.push(
        createDay((result[result.length - 1].day + 1) % 31, nextMonth)
      );
    }
  }

  return result;
}

function createDay(day, month) {
  return { day, month };
}
