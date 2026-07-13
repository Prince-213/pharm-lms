"use client";

import { useCallback, useEffect, useRef } from "react";

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "");
}

type RichTextAreaProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeightClass?: string;
  disabled?: boolean;
};

export function RichTextArea({
  value,
  onChange,
  placeholder = "",
  minHeightClass = "min-h-[140px]",
  disabled = false,
}: RichTextAreaProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (el.innerHTML !== value) {
      el.innerHTML = value;
    }
  }, [value]);

  const exec = useCallback(
    (command: string) => {
      ref.current?.focus();
      document.execCommand(command, false);
      const html = sanitizeHtml(ref.current?.innerHTML ?? "");
      onChange(html);
    },
    [onChange],
  );

  return (
    <div className="rounded border border-[var(--border)] bg-[var(--surface)]">
      <div className="flex flex-wrap gap-1 border-b border-[var(--border)] px-2 py-1 text-xs">
        <button
          type="button"
          disabled={disabled}
          className="rounded px-2 py-0.5 hover:bg-[var(--surface-muted)] disabled:opacity-40"
          onClick={() => exec("bold")}
        >
          B
        </button>
        <button
          type="button"
          disabled={disabled}
          className="rounded px-2 py-0.5 hover:bg-[var(--surface-muted)] disabled:opacity-40"
          onClick={() => exec("italic")}
        >
          I
        </button>
        <button
          type="button"
          disabled={disabled}
          className="rounded px-2 py-0.5 hover:bg-[var(--surface-muted)] disabled:opacity-40"
          onClick={() => exec("insertUnorderedList")}
        >
          • List
        </button>
        <button
          type="button"
          disabled={disabled}
          className="rounded px-2 py-0.5 hover:bg-[var(--surface-muted)] disabled:opacity-40"
          onClick={() => exec("insertOrderedList")}
        >
          1. List
        </button>
      </div>
      <div
        ref={ref}
        className={`${minHeightClass} w-full px-3 py-2 text-sm outline-none ${disabled ? "bg-[var(--surface-muted)] text-muted-foreground" : ""}`}
        contentEditable={!disabled}
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={() => {
          const html = sanitizeHtml(ref.current?.innerHTML ?? "");
          onChange(html);
        }}
      />
      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
}
