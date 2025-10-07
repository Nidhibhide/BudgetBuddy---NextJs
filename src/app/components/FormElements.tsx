"use client"
import React from "react";
import Link from "next/link";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Checkbox,
  ListItemText,
  TextField,
} from "@mui/material";
import { useField } from "formik";
import { SelectBoxProps, InputBoxProps, ButtonProps, MultiSelectProps, TooltipProps, GetStartedLinkProps } from '@/app/types/appTypes';

export const SelectBox: React.FC<SelectBoxProps> = ({ label, value, options, onChange }) => {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel className="text-muted">
          {label}
        </InputLabel>

        <Select
           value={value}
           label={label}
           onChange={onChange}
           className="bg-primary text-primary"
           MenuProps={{
             disablePortal: true,
             PaperProps: {
               className: "bg-primary text-primary",
               style: {
                 maxHeight: 48 * 4.5,
               },
             },
           }}
         >
           {options.map((option) => (
             <MenuItem
               key={option}
               value={option}
               className="text-primary hover:bg-secondary"
             >
               {option}
             </MenuItem>
           ))}
        </Select>
      </FormControl>
    </Box>
  );
};

// export const InputBox: React.FC<InputBoxProps> = ({ label, name, type = "text", icon }) => {
//   const [field, meta] = useField(name);

//   return (
//     <div className="w-full">
//       <TextField
//         {...field}
//         type={type}
//         label={label}
//         variant="outlined"
//         error={meta.touched && Boolean(meta.error)}
//         helperText={meta.touched && meta.error}
//         fullWidth
//         InputProps={{
//           className: "text-foreground",
//           startAdornment: icon ? (
//             <div className="mr-2 text-muted">
//               {icon}
//             </div>
//           ) : undefined,
//         }}
//         InputLabelProps={{
//           className: "text-muted",
//         }}
//       />
//     </div>
//   );
// };

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

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  selected = [],
  onChange,
  error,
}) => {
  return (
    <FormControl fullWidth size="small" variant="outlined" error={!!error}>
      <InputLabel className="text-muted">
        {label}
      </InputLabel>

      <Select
        multiple
        value={selected}
        onChange={onChange}
        label={label}
        renderValue={(selected: string[]) => selected.join(", ")}
        className="bg-primary text-primary"
        MenuProps={{
          disablePortal: true,
          PaperProps: {
            className: "bg-primary text-primary",
            style: { maxHeight: 48 * 4.5 },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            className="text-primary"
          >
            <Checkbox checked={selected.includes(option)} />
            <ListItemText primary={option} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
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

export const GetStartedLink: React.FC<GetStartedLinkProps> = ({ href, children, width = 'w-full sm:w-[150px]' }) => {
  return (
    <Link
      href={href}
      className={`bg-btn-background py-2.5 px-4 text-center text-base font-medium text-white rounded-xl hover:bg-btn-hover hover:shadow-md transition duration-500 ${width}`}
    >
      {children}
    </Link>
  );
};

