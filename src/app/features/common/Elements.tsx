"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2} from "lucide-react";
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

export const SelectBox: React.FC<SelectBoxProps> = ({
  label,
  name,
  options,
  onChange,
  value,
}) => {
  const [field, meta] = useField(name);

  return (
    <div className="w-full flex flex-col gap-1 relative">
      <Label htmlFor={name} className="text-base text-foreground">
        {label}
      </Label>
      <Select
        value={value ?? field.value}
        onValueChange={(value) => {
          field.onChange({ target: { name, value } });
          if (onChange) onChange(value);
        }}
      >
        <SelectTrigger className="h-11 bg-background text-foreground border-foreground cursor-pointer">
          <SelectValue placeholder={label} />
        </SelectTrigger>
        <SelectContent className="bg-background text-foreground border-foreground">
          {options.map((option: string) => (
            <SelectItem
              key={option}
              value={option}
              className="hover:bg-foreground/10"
            >
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {meta.touched && meta.error && (
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

  const inputValue = value !== undefined ? value : field?.value || '';
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
          className={`h-11 placeholder:text-base text-lg text-foreground ${
            type === "password" ? "pr-10" : ""
          } ${inputClassName || ""}`}
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
        className="placeholder:text-base text-lg text-foreground resize-none min-h-[80px]"
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
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${bgColor} text-white py-2 text-base cursor-pointer font-medium rounded-xl ${hoverColor} hover:shadow-md transition duration-500 ${width} ${className} ${
        loading ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-foreground" size={16} />
          Loading...
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
      <span className="absolute hidden group-hover:block top-full mt-1 left-1/2 -translate-x-1/2 bg-black text-white text-sm rounded px-2 py-1 whitespace-nowrap z-50">
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
}) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`bg-btn-background py-2.5 px-4 text-center text-base font-medium text-white rounded-xl hover:bg-btn-hover hover:shadow-md transition duration-500 ${width} ${
        loading ? "cursor-not-allowed opacity-50" : ""
      }`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin text-foreground" size={16} />
          Loading...
        </div>
      ) : (
        children
      )}
    </Link>
  );
};


