import React from "react";
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
import { SelectBoxProps, InputBoxProps, ButtonProps, MultiSelectProps, TooltipProps } from '../types';

export const SelectBox: React.FC<SelectBoxProps> = ({ label, value, options, onChange }) => {
  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl fullWidth size="small">
        <InputLabel className="text-gray-700 dark:text-gray-300">
          {label}
        </InputLabel>

        <Select
          value={value}
          label={label}
          onChange={onChange}
          className="bg-white text-black dark:bg-gray-900 dark:text-white"
          MenuProps={{
            disablePortal: true,
            PaperProps: {
              className: "bg-white dark:bg-gray-800 text-black dark:text-white",
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
              className="text-black dark:text-white dark:hover:bg-gray-700"
            >
              {option}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export const InputBox: React.FC<InputBoxProps> = ({ label, name, type = "text" }) => {
  const [field, meta] = useField(name);

  return (
    <div className="w-full p-2 rounded  text-black dark:bg-gray-900 dark:text-white">
      <TextField
        {...field}
        type={type}
        label={label}
        variant="standard"
        error={meta.touched && Boolean(meta.error)}
        helperText={meta.touched && meta.error}
        fullWidth
        InputProps={{
          className: "text-black dark:text-white",
        }}
        InputLabelProps={{
          className: "text-gray-700 dark:text-gray-300",
        }}
      />
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
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`bg-[#6366f1] dark:bg-[#818cf8] text-white py-2  text-base font-medium rounded-xl hover:bg-indigo-600 hover:shadow-md transition duration-500 ${width} ${className}`}
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
      <InputLabel className="text-gray-700 dark:text-gray-300">
        {label}
      </InputLabel>

      <Select
        multiple
        value={selected}
        onChange={onChange}
        label={label}
        renderValue={(selected: string[]) => selected.join(", ")}
        className="bg-white text-black dark:bg-gray-900 dark:text-white"
        MenuProps={{
          disablePortal: true,
          PaperProps: {
            className: "bg-white dark:bg-gray-800 text-black dark:text-white",
            style: { maxHeight: 48 * 4.5 },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option}
            value={option}
            className="text-black dark:text-white"
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