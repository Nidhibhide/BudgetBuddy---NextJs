"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Lightbulb, X } from "lucide-react";
import { TotalBalanceProps } from "@/app/types/appTypes";
import { useTransactions } from "@/app/hooks/useTransactions";
import { useInsights } from "@/app/hooks/useInsights";
import { useTranslations } from "next-intl";

export const Insights: React.FC = () => {
  const { insights } = useInsights();
  const t = useTranslations('common');

  return (
    <Card className="p-6 text-foreground flex flex-col h-96 md:h-[710px]">
      <div className="flex items-center mb-4">
        <Lightbulb className="w-5 h-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-semibold">
          {t('widgets.insights.title')}
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {insights.map((insight, index) => (
            <div
              key={index}
              className="flex items-start p-3 bg-selected-background rounded-lg"
            >
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 shrink-0"></div>
              <p className="text-base text-foreground">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export const RecentTransactions: React.FC = () => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";
  const { transactions } = useTransactions({
    type: "",
    limit: 10,
    sortBy: "date",
    sortOrder: "desc",
  });
  const t = useTranslations('common');

  return (
    <Card className="p-6 text-foreground flex flex-col h-96 md:h-[710px]">
      <h3 className="text-lg font-semibold mb-4">
        {t('widgets.recentTransactions.title')}
      </h3>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2">
              <X className="w-12 h-12" />
              <p>{t('notFound.defaultTitle')}</p>
            </div>
          ) : (
            transactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 bg-selected-background rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-base">
                    {transaction.title || transaction.description}
                  </p>
                  <p className="text-sm text-foreground">
                    {new Date(transaction.date || "").toLocaleDateString()} •{" "}
                    {String(transaction.category)}
                  </p>
                </div>
                <div
                  className={`font-semibold ${
                    transaction.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {transaction.type === "income" ? "+ " : "- "}
                  {Math.abs(transaction.amount || 0).toLocaleString()} {currency}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
};

export const TotalBalance: React.FC<TotalBalanceProps> = ({ balance }) => {
  const { data: session } = useSession();
  const currency = session?.user?.currency || "INR";
  const t = useTranslations('common');

  return (
    <Card className="p-6 bg-linear-to-r from-[#6366f1] to-[#4f46e5] text-white shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2">
            {t('widgets.totalBalance.title')}
          </h3>
          <p className="text-3xl font-bold">
            {balance.toLocaleString()} {currency}
          </p>
        </div>
        <div className="text-4xl opacity-80">💰</div>
      </div>
    </Card>
  );
};
