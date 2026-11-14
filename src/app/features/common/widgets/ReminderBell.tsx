"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CalendarDays, Receipt, RefreshCw } from "lucide-react";
import axios from "axios";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

type ReminderItem = {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  type: "bill" | "payment";
};

const ReminderBell = ({ light = false }: { light?: boolean }) => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";
  const [reminders, setReminders] = useState<ReminderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchReminders = async () => {
      try {
        const response = await axios.get("/api/reminders/active");
        if (mounted && response.data?.success) {
          setReminders(response.data.data?.reminders || []);
        }
      } catch {
        if (mounted) setReminders([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchReminders();
    const interval = setInterval(fetchReminders, 60_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const count = reminders.length;
  const iconClass = light ? "text-shell-foreground" : "text-foreground";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative cursor-pointer"
          aria-label="Payment reminders"
        >
          <Bell className={`size-5 ${iconClass}`} />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-4.5 h-4.5 px-1 rounded-full bg-red-500 text-white text-[10px] leading-none font-bold flex items-center justify-center ring-2 ring-background">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[22rem] max-w-[calc(100vw-1.5rem)] p-0 overflow-hidden rounded-xl border border-border bg-card text-foreground shadow-xl"
      >
        <div className="px-4 py-3 border-b border-border bg-muted/40">
          <DropdownMenuLabel className="p-0 text-base font-semibold text-foreground">
            Payment reminders
          </DropdownMenuLabel>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {loading
              ? "Checking alerts..."
              : count === 0
                ? "You're all caught up"
                : `${count} due soon`}
          </p>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {loading ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading reminders...
            </div>
          ) : count === 0 ? (
            <div className="px-3 py-8 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-btn-background/15 text-btn-background">
                <Bell className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">
                No active reminders
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                New alerts will show here when due.
              </p>
            </div>
          ) : (
            <ul className="space-y-1.5">
              {reminders.map((item) => {
                const Icon = item.type === "bill" ? Receipt : RefreshCw;
                return (
                  <li key={`${item.type}-${item.id}`}>
                    <Link
                      href="/dashboard/bill-reminders"
                      className="flex items-start gap-3 rounded-lg border border-border/70 bg-background px-3 py-3 transition-colors hover:border-btn-background/40 hover:bg-selected-background"
                    >
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-btn-background/15 text-btn-background">
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {item.title}
                          </p>
                          <span className="shrink-0 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                            Due soon
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-medium text-foreground">
                          {Number(item.amount).toLocaleString()} {currency}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          <span>
                            {item.type === "bill"
                              ? "Upcoming bill"
                              : "Recurring payment"}{" "}
                            · Due{" "}
                            {new Date(item.dueDate).toLocaleDateString("en-GB")}
                          </span>
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-border bg-muted/30 px-3 py-2.5">
          <Link
            href="/dashboard/bill-reminders"
            className="flex h-9 w-full items-center justify-center rounded-lg bg-btn-background text-sm font-medium text-white transition-colors hover:bg-btn-hover"
          >
            View all alerts
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ReminderBell;
