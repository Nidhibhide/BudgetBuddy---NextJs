"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Lightbulb, X, Loader2 } from "lucide-react";
import { TotalBalanceProps } from "@/app/types/appTypes";
import { useTransactions } from "@/app/hooks/useTransactions";
import { useInsights } from "@/app/hooks/useInsights";

const ListLoader = () => (
  <div className="flex items-center justify-center py-10">
    <Loader2 className="w-7 h-7 animate-spin text-btn-background" />
  </div>
);

export const Insights: React.FC = () => {
  const { insights, loading } = useInsights();

  return (
    <Card className="p-4 text-foreground bg-card border-border shadow-sm flex flex-col h-full">
      <div className="flex items-center mb-3">
        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold">Insights</h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <ListLoader />
        ) : (
          <div className="space-y-2.5">
            {insights.map((insight, index) => (
              <div
                key={index}
                className="flex items-start px-3 py-2.5 border border-border dark:border-white/20 rounded-lg bg-card"
              >
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
                <p className="text-base font-medium text-foreground">{insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export const RecentTransactions: React.FC = () => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";
  const { transactions, loading } = useTransactions({
    type: "",
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
  });

  return (
    <Card className="p-4 text-foreground bg-card border-border shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-semibold mb-3">Recent Transactions</h3>
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <ListLoader />
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
            <X className="w-12 h-12 text-foreground/60" />
            <p>No Data Found</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between gap-2 p-2.5 border border-border dark:border-white/20 rounded-lg bg-card"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-base truncate">
                    {transaction.title || transaction.description}
                  </p>
                  <p className="text-sm text-foreground truncate">
                    {new Date(transaction.date || "").toLocaleDateString()} •{" "}
                    {String(transaction.category)}
                  </p>
                </div>
                <div
                  className={`font-semibold shrink-0 ${
                    transaction.type === "Income"
                      ? "text-success"
                      : "text-destructive"
                  }`}
                >
                  {transaction.type === "Income" ? "+ " : "- "}
                  {Math.abs(transaction.amount || 0).toLocaleString()} {currency}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export const TotalBalance: React.FC<TotalBalanceProps> = ({
  balance,
  loading = false,
}) => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";

  return (
    <Card className="p-6 bg-card text-foreground border border-border border-l-4 border-l-btn-background shadow-sm">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-muted-foreground">
            Total Balance
          </h3>
          {loading ? (
            <Loader2 className="w-7 h-7 animate-spin text-btn-background" />
          ) : (
            <p className="text-3xl font-bold text-foreground">
              {balance.toLocaleString()} {currency}
            </p>
          )}
        </div>
        <div className="text-4xl opacity-80">💰</div>
      </div>
    </Card>
  );
};
