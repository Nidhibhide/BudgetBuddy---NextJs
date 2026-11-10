"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingBill, RecurringPayment } from "@/app/features/common";

const BillReminders: React.FC = () => {
  return (
    <div className="px-4 pt-4 md:pt-8 text-foreground">
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

        <TabsContent value="upcoming" className="mt-4">
          <UpcomingBill />
        </TabsContent>

        <TabsContent value="recurring" className="mt-4">
          <RecurringPayment />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BillReminders;
