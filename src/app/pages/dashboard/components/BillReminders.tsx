"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingBill, RecurringPayment } from "@/app/features/common";

const BillReminders: React.FC = () => {
  return (
    <div className="w-full px-4 sm:px-6 py-4 text-foreground space-y-3">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Set Alerts</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track upcoming bills and recurring payments in one place.
        </p>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="w-full sm:w-auto h-auto flex flex-wrap justify-start bg-muted border border-border p-1 gap-1">
          <TabsTrigger
            value="upcoming"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground px-4 py-2"
          >
            Upcoming Bills
          </TabsTrigger>
          <TabsTrigger
            value="recurring"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground px-4 py-2"
          >
            Recurring Payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-3">
          <UpcomingBill />
        </TabsContent>

        <TabsContent value="recurring" className="mt-3">
          <RecurringPayment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillReminders;
