"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserSetting, ChangePassword } from "@/app/features/forms";

const Setting: React.FC = () => {
  return (
    <div className="px-4 pt-4 md:pt-8 text-foreground">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full sm:w-auto h-auto flex flex-wrap justify-start bg-muted border border-border p-1 gap-1">
          <TabsTrigger
            value="profile"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground px-4 py-2"
          >
            Edit Profile
          </TabsTrigger>
          <TabsTrigger
            value="password"
            className="data-[state=active]:bg-card data-[state=active]:text-foreground px-4 py-2"
          >
            Change Password
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 p-2 sm:p-4">
          <UserSetting />
        </TabsContent>

        <TabsContent value="password" className="mt-4 p-2 sm:p-4">
          <ChangePassword />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Setting;
