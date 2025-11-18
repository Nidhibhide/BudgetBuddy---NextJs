"use client";

import * as React from "react";
import { useTranslations } from 'next-intl';
import { Card } from "@/components/ui/card";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface BudgetCalendarProps {
  transactions: Transaction[];
}

const BudgetCalendar: React.FC<BudgetCalendarProps> = ({ transactions }) => {
  const t = useTranslations('dashboard');
  const [date, setDate] = React.useState<Date | undefined>(new Date('2023-10-15'));

  // const getTransactionsForDate = (selectedDate: Date) => {
  //   const dateString = selectedDate.toISOString().split("T")[0];
  //   return transactions.filter((t) => t.date === dateString);
  // };

  // const selectedDateTransactions = date ? getTransactionsForDate(date) : [];

  // Determine color based on net balance for each date
  const dateModifiers = React.useMemo(() => {
    const modifiers: { [key: string]: Date[] } = {};
    const classNames: { [key: string]: string } = {};

    transactions.forEach((t) => {
      const date = new Date(t.date);
      const dateString = t.date;
      if (!modifiers[dateString]) {
        modifiers[dateString] = [];
      }
      modifiers[dateString].push(date);
    });

    // Calculate net balance for each date
    Object.keys(modifiers).forEach((dateString) => {
      const dayTransactions = transactions.filter((t) => t.date === dateString);
      const netBalance = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      if (netBalance > 0) {
        classNames[dateString] = "bg-green-200 text-green-800 font-semibold";
      } else if (netBalance < 0) {
        classNames[dateString] = "bg-red-200 text-red-800 font-semibold";
      } else {
        classNames[dateString] = "bg-yellow-200 text-yellow-800 font-semibold";
      }
    });

    return { modifiers, classNames };
  }, [transactions]);

  return (
    <Card className="p-6 text-foreground flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-4">{t('ui.budgetCalendar')}</h3>
      <div className="flex-1">
        <div className="space-y-4">
          <TooltipProvider>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm w-full"
              style={{ height: '100%' }}
              captionLayout="dropdown"
              modifiers={dateModifiers.modifiers}
              modifiersClassNames={dateModifiers.classNames}
              components={{
                DayButton: ({ day, modifiers, ...props }) => {
                  const dateString = day.date.toISOString().split("T")[0];
                  const dayTransactions = transactions.filter(
                    (t) => t.date === dateString
                  );
                  const totalIncome = dayTransactions
                    .filter((t) => t.amount > 0)
                    .reduce((sum, t) => sum + t.amount, 0);
                  const totalExpense = dayTransactions
                    .filter((t) => t.amount < 0)
                    .reduce((sum, t) => sum + Math.abs(t.amount), 0);
                  const netBalance = totalIncome - totalExpense;

                  return (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CalendarDayButton
                          day={day}
                          modifiers={modifiers}
                          {...props}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-semibold">
                            {day.date.toLocaleDateString()}
                          </p>
                          {dayTransactions.length > 0 ? (
                            <>
                              <p>{t('ui.incomeLabel')}: ${totalIncome.toLocaleString()}</p>
                              <p>{t('ui.expenseLabel')}: ${totalExpense.toLocaleString()}</p>
                              <p>{t('ui.netLabel')}: ${netBalance.toLocaleString()}</p>
                              <div className="mt-2">
                                {dayTransactions.map((t, idx) => (
                                  <p
                                    key={idx}
                                    className={`text-xs ${
                                      t.amount > 0
                                        ? "text-green-600"
                                        : "text-red-600"
                                    }`}
                                  >
                                    {t.description}: {t.amount > 0 ? "+" : "-"}$
                                    {Math.abs(t.amount).toLocaleString()}
                                  </p>
                                ))}
                              </div>
                            </>
                          ) : (
                            <p>{t('ui.noTransactions')}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                },
              }}
            />
          </TooltipProvider>
        </div>
      </div>
    </Card>
  );
};

export default BudgetCalendar;
