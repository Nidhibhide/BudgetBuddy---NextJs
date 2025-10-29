import mongoose from "mongoose";

export interface HeaderProps {
  children?: React.ReactNode;
}

export interface SignInFormValues {
  email: string;
  password: string;
}

export interface RegisterUserData {
  name: string;
  email: string;
  password: string;
}

export interface ApiResponse {
  message: string;
  success: boolean;
  statusCode: number;
  data?: object; // optional, can hold user or anything else
}

export interface SelectBoxProps {
  label?: string;
  name: string;
  options: string[];
  onChange?: (value: string) => void;
  value?: string;
}

export interface InputBoxProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
}

export interface TextareaBoxProps {
  label: string;
  name: string;
  placeholder?: string;
}

export interface CustomTabPanelProps {
  children?: React.ReactNode;
  value: number;
  index: number;
}

export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "submit" | "button";
  disabled?: boolean;
  width?: string;
  className?: string;
  bgColor?: string;
  hoverColor?: string;
  loading?: boolean;
}

export interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export interface GetStartedLinkProps {
  href: string;
  children: React.ReactNode;
  width?: string;
  onClick?: () => void;
  loading?: boolean;
}

export type ConnectionObject = {
  isConnected?: number;
};

export interface UserFormValues {
  name: string;
  email: string;
  currency: string;
  OldPassword: string;
  NewPassword: string;
  ConfirmPassword: string;
}

export interface AppState {
  categories: string[];
  limit: number;
  setCategories: (categories: string[]) => void;
  setLimit: (limit: number) => void;
}

export interface FormValues {
  names: string[];
  limit: string;
}

export interface Category {
  name: string;
  type: string;
  _id?: string;
  user?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddCategoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCategoryAdded?: () => void;
}

export interface Transaction {
  id?: number;
  title?: string;
  date?: Date |string ;
  description?: string;
  category?: string | number | mongoose.Types.ObjectId | undefined;
  amount?: number;
  type?: string;
  _id?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: string | number | Date | mongoose.Types.ObjectId | undefined;
}

export interface AddTransactionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTransactionAdded?: () => void;
  transaction?: Transaction | null;
}
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (
    value: string | number | Date | mongoose.Types.ObjectId | undefined,
    row: Record<string, string | number | Date | mongoose.Types.ObjectId | undefined>
  ) => React.ReactNode;
}

export interface GenericTableProps {
  data: Record<string, string | number | Date | mongoose.Types.ObjectId | undefined>[];
  columns: TableColumn[];
  title?: string;
  keyField?: string;
  onSort?: (column: string) => void;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface NotFoundProps {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface MatchStage {
  user: string | object;
  isDeleted: boolean;
  type?: string;
  "category.name"?: string;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export interface TypeTotal {
  type: string;
  total: number;
  categories: {
    category: string;
    total: number;
    percentage: number;
  }[];
}
export interface ConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
}

