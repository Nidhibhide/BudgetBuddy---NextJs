"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useField } from "formik";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SelectBoxProps,
  ButtonProps,
  InputBoxProps,
  TextareaBoxProps,
  TooltipProps,
  GetStartedLinkProps,
} from "@/app/types/appTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/app/features/common/helpers/tailwind";

export const SelectBox: React.FC<SelectBoxProps> = ({
  label,
  name,
  options,
  onChange,
  value,
  className,
  icon,
}) => {
  const [mounted, setMounted] = useState(false);
  let field, meta;
  try {
    [field, meta] = useField(name);
  } catch {
    field = null;
    meta = null;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const selectValue = value !== undefined ? value : field?.value || "";
  const triggerClassName = `h-11 bg-card text-foreground border-border cursor-pointer flex items-center gap-2 ${className || ""}`;

  const handleValueChange = (selectedValue: string) => {
    if (field) {
      field.onChange({ target: { name, value: selectedValue } });
    }
    if (onChange) onChange(selectedValue);
  };

  return (
    <div className="w-full flex flex-col gap-1 relative">
      {label && (
        <Label htmlFor={name} className="text-base text-foreground">
          {label}
        </Label>
      )}
      {!mounted ? (
        <div
          className={`rounded-md border px-3 py-2 text-sm shadow-sm ${triggerClassName}`}
          aria-hidden="true"
        >
          {icon}
          <span className="text-muted-foreground">{selectValue || label || ""}</span>
        </div>
      ) : (
        <Select value={selectValue} onValueChange={handleValueChange}>
          <SelectTrigger className={triggerClassName}>
            {icon}
            <SelectValue placeholder={label} />
          </SelectTrigger>
          <SelectContent className="bg-card text-foreground border-border">
            {options.map((option: string) => (
              <SelectItem
                key={option}
                value={option}
                className="hover:bg-muted"
              >
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {meta?.touched && meta?.error && (
        <p className="text-red-500 text-sm">{meta.error}</p>
      )}
    </div>
  );
};

export const InputBox: React.FC<InputBoxProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  inputClassName,
}) => {
  let field, meta;
  try {
    [field, meta] = useField(name);
  } catch {
    field = null;
    meta = null;
  }
  const [showPassword, setShowPassword] = useState(false);

  const inputValue = value !== undefined ? value : field?.value || "";
  const inputType = type === "password" && showPassword ? "text" : type;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (field) field.onChange(e);
    if (onChange) onChange(e);
  };

  return (
    <div className="w-full flex flex-col gap-1 relative">
      <Label htmlFor={name} className="text-base text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          value={inputValue}
          id={name}
          type={inputType}
          placeholder={placeholder || label}
          onChange={handleChange}
          className={cn(
            "h-11 bg-card border-border placeholder:text-base text-base text-foreground dark:bg-card",
            type === "password" && "pr-10",
            inputClassName
          )}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        )}
      </div>
      {meta?.touched && meta?.error && (
        <p className="text-red-500 text-sm">{meta.error}</p>
      )}
    </div>
  );
};

export const TextareaBox: React.FC<TextareaBoxProps> = ({
  label,
  name,
  placeholder,
}) => {
  const [field, meta] = useField(name);

  return (
    <div className="w-full flex flex-col gap-1 relative">
      <Label htmlFor={name} className="text-base text-foreground">
        {label}
      </Label>
      <Textarea
        {...field}
        id={name}
        placeholder={placeholder || label}
        className="bg-card border-border placeholder:text-base text-base text-foreground resize-none min-h-20"
      />
      {meta.touched && meta.error && (
        <p className="text-red-500 text-sm">{meta.error}</p>
      )}
    </div>
  );
};
export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  type = "submit",
  disabled = false,
  width = "w-full",
  className = "",
  bgColor = "bg-btn-background",
  hoverColor = "hover:bg-btn-hover",
  loading = false,
  text,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "h-11 inline-flex items-center justify-center gap-2 px-4 py-2 text-base cursor-pointer font-medium rounded-xl hover:shadow-md transition duration-500 text-white",
        bgColor,
        hoverColor,
        width,
        loading && "cursor-not-allowed opacity-50",
        className
      )}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <span>{text || children}</span>
          <Loader2 className="animate-spin text-white" size={20} />
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export const Tooltip: React.FC<TooltipProps> = ({ label, children }) => {
  return (
    <div className="relative group inline-block cursor-pointer">
      {children}
      <span className="absolute hidden group-hover:block top-full mt-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-sm rounded px-2 py-1 whitespace-nowrap z-50 pointer-events-none">
        {label}
      </span>
    </div>
  );
};
export const GetStartedLink: React.FC<GetStartedLinkProps> = ({
  href,
  children,
  width = "w-full sm:w-[150px]",
  onClick,
  loading = false,
  text,
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`h-11 flex items-center justify-center bg-btn-background py-2.5 px-4 text-center text-base font-medium text-white rounded-xl hover:bg-btn-hover hover:shadow-md transition duration-500 ${width} ${
        loading ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <span>{text || children}</span>
          <Loader2 className="animate-spin text-white" size={20} />
        </div>
      ) : (
        children
      )}
    </Link>
  );
};
