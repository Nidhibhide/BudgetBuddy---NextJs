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

// export interface ApiResponse {
//   message: string;
//   success: boolean;
//   statusCode: number;
//   data?: object; // optional, can hold user or anything else
// }

export interface SelectBoxProps {
  label?: string;
  name: string;
  options: string[];
}

export interface InputBoxProps {
  label: string;
  name: string;
  type?: string;
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
}

export interface TooltipProps {
  label: string;
  children: React.ReactNode;
}

export interface GetStartedLinkProps {
  href: string;
  children: React.ReactNode;
  width?: string;
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
}

export interface AddTransactionFormValues {
  date: string;
  description: string;
  category: string;
  amount: number;
  type: string;
}

export interface AddTransactionProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (
    value: string | number,
    row: Record<string, string | number>
  ) => React.ReactNode;
}

export interface GenericTableProps {
  data: Record<string, string | number>[];
  columns: TableColumn[];
  title?: string;
  keyField?: string;
}

export interface NotFoundProps {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
}
