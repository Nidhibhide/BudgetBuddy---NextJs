"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Plus, MousePointer, AlertTriangle, Loader2 } from "lucide-react";
import { TYPES, CATEGORY_LIST } from "@/lib/constants";
import {
  AddCategory,
  CustomPagination,
  NotFound,
} from "@/app/components/index";
import { Table } from "@/app/components/index";
// import { CategoryData, CategoryRecord } from "@/app/types/appTypes";
import { getCategoryDetails } from "@/app/lib/category";
import type { Category } from "@/app/types/appTypes";

const Category: React.FC = () => {
  const [isExpense, setIsExpense] = useState(true);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [data, setData] = useState<Category[]>([]);
  // const [records, setRecords] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [recordsLoading, setRecordsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  // Fetch category details
  const fetchCategoryDetails = async (type: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCategoryDetails(type);
      console.log(result);
      if (result.success && result.data) {
        setData(result.data);
      } else {
        setError(result.message || "Failed to fetch category details");
      }
    } catch (err) {
      setError("Failed to fetch category details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryDetails(isExpense ? "Expense" : "Income");
  }, [isExpense]);

  return (
    <div className="w-full p-4 space-y-3">
      {/* Header with Switch */}
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-bold text-foreground">
          Category Overview
        </h2>
        <div className="flex items-center space-x-3">
          <Label
            htmlFor="expense-income-switch"
            className="text-base font-medium text-foreground"
          >
            {isExpense ? "Expense" : "Income"}
          </Label>
          <Switch
            id="expense-income-switch"
            checked={isExpense}
            onCheckedChange={setIsExpense}
            className="bg-[var(--foreground)]"
          />
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ">
        {loading ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          </div>
        ) : error ? (
          <div className="col-span-full flex justify-center items-center py-8">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <div className="text-lg font-semibold text-foreground">Error</div>
              <div className="text-sm text-foreground/70">{error}</div>
            </div>
          </div>
        ) : (
          <>
            {data?.map((category, index) => (
              <Card
                key={index}
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-background cursor-pointer"
                onClick={() => {
                  setSelectedCategory(category.name);
                  setCurrentPage(1);
                }}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold text-foreground">
                      {category.name}
                    </CardTitle>
                    <div className="w-4 h-4 rounded-full bg-foreground"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground">
                      {/* ₹{category.amount.toLocaleString()} */} 400
                    </div>
                    <div className="text-sm text-foreground">
                      {/* {category.percentage}% of total */}40%
                    </div>
                    <div className="w-full bg-foreground rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          isExpense ? "bg-red-500" : "bg-green-500"
                        } transition-all duration-500`}
                        // style={{ width: `${category.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {data.length < 4 && (
              <Card
                className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 bg-background border-dashed border-2 border-foreground/50 cursor-pointer"
                onClick={() => setIsAddCategoryOpen(true)}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-8">
                  <div className="w-12 h-12 rounded-full bg-foreground/10 flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-foreground" />
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    Add Category
                  </div>
                  <div className="text-sm text-foreground/70">
                    Create a new category
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Table Section */}
      {/* {selectedCategory ? (
        recordsLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-foreground" />
          </div>
        ) : .length > 0 ? (
          <>
            <Table
              data={records}
              columns={[
                { key: "date", label: "Date", sortable: true },
                { key: "description", label: "Description" },
                { key: "amount", label: "Amount", sortable: true },
                { key: "type", label: "Type" },
              ]}
              title={`Records for ${selectedCategory}`}
            />
            <div className="flex justify-end mt-4">
              <CustomPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                className="justify-end"
              />
            </div>
          </>
        ) : (
          <NotFound
            title="No Records Found"
            message={`There are no transaction records available for ${selectedCategory}. Try selecting a different category or add some transactions.`}
            icon={AlertTriangle}
          />
        )
      ) : (
        <NotFound
          title="Select a Category"
          message="Click on any category card above to view its detailed transaction records and insights."
          icon={MousePointer}
        />
      )}  */}

      <AddCategory
        open={isAddCategoryOpen}
        onOpenChange={setIsAddCategoryOpen}
      />
    </div>
  );
};

export default Category;
