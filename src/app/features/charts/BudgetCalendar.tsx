"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useBudgetCalendar } from "@/app/hooks/useBudgetCalendar";

const BudgetCalendar: React.FC = () => {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const month = date ? date.getMonth() + 1 : new Date().getMonth() + 1;
  const year = date ? date.getFullYear() : new Date().getFullYear();
  const { daysData } = useBudgetCalendar(month, year);

  const modifiers = React.useMemo(() => ({
    hasData: daysData.map(day => new Date(day.date))
  }), [daysData]);

  return (
    <Card className="p-6 text-foreground flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">Budget Calendar</h3>
      <div className="flex-1">
        <div className="space-y-4">
          <TooltipProvider>
            <div className="[&_select]:bg-foreground [&_select]:text-background [&_select]:border-sidebar-hover">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border shadow-sm w-full"
                style={{ height: '100%' }}
                captionLayout="dropdown"
                modifiers={modifiers}
                formatters={{
                  formatMonthDropdown: (date) => date.toLocaleString('default', { month: 'long' }),
                }}
                components={{
                  DayButton: ({ day, modifiers, ...props }) => {
                    const dateString = day.date.toLocaleDateString('en-CA');
                    const dayData = daysData.find((d) => d.date === dateString);

                    return (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={modifiers.hasData ? 'bg-blue-400 text-white font-bold rounded' : ''}>
                            <CalendarDayButton
                              day={day}
                              modifiers={modifiers}
                              {...props}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-semibold">
                              {day.date.toLocaleDateString()}
                            </p>
                            {dayData ? (
                              <>
                                <p>Income: ${dayData.income.toLocaleString()}</p>
                                <p>Expense: ${dayData.expense.toLocaleString()}</p>
                              </>
                            ) : (
                              <p>Transaction not found</p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    );
                  },
                }}
              />
            </div>
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCalendar;
