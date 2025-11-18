/* eslint-disable @typescript-eslint/no-explicit-any */
import { PipelineStage } from "mongoose";
import { convertFromINR } from "./currencyConverter";

export const setParamValue = (url: URL, key: string) => {
  const value = url.searchParams.get(key);
  return value === null || value === "undefined" ? undefined : value;
};

export const parsePaginationParams = (url: URL, defaultSortBy = "createdAt") => {
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = parseInt(url.searchParams.get("limit") || "10");
  const sortBy = url.searchParams.get("sortBy") || defaultSortBy;
  const sortOrder = url.searchParams.get("sortOrder") || "desc";
  const skip = (page - 1) * limit;
  return { page, limit, sortBy, sortOrder, skip };
};

export const createPaginationPipeline = (
  matchStage: Record<string, any>,
  projectFields: Record<string, any>,
  sortBy: string,
  sortOrder: string,
  skip: number,
  limit: number
): PipelineStage[] => [
  { $match: matchStage },
  {
    $facet: {
      data: [
        { $project: projectFields },
        { $sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 } },
        { $skip: skip },
        { $limit: limit },
      ],
      totalCount: [{ $count: "count" }],
    },
  },
];

export const convertAmountsToUserCurrency = async <T extends { amount: number }>(
  items: T[],
  userCurrency: string,
  t: (key: string) => string
): Promise<T[]> =>
  Promise.all(
    items.map(async (item) => ({
      ...item,
      amount: item.amount ? await convertFromINR(item.amount, userCurrency, t) : 0,
    }))
  );