"use client";
import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

import { CustomTabPanelProps } from "@/app/types/appTypes";
import { UpcomingBill, RecurringPayment } from "@/app/features/common";
import { useTranslations } from 'next-intl'; // Import for internationalization

const BillReminders: React.FC = () => {
  // Get translation function for the 'dashboard' namespace
  // This provides access to all dashboard-related translations
  const t = useTranslations('dashboard');

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
            aria-label="bill reminders tabs"
            className="bg-background"
          >
            <Tab
              label={t('overview.upcomingBills')}
              {...a11yProps(0)}
              sx={{ color: "var(--foreground)" }}
            />
            <Tab
              label={t('overview.recurringPayments')}
              {...a11yProps(1)}
              sx={{ color: "var(--foreground)" }}
            />
          </Tabs>
        </Box>

       <CustomTabPanel value={value} index={0}>
  <UpcomingBill />
</CustomTabPanel>

        <CustomTabPanel value={value} index={1}>
          <RecurringPayment />
        </CustomTabPanel>
      </Box>
    </div>
  );
};

export default BillReminders;
