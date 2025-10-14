"use client";
import React, { useState } from "react";
import { Formik, Form } from "formik";
import { useSession } from "next-auth/react";
import {
  InputBox,
  Button,
  showError,
  showSuccess,
  MultiSelect,
  SelectBox,
  CategoryRemovalDialog,
} from "./index";

import appStore from "../store/appStore";
import {
  updateFinancialSettings,
  checkCategoryHasExpenses,
  reassignCategories,
} from "@/app/lib/user";
import { CATEGORY_LIST, CURRENCIES } from "@/lib/constants";
import { DollarSign } from "lucide-react";
import { FormValues, CategoryDialogState } from "../types/appTypes";

const FinancialSetting: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [dialogState, setDialogState] = useState<CategoryDialogState>({
    open: false,
    categoriesToRemove: [],
    reassignMap: {},
  });

  const { data: session } = useSession();
  const [currency, setCurrency] = useState<string>(
    session?.user?.currency || "INR"
  );

  const { categories, limit } = appStore();

  const checkCategoriesWithExpenses = async (
    categoriesToCheck: string[]
  ): Promise<string[]> => {
    const categoriesWithExpenses: string[] = [];
    for (const category of categoriesToCheck) {
      const result = await checkCategoryHasExpenses({ category });
      if (
        result.success &&
        (result.data as { hasExpenses: boolean })?.hasExpenses
      ) {
        categoriesWithExpenses.push(category);
      }
    }
    return categoriesWithExpenses;
  };

  const handleDialogClose = () => {
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const handleArchiveCategories = () => {
    // For archive, we just proceed without reassigning
    // The categories will be removed from the user's settings
    setDialogState((prev) => ({ ...prev, open: false }));
  };

  const handleReassignCategories = async () => {
    if (Object.keys(dialogState.reassignMap).length === 0) {
      showError("Please assign all categories to new ones");
      return;
    }

    const result = await reassignCategories({
      oldToNewMap: dialogState.reassignMap,
    });
    if (result.success) {
      showSuccess("Categories reassigned successfully");
      setDialogState((prev) => ({ ...prev, open: false }));
    } else {
      showError(result.message);
    }
  };

  const handleReassignMapChange = (category: string, newCategory: string) => {
    setDialogState((prev) => ({
      ...prev,
      reassignMap: {
        ...prev.reassignMap,
        [category]: newCategory,
      },
    }));
  };

  const handleSubmit = async (values: FormValues): Promise<void> => {
    const initialCurrency = session?.user?.currency || "INR";
    const newLimit = parseFloat(values.limit);

    if (
      JSON.stringify(values.names) === JSON.stringify(categories) &&
      newLimit === limit &&
      currency === initialCurrency
    ) {
      showError("No changes detected");
      return;
    }

    try {
      setLoading(true);
      const result = await updateFinancialSettings({
        names: values.names,
        currency,
        limit: newLimit,
      });
      if (result.success) {
        appStore.getState().setCategories(values.names);
        appStore.getState().setLimit(newLimit);
        showSuccess("Settings updated successfully");
      } else {
        showError(result.message);
      }
    } catch (error) {
      showError((error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <Formik
        initialValues={{
          names: categories,
          limit: limit.toString(),
        }}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue }) => (
          <div className="w-full max-w-[600px] bg-background p-6 rounded-lg shadow-sm border">
            <h2 className="text-2xl font-bold mb-6 text-foreground flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-muted-foreground" />
              Financial Settings
            </h2>
            <Form>
              <MultiSelect
                label="Select Categories"
                options={CATEGORY_LIST}
                selected={values.names}
                onChange={async (event) => {
                  const value = event.target.value as string[];
                  if (value.length <= 4) {
                    const removedCategories = categories.filter(
                      (cat) => !value.includes(cat)
                    );

                    if (removedCategories.length > 0) {
                      const categoriesWithExpenses =
                        await checkCategoriesWithExpenses(removedCategories);

                      if (categoriesWithExpenses.length > 0) {
                        setDialogState({
                          open: true,
                          categoriesToRemove: categoriesWithExpenses,
                          reassignMap: {},
                        });
                        return; // Don't update the form yet
                      }
                    }

                    setFieldValue("names", value);
                  }
                }}
              />
              <div className="mt-4">
                <SelectBox
                  label="Set Currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as string)}
                  options={CURRENCIES}
                />
              </div>
              <div className="mt-4">
                <InputBox
                  name="limit"
                  label={`Set Your Budget Limit (in ${currency})`}
                  type="number"
                />
              </div>
              <div className="mt-4">
                <Button width="w-full">
                  {loading ? "Loading..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </div>
        )}
      </Formik>

      <CategoryRemovalDialog
        open={dialogState.open}
        categoriesToRemove={dialogState.categoriesToRemove}
        reassignMap={dialogState.reassignMap}
        availableCategories={categories.filter(
          (cat) => !dialogState.categoriesToRemove.includes(cat)
        )}
        onClose={handleDialogClose}
        onArchive={handleArchiveCategories}
        onReassign={handleReassignCategories}
        onReassignMapChange={handleReassignMapChange}
      />
    </div>
  );
};

export default FinancialSetting;
