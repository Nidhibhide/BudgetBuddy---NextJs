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

export const DEFAULT_TIPS = [
  "📌 Stay consistent — tracking even small expenses gives you better control.",
  "💡 Set a budget to clearly see how much you can save.",
  "📊 Check your expense graphs regularly to spot overspending early.",
  "💰 Budgeting isn’t about restriction, it’s about awareness and choice.",
];

export const LANGUAGES = ["en", "hi", "mr"] as const;
export const DEFAULT_LANGUAGE = "en";
export type Language = "en" | "hi" | "mr";

export const LANGUAGE_OPTIONS = [
  { code: "en", display: "English" },
  { code: "hi", display: "हिन्दी" },
  { code: "mr", display: "मराठी" },
] as const;