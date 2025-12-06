import * as React from "react";
import { DayPicker, DateRange, SelectSingleEventHandler } from "react-day-picker";
import "react-day-picker/dist/style.css";

export interface CalendarProps {
  mode?: "single";
  selected?: Date | null;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  fromDate?: Date;
  toDate?: Date;
}

export function Calendar({ mode = "single", selected, onSelect, className, fromDate, toDate }: CalendarProps) {
  return (
    <DayPicker
      mode={mode}
      selected={selected ?? undefined}
      onSelect={onSelect as SelectSingleEventHandler}
      className={className}
      hidden={
        fromDate || toDate
          ? [
              ...(fromDate ? [{ before: fromDate }] : []),
              ...(toDate ? [{ after: toDate }] : [])
            ]
          : undefined
      }
    />
  );
}
