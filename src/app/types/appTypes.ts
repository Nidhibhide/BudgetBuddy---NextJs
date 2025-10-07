import React from 'react';
import { SelectChangeEvent } from '@mui/material';

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
  data?: object;  // optional, can hold user or anything else
}

export interface SelectBoxProps {
  label: string;
  value: string | number;
  options: string[];
  onChange: (event: SelectChangeEvent<string | number>) => void;
}


export interface InputBoxProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
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

export interface MultiSelectProps {
  label: string;
  options: string[];
  selected?: string[];
  onChange: (event: SelectChangeEvent<string[]>) => void;
  error?: string;
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


