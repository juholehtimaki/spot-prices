import { format } from "date-fns";
import type { DateString } from "./api/prices/hooks";

export const getDateInApiFormat = (date: Date): DateString =>
  format(date, "yyyy/MM/dd") as DateString;
