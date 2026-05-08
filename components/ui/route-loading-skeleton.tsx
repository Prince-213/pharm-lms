import { clsx } from "clsx";

const pulse = "animate-pulse bg-[var(--surface-muted)]";

const CARD_KEYS = [
  "sk-card-1",
  "sk-card-2",
  "sk-card-3",
  "sk-card-4",
  "sk-card-5",
  "sk-card-6",
  "sk-card-7",
  "sk-card-8",
] as const;

const COL_KEYS = [
  "sk-col-a",
  "sk-col-b",
  "sk-col-c",
  "sk-col-d",
  "sk-col-e",
] as const;

const ROW_KEYS = [
  "sk-row-1",
  "sk-row-2",
  "sk-row-3",
  "sk-row-4",
  "sk-row-5",
  "sk-row-6",
  "sk-row-7",
  "sk-row-8",
] as const;

const LIST_KEYS = [
  "sk-li-1",
  "sk-li-2",
  "sk-li-3",
  "sk-li-4",
  "sk-li-5",
  "sk-li-6",
  "sk-li-7",
  "sk-li-8",
] as const;

const SECTION_KEYS = ["sk-sec-1", "sk-sec-2", "sk-sec-3", "sk-sec-4"] as const;

const NAV_KEYS = [
  "sk-nav-1",
  "sk-nav-2",
  "sk-nav-3",
  "sk-nav-4",
  "sk-nav-5",
] as const;

export function PageHeaderSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("space-y-3", className)}>
      <div
        className={clsx(
          "h-8 w-48 max-w-full rounded-[var(--radius-md)]",
          pulse,
        )}
      />
      <div
        className={clsx(
          "h-4 w-full max-w-md rounded-[var(--radius-sm)]",
          pulse,
        )}
      />
    </div>
  );
}

export function CardGridSkeleton({
  cards = 4,
  className,
}: {
  cards?: number;
  className?: string;
}) {
  const keys = CARD_KEYS.slice(0, Math.min(cards, CARD_KEYS.length));
  return (
    <div
      className={clsx("grid gap-4 sm:grid-cols-2 lg:grid-cols-4", className)}
    >
      {keys.map((key) => (
        <div
          key={key}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow-sm)]"
        >
          <div className={clsx("h-3 w-20 rounded-[var(--radius-sm)]", pulse)} />
          <div
            className={clsx("mt-4 h-8 w-16 rounded-[var(--radius-md)]", pulse)}
          />
        </div>
      ))}
    </div>
  );
}

export function TableRowsSkeleton({
  rows = 6,
  cols = 4,
  className,
}: {
  rows?: number;
  cols?: number;
  className?: string;
}) {
  const colKeys = COL_KEYS.slice(0, Math.min(cols, COL_KEYS.length));
  const rowKeys = ROW_KEYS.slice(0, Math.min(rows, ROW_KEYS.length));
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)]",
        className,
      )}
    >
      <div className="border-b border-[var(--border)] bg-[var(--background)] px-4 py-3">
        <div className="flex gap-3">
          {colKeys.map((colKey) => (
            <div
              key={colKey}
              className={clsx("h-3 flex-1 rounded-[var(--radius-sm)]", pulse)}
            />
          ))}
        </div>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {rowKeys.map((rowKey) => (
          <div key={rowKey} className="flex gap-3 px-4 py-4">
            {colKeys.map((colKey) => (
              <div
                key={`${rowKey}-${colKey}`}
                className={clsx("h-4 flex-1 rounded-[var(--radius-sm)]", pulse)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListBlockSkeleton({
  items = 5,
  className,
}: {
  items?: number;
  className?: string;
}) {
  const keys = LIST_KEYS.slice(0, Math.min(items, LIST_KEYS.length));
  return (
    <ul className={clsx("space-y-3", className)}>
      {keys.map((key) => (
        <li
          key={key}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]"
        >
          <div
            className={clsx(
              "h-4 max-w-xs rounded-[var(--radius-sm)]",
              pulse,
              "w-[70%]",
            )}
          />
          <div
            className={clsx(
              "mt-2 h-3 w-full max-w-sm rounded-[var(--radius-sm)]",
              pulse,
            )}
          />
        </li>
      ))}
    </ul>
  );
}

/** Matches curriculum editor: header bar + stacked section rows */
export function CurriculumEditorSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={clsx("space-y-4 p-4 sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={clsx("h-9 w-40 rounded-[var(--radius-md)]", pulse)} />
        <div className={clsx("h-9 w-28 rounded-[var(--radius-md)]", pulse)} />
      </div>
      {SECTION_KEYS.map((key) => (
        <div
          key={key}
          className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <div className={clsx("h-4 w-48 rounded-[var(--radius-sm)]", pulse)} />
          <div className="mt-3 space-y-2">
            <div
              className={clsx("h-3 w-full rounded-[var(--radius-sm)]", pulse)}
            />
            <div
              className={clsx("h-3 w-[85%] rounded-[var(--radius-sm)]", pulse)}
            />
            <div
              className={clsx("h-3 w-[65%] rounded-[var(--radius-sm)]", pulse)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Course player: wide content + narrow sidebar */
export function CoursePlayerSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        "flex min-h-[50vh] flex-col gap-4 lg:flex-row",
        className,
      )}
    >
      <div className="min-h-[280px] flex-1 rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-sm)]">
        <div
          className={clsx(
            "h-6 max-w-lg rounded-[var(--radius-md)]",
            pulse,
            "w-[60%]",
          )}
        />
        <div
          className={clsx(
            "mt-6 aspect-video w-full rounded-[var(--radius-lg)]",
            pulse,
          )}
        />
        <div className="mt-4 space-y-2">
          <div
            className={clsx("h-3 w-full rounded-[var(--radius-sm)]", pulse)}
          />
          <div
            className={clsx("h-3 w-full rounded-[var(--radius-sm)]", pulse)}
          />
          <div
            className={clsx("h-3 w-[80%] rounded-[var(--radius-sm)]", pulse)}
          />
        </div>
      </div>
      <aside className="w-full shrink-0 space-y-3 lg:w-72">
        <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4">
          <div className={clsx("h-4 w-24 rounded-[var(--radius-sm)]", pulse)} />
          <div className="mt-3 space-y-2">
            {NAV_KEYS.map((key) => (
              <div
                key={key}
                className={clsx("h-8 w-full rounded-[var(--radius-sm)]", pulse)}
              />
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
