export const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const TYPES = ["Expense", "Income"];

export const CATEGORIES = ["Shopping", "Hotel", "Transport", "Others"];

export const CURRENCIES = [
  "USD", // US Dollar
  "EUR", // Euro
  "INR", // Indian Rupee
  "GBP", // British Pound
];

export const THEMES = ["Light", "Dark"];

export const CATEGORY_LIST = [
  "Shopping",
  "Hotel",
  "Transport",
  "Others",
  "Groceries",
  "Entertainment",
  "Education",
];



export const DEFAULT_INSIGHTS = [
  "Track your expenses regularly to stay on budget.",
  "Set financial goals to motivate your savings.",
  "Review your spending patterns monthly.",
  "Save a portion of your income for emergencies.",
  "Use categories to organize your transactions.",
];

export const LANGUAGES = ["en", "hi"] as const;
export const DEFAULT_LANGUAGE = "en";
export type Language = "en" | "hi";

export const LANGUAGE_OPTIONS = [
  { code: "en", display: "English" },
  { code: "hi", display: "हिन्दी" },
] as const;

export const colorPalette = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'
];