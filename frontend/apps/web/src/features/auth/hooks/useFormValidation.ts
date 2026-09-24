"use client";

import { useState } from "react";

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^(0|\+84)[35789]\d{8}$/;
export const OTP_REGEX = /^\d{6}$/;

export interface ValidationRule {
  validate: (value: string, allValues?: Record<string, string>) => boolean;
  message: string;
}

export type FieldRules<T extends string> = Record<T, ValidationRule[]>;

export function useFormValidation<T extends string>(rules: Partial<FieldRules<T>>) {
  const [errors, setErrors] = useState<Partial<Record<T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<T, boolean>>>({});

  const validateField = (field: T, value: string, allValues?: Record<string, string>): boolean => {
    const fieldRules = rules[field];
    if (!fieldRules || fieldRules.length === 0) return true;

    for (const rule of fieldRules) {
      if (!rule.validate(value, allValues)) {
        setErrors((prev) => ({ ...prev, [field]: rule.message }));
        return false;
      }
    }

    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    return true;
  };

  const validateAll = (values: Record<T, string>): boolean => {
    const newErrors: Partial<Record<T, string>> = {};
    let isValid = true;
    const newTouched: Partial<Record<T, boolean>> = {};

    (Object.keys(rules) as T[]).forEach((field) => {
      newTouched[field] = true;
      const fieldRules = rules[field];
      if (fieldRules) {
        for (const rule of fieldRules) {
          if (!rule.validate(values[field] || "", values)) {
            newErrors[field] = rule.message;
            isValid = false;
            break;
          }
        }
      }
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return isValid;
  };

  const clearError = (field: T) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const getFieldError = (field: T): string | undefined => {
    return errors[field];
  };

  const getInputClassName = (field: T, baseClass: string = ""): string => {
    const hasError = !!errors[field];
    if (hasError) {
      return `${baseClass} !border-red-500 !text-red-900 focus:!border-red-500 focus:!ring-red-500/20 bg-red-50/40`.trim();
    }
    return baseClass;
  };

  return {
    errors,
    touched,
    validateField,
    validateAll,
    clearError,
    getFieldError,
    getInputClassName,
    setErrors,
  };
}
