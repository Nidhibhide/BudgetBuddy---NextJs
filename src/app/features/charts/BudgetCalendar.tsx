"use client";

import * as React from "react";
import { enGB } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { useBudgetCalendar } from "@/app/hooks/useBudgetCalendar";

const formatDayKey = (value: Date) => value.toLocaleDateString("en-CA");
const formatDisplayDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-GB");

const BudgetCalendar: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [activeTip, setActiveTip] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const prevMonthYear = React.useRef<string | null>(null);

  React.useEffect(() => {
    const today = new Date();
    setDate(today);
    setActiveTip(formatDayKey(today));
    setMounted(true);
  }, []);

  const month = date ? date.getMonth() + 1 : new Date().getMonth() + 1;
  const year = date ? date.getFullYear() : new Date().getFullYear();
  const { daysData, loading: calendarLoading } = useBudgetCalendar(month, year);

  const modifiers = React.useMemo(
    () => ({
      hasData: daysData.map((day) => new Date(day.date)),
    }),
    [daysData]
  );

  React.useEffect(() => {
    if (!mounted || !date) return;
    const key = `${year}-${month}`;
    if (prevMonthYear.current && prevMonthYear.current !== key) {
      setActiveTip(null);
    }
    prevMonthYear.current = key;
  }, [month, year, mounted, date]);

  const selectedDayKey = date ? formatDayKey(date) : null;
  const detailKey = activeTip || selectedDayKey;
  const detailData = daysData.find((d) => d.date === detailKey);

  return (
    <Card className="p-4 text-foreground bg-card border-border shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3">Budget Calendar</h3>
      <div className="flex-1">
        <div className="space-y-3">
          {!mounted || !date || calendarLoading ? (
            <div className="h-56 rounded-md border border-border bg-card" />
          ) : (
            <div className="[&_select]:bg-foreground [&_select]:text-background [&_select]:border-border">
              <Calendar
                mode="single"
                locale={enGB}
                selected={date}
                onSelect={(next) => {
                  setDate(next);
                  if (next) {
                    setActiveTip(formatDayKey(next));
                  }
                }}
                className="rounded-md border border-border shadow-sm w-full p-2 [--cell-size:1.65rem]"
                classNames={{
                  months: "relative flex flex-col gap-2 md:flex-row",
                  month: "flex w-full flex-col gap-2",
                  week: "mt-1 flex w-full",
                }}
                captionLayout="dropdown"
                modifiers={modifiers}
                formatters={{
                  formatMonthDropdown: (d) =>
                    d.toLocaleString("en-GB", { month: "long" }),
                }}
                components={{
                  DayButton: ({ day, modifiers, ...props }) => {
                    const dateString = formatDayKey(day.date);
                    return (
                      <CalendarDayButton
                        day={day}
                        modifiers={modifiers}
                        {...props}
                        onClick={(event) => {
                          props.onClick?.(event);
                          setActiveTip(dateString);
                        }}
                        className={`${
                          modifiers.hasData
                            ? "bg-btn-background/80 text-white font-bold rounded "
                            : ""
                        }${props.className || ""}`}
                      />
                    );
                  },
                }}
              />
            </div>
          )}

          <div className="rounded-lg border border-border bg-card p-2.5 text-sm">
            <p className="font-semibold mb-1">
              {detailKey ? formatDisplayDate(detailKey) : "Select a day"}
            </p>
            {detailData ? (
              <>
                <p className="text-success">
                  Income: {detailData.income.toLocaleString("en-GB")}
                </p>
                <p className="text-destructive">
                  Expense: {detailData.expense.toLocaleString("en-GB")}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No data for this day</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCalendar;
