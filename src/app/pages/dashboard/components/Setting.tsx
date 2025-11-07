"use client";
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";
import { UserSetting, ChangePassword } from "@/app/features/common";

import { CustomTabPanelProps } from "@/app/types/appTypes";

const Setting: React.FC = () => {
  const CustomTabPanel: React.FC<CustomTabPanelProps> = ({
    children,
    value,
    index,
    ...other
  }) => {
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
      </div>
    );
  };

  const a11yProps = (index: number) => {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  };

  const [value, setValue] = React.useState<number>(0);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="px-4 pt-4 md:pt-16 text-foreground">
      <Box sx={{ width: "100%" }}>
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="settings tabs"
            className="bg-background"
          >
            <Tab
              label="Edit Profile"
              {...a11yProps(0)}
              sx={{ color: "var(--foreground)" }}
            />
            <Tab
              label="Change Password"
              {...a11yProps(1)}
              sx={{ color: "var(--foreground)" }}
            />
          </Tabs>
        </Box>

        <CustomTabPanel value={value} index={0}>
          <UserSetting />
        </CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <ChangePassword />
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default Setting;
