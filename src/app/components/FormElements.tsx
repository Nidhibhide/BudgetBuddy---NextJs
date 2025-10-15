"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
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
  TooltipProps,
  GetStartedLinkProps,
} from "@/app/types/appTypes";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const SelectBox: React.FC<SelectBoxProps> = ({
  label,
  name,
  options,
}) => {
  const [field, meta] = useField(name);

  return (
    <div className="w-full flex flex-col gap-1 relative">
      <Label htmlFor={name} className="text-base text-foreground">
        {label}
      </Label>
      <Select
        value={field.value}
        onValueChange={(value) => {
          field.onChange({ target: { name, value } });
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
}) => {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  const inputType = type === "password" && showPassword ? "text" : type;

  return (
    <div className="w-full flex flex-col gap-1 relative">
      <Label htmlFor={name} className="text-base text-foreground">
        {label}
      </Label>
      <div className="relative">
        <Input
          {...field}
          id={name}
          type={inputType}
          placeholder={placeholder || label}
          className={`h-11 placeholder:text-base text-lg text-foreground ${
            type === "password" ? "pr-10" : ""
          }`}
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
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${bgColor} text-white py-2 text-base cursor-pointer font-medium rounded-xl ${hoverColor} hover:shadow-md transition duration-500 ${width} ${className}`}
    >
      {children}
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
}) => {
  return (
    <Link
      href={href}
      className={`bg-btn-background py-2.5 px-4 text-center text-base font-medium text-white rounded-xl hover:bg-btn-hover hover:shadow-md transition duration-500 ${width}`}
    >
      {children}
    </Link>
  );
};

