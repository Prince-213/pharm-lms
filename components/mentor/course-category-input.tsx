"use client";

import { useEffect, useId, useState } from "react";
import {
  mergeCategoryOptions,
  SUGGESTED_COURSE_CATEGORIES,
} from "@/lib/courses/course-category-options";
import { cn } from "@/lib/utils";

type CourseCategoryInputProps = {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
};

export function CourseCategoryInput({
  id,
  value,
  onChange,
  disabled,
  className,
  placeholder = "Choose a suggestion or type your own category",
}: CourseCategoryInputProps) {
  const autoId = useId();
  const inputId = id ?? `course-category-${autoId}`;
  const listId = `${inputId}-suggestions`;
  const [options, setOptions] = useState<string[]>([
    ...SUGGESTED_COURSE_CATEGORIES,
  ]);

  useEffect(() => {
    fetch("/api/tutor/course-categories", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { categories?: string[] } | null) => {
        if (data?.categories?.length) {
          setOptions(
            mergeCategoryOptions(SUGGESTED_COURSE_CATEGORIES, data.categories),
          );
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <input
        id={inputId}
        list={listId}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={120}
        disabled={disabled}
        placeholder={placeholder}
        className={cn(className)}
      />
      <datalist id={listId}>
        {options.map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </>
  );
}
