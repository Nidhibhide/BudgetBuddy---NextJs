"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import { useBudgetCalendar } from "@/app/hooks/useBudgetCalendar";

const BudgetCalendar: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const [activeTip, setActiveTip] = React.useState<string | null>(null);
  const month = date ? date.getMonth() + 1 : new Date().getMonth() + 1;
  const year = date ? date.getFullYear() : new Date().getFullYear();
  const { daysData } = useBudgetCalendar(month, year);

  const modifiers = React.useMemo(() => ({
    hasData: daysData.map(day => new Date(day.date))
  }), [daysData]);

  React.useEffect(() => {
    setActiveTip(null);
  }, [month, year]);

  return (
    <Card className="p-6 text-foreground flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">Budget Calendar</h3>
      <div className="flex-1">
        <div className="space-y-4">
          <div className="[&_select]:bg-foreground [&_select]:text-background [&_select]:border-sidebar-hover">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm w-full"
              captionLayout="dropdown"
              modifiers={modifiers}
              formatters={{
                formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'long' }),
              }}
              components={{
                DayButton: ({ day, modifiers, ...props }) => {
                  const dateString = day.date.toLocaleDateString('en-CA');
                  const dayData = daysData.find((d) => d.date === dateString);
                  const showTip = activeTip === dateString;

                  return (
                    <div
                      className="relative group w-full h-full"
                      onPointerDown={() => setActiveTip(dateString)}
                    >
                      <CalendarDayButton
                        day={day}
                        modifiers={modifiers}
                        {...props}
                        className={`${modifiers.hasData ? "bg-blue-400 text-white font-bold rounded " : ""}${props.className || ""}`}
                      />
                      <div
                        className={`absolute left-1/2 top-1/2 z-50 mt-[-1.75rem] -translate-x-1/2 -translate-y-full pointer-events-none bg-foreground text-background text-sm rounded-md px-3 py-1.5 whitespace-nowrap shadow-sm ${
                          showTip ? "block" : "hidden group-hover:block"
                        }`}
                      >
                        <p className="font-semibold">
                          {day.date.toLocaleDateString()}
                        </p>
                        {dayData ? (
                          <>
                            <p>Income: {dayData.income.toLocaleString()}</p>
                            <p>Expense: {dayData.expense.toLocaleString()}</p>
                          </>
                        ) : (
                          <p>No data for this day</p>
                        )}
                      </div>
                    </div>
                  );
                },
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCalendar;
