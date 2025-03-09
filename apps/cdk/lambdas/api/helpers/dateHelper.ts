import {
  differenceInDays,
  eachDayOfInterval,
  format,
  isBefore,
  isSameDay,
  isValid,
} from "date-fns";

const MAX_DIFFERENCE_IN_DAYS = 31;

export const isValidDateFormat = (date: string) => {
  return /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/.test(date);
};

export const isValidDate = (date: Date) => isValid(date);

export const isValidDateRange = (startDate: Date, endDate: Date) =>
  isBefore(startDate, endDate) || isSameDay(endDate, startDate);

export const isValidDateInterval = (startDate: Date, endDate: Date) => {
  const delta = differenceInDays(endDate, startDate) + 1;
  return delta <= MAX_DIFFERENCE_IN_DAYS;
};

export const getDatesInBetween = (startDate: Date, endDate: Date) => {
  const start = startDate;
  const end = endDate;

  const dates = eachDayOfInterval({ start, end });
  return dates.map((date) => format(date, "yyyy-MM-dd"));
};
