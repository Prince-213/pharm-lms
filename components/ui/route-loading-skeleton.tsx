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

/** Auth split layout — mirrors AuthLayoutShell + LoginForm */
export function AuthPageSkeleton({
  className,
  variant = "login",
}: {
  className?: string;
  variant?: "login" | "signup" | "admin";
}) {
  const fieldCount = variant === "signup" ? 4 : 2;
  const showOauth = variant !== "admin";
  const fieldKeys = ["sk-f1", "sk-f2", "sk-f3", "sk-f4"].slice(0, fieldCount);

  return (
    <div
      className={clsx(
        "auth-saas relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2",
        className,
      )}
      aria-busy="true"
      aria-label="Loading sign-in"
    >
      <div className="relative hidden h-full flex-col border-r border-[var(--border)] bg-[var(--surface-muted)] p-10 lg:flex">
        <div className={clsx("h-8 w-40 rounded-[var(--radius-md)]", pulse)} />
        <div className={clsx("mt-6 h-3 w-24 rounded-[var(--radius-sm)]", pulse)} />
        <div className="mt-auto space-y-3">
          <div className={clsx("h-5 w-full max-w-md rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("h-5 w-[90%] max-w-sm rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("h-5 w-[75%] max-w-xs rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("mt-4 h-3 w-40 rounded-[var(--radius-sm)]", pulse)} />
        </div>
      </div>
      <div className="relative flex min-h-screen flex-col justify-center px-6 py-10 sm:px-8">
        <div className={clsx("absolute top-7 left-5 h-8 w-16 rounded-[var(--radius-sm)]", pulse)} />
        <div className="mx-auto w-full max-w-sm space-y-4">
          <div className={clsx("h-7 w-32 rounded-[var(--radius-md)] lg:hidden", pulse)} />
          <div className={clsx("h-6 w-28 rounded-full", pulse)} />
          <div className={clsx("h-8 w-56 rounded-[var(--radius-md)]", pulse)} />
          <div className={clsx("h-4 w-full max-w-xs rounded-[var(--radius-sm)]", pulse)} />
          {variant !== "admin" ? (
            <div className={clsx("h-4 w-48 rounded-[var(--radius-sm)]", pulse)} />
          ) : null}
          {showOauth ? (
            <div className="space-y-3 pt-1">
              <div className={clsx("h-11 w-full rounded-[var(--radius-md)]", pulse)} />
              <div className="flex items-center gap-3">
                <div className={clsx("h-px flex-1", pulse)} />
                <div className={clsx("h-3 w-8 rounded-[var(--radius-sm)]", pulse)} />
                <div className={clsx("h-px flex-1", pulse)} />
              </div>
            </div>
          ) : null}
          <div className="space-y-3 pt-1">
            {fieldKeys.map((key) => (
              <div
                key={key}
                className={clsx("h-11 w-full rounded-[var(--radius-md)]", pulse)}
              />
            ))}
          </div>
          <div className={clsx("h-11 w-full rounded-[var(--radius-md)]", pulse)} />
          <div className={clsx("mx-auto h-3 w-44 rounded-[var(--radius-sm)]", pulse)} />
        </div>
      </div>
    </div>
  );
}

export function AdminAuthPageSkeleton({ className }: { className?: string }) {
  return <AuthPageSkeleton className={className} variant="admin" />;
}

/** Generic marketing content page (about-style): gray hero + 2-col + lower sections */
export function MarketingAudiencePageSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={clsx("min-h-screen", className)}>
      <span className="sr-only">Loading page</span>
      <div className="bg-[#f0f0f0] py-10">
        <div className="mx-auto w-[90%] space-y-4 lg:w-[80%]">
          <div className={clsx("h-3 w-40 rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("h-12 w-full max-w-xl rounded-[var(--radius-lg)]", pulse)} />
        </div>
        <div className={clsx("mx-auto mt-8 aspect-[21/9] w-[90%] max-w-5xl rounded-2xl lg:w-[80%]", pulse)} />
      </div>
      <div className="mx-auto grid w-[90%] gap-10 py-16 lg:w-[80%] lg:grid-cols-2">
        <div className={clsx("aspect-[4/3] w-full rounded-2xl", pulse)} />
        <div className="space-y-4">
          <div className={clsx("h-8 w-3/4 rounded-[var(--radius-md)]", pulse)} />
          <div className={clsx("h-4 w-full rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("h-4 w-[90%] rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("h-4 w-[80%] rounded-[var(--radius-sm)]", pulse)} />
        </div>
      </div>
    </div>
  );
}

export function MarketingContactPageSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={clsx("min-h-screen", className)}>
      <span className="sr-only">Loading contact</span>
      <div className="bg-[#f0f0f0] py-10">
        <div className="mx-auto w-[90%] space-y-4 lg:w-[80%]">
          <div className={clsx("h-3 w-32 rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("h-12 w-64 rounded-[var(--radius-lg)]", pulse)} />
        </div>
      </div>
      <div className="bg-[#f0f0f0] py-12">
        <div className="mx-auto flex w-[90%] flex-col gap-8 lg:w-[80%] lg:flex-row">
          <div className="flex-1 space-y-3 rounded-2xl border border-[var(--border)] bg-white p-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={clsx("h-11 w-full rounded-[var(--radius-md)]", pulse)} />
            ))}
            <div className={clsx("h-28 w-full rounded-[var(--radius-md)]", pulse)} />
            <div className={clsx("h-11 w-32 rounded-[var(--radius-md)]", pulse)} />
          </div>
          <div className="flex flex-1 flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl border border-[var(--border)] bg-white p-5"
              >
                <div className={clsx("h-5 w-32 rounded-[var(--radius-sm)]", pulse)} />
                <div className={clsx("mt-3 h-4 w-full rounded-[var(--radius-sm)]", pulse)} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Catalog: toolbar + filter aside + result grid — matches CoursesCatalogSection */
export function MarketingCatalogSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={clsx("min-h-screen py-8 lg:py-10", className)}>
      <span className="sr-only">Loading courses</span>
      <div className="mx-auto w-[96%] max-w-[1600px] space-y-6 sm:w-[94%] lg:w-[92%]">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="space-y-2">
            <div className={clsx("h-8 w-40 rounded-[var(--radius-md)]", pulse)} />
            <div className={clsx("h-4 w-28 rounded-[var(--radius-sm)]", pulse)} />
          </div>
          <div className="flex gap-2">
            <div className={clsx("h-10 w-36 rounded-md", pulse)} />
            <div className={clsx("h-10 w-20 rounded-md", pulse)} />
          </div>
        </div>
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full shrink-0 space-y-3 lg:w-[220px]">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="rounded-md border border-[var(--border)] bg-white px-4 py-3"
              >
                <div className={clsx("h-4 w-20 rounded-[var(--radius-sm)]", pulse)} />
                <div className={clsx("mt-3 h-9 w-full rounded-md", pulse)} />
                <div className={clsx("mt-2 h-3 w-full rounded-[var(--radius-sm)]", pulse)} />
                <div className={clsx("mt-2 h-3 w-[80%] rounded-[var(--radius-sm)]", pulse)} />
              </div>
            ))}
          </aside>
          <div className="min-w-0 flex-1">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {CARD_KEYS.slice(0, 6).map((key) => (
                <div
                  key={key}
                  className="overflow-hidden rounded-md border border-[var(--border)] bg-white"
                >
                  <div className={clsx("h-40 w-full", pulse)} />
                  <div className="space-y-2 p-4">
                    <div className={clsx("h-4 w-[90%] rounded-[var(--radius-sm)]", pulse)} />
                    <div className={clsx("h-3 w-24 rounded-[var(--radius-sm)]", pulse)} />
                    <div className={clsx("h-4 w-16 rounded-[var(--radius-sm)]", pulse)} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Course detail: dark hero + overlapping main/aside — matches CourseCatalogDetail */
export function MarketingCourseDetailSkeleton({
  className,
}: {
  className?: string;
}) {
  return (
    <div className={clsx("min-h-screen bg-[var(--surface-muted)]", className)}>
      <span className="sr-only">Loading course</span>
      <div className="bg-[var(--header)] pb-28 pt-8">
        <div className="mx-auto max-w-[1184px] space-y-4 px-4 sm:px-6">
          <div className={clsx("h-3 w-48 rounded-[var(--radius-sm)] bg-white/20", pulse)} />
          <div className={clsx("h-10 w-full max-w-2xl rounded-[var(--radius-md)] bg-white/25", pulse)} />
          <div className={clsx("h-4 w-full max-w-xl rounded-[var(--radius-sm)] bg-white/15", pulse)} />
          <div className="flex flex-wrap gap-3 pt-2">
            <div className={clsx("h-5 w-24 rounded-full bg-white/20", pulse)} />
            <div className={clsx("h-5 w-20 rounded-full bg-white/20", pulse)} />
            <div className={clsx("h-5 w-28 rounded-full bg-white/20", pulse)} />
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-[1184px] px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          <div className="order-2 space-y-6 lg:col-span-8 lg:order-1 lg:-mt-24">
            <div className="rounded-lg border border-[var(--border)] bg-white p-6">
              <div className={clsx("h-6 w-40 rounded-[var(--radius-sm)]", pulse)} />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {LIST_KEYS.slice(0, 6).map((key) => (
                  <div key={key} className={clsx("h-4 w-full rounded-[var(--radius-sm)]", pulse)} />
                ))}
              </div>
            </div>
            {SECTION_KEYS.map((key) => (
              <div
                key={key}
                className="rounded-lg border border-[var(--border)] bg-white p-5"
              >
                <div className={clsx("h-5 w-48 rounded-[var(--radius-sm)]", pulse)} />
                <div className={clsx("mt-3 h-3 w-full rounded-[var(--radius-sm)]", pulse)} />
                <div className={clsx("mt-2 h-3 w-[85%] rounded-[var(--radius-sm)]", pulse)} />
              </div>
            ))}
          </div>
          <aside className="order-1 lg:col-span-4 lg:order-2 lg:-mt-[14rem]">
            <div className="sticky top-24 overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-lg">
              <div className={clsx("aspect-video w-full", pulse)} />
              <div className="space-y-3 p-5">
                <div className={clsx("h-8 w-28 rounded-[var(--radius-md)]", pulse)} />
                <div className={clsx("h-11 w-full rounded-[var(--radius-md)]", pulse)} />
                <div className={clsx("h-9 w-full rounded-[var(--radius-md)]", pulse)} />
                <div className="space-y-2 pt-2">
                  {NAV_KEYS.slice(0, 4).map((key) => (
                    <div
                      key={key}
                      className={clsx("h-3 w-full rounded-[var(--radius-sm)]", pulse)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export function StudentDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("space-y-6 md:space-y-8", className)}>
      <span className="sr-only">Loading dashboard</span>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <div className={clsx("h-8 w-64 max-w-full rounded-[var(--radius-md)]", pulse)} />
          <div className={clsx("h-4 w-48 rounded-[var(--radius-sm)]", pulse)} />
        </div>
        <div className="flex gap-2">
          <div className={clsx("h-10 w-28 rounded-md", pulse)} />
          <div className={clsx("h-10 w-36 rounded-md", pulse)} />
        </div>
      </div>
      <CardGridSkeleton cards={4} />
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="flex items-center gap-3">
          <div className={clsx("h-10 w-10 rounded-full", pulse)} />
          <div className="space-y-2">
            <div className={clsx("h-4 w-40 rounded-[var(--radius-sm)]", pulse)} />
            <div className={clsx("h-3 w-56 rounded-[var(--radius-sm)]", pulse)} />
          </div>
        </div>
      </div>
      <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className={clsx("h-6 w-32 rounded-[var(--radius-sm)]", pulse)} />
          <div className={clsx("h-10 w-48 rounded-md", pulse)} />
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {CARD_KEYS.slice(0, 6).map((key) => (
            <div key={key} className="overflow-hidden rounded-xl border border-[var(--border)]">
              <div className={clsx("h-40 w-full", pulse)} />
              <div className="space-y-2 p-4">
                <div className={clsx("h-4 w-[85%] rounded-[var(--radius-sm)]", pulse)} />
                <div className={clsx("h-2 w-full rounded-full", pulse)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AdminDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("space-y-6", className)}>
      <span className="sr-only">Loading dashboard</span>
      <PageHeaderSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {CARD_KEYS.slice(0, 5).map((key) => (
          <div
            key={key}
            className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-5"
          >
            <div className={clsx("h-3 w-20 rounded-[var(--radius-sm)]", pulse)} />
            <div className={clsx("mt-3 h-8 w-16 rounded-[var(--radius-md)]", pulse)} />
          </div>
        ))}
      </div>
      <CardGridSkeleton cards={3} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className={clsx("h-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:col-span-7", pulse)} />
        <div className={clsx("h-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] lg:col-span-5", pulse)} />
      </div>
      <TableRowsSkeleton rows={5} cols={5} />
    </div>
  );
}

export function MentorDashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("space-y-6", className)}>
      <span className="sr-only">Loading dashboard</span>
      <PageHeaderSkeleton />
      <div className={clsx("h-16 w-full rounded-xl", pulse)} />
      <CardGridSkeleton cards={3} />
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-7">
          <div className={clsx("h-5 w-40 rounded-[var(--radius-sm)]", pulse)} />
          {LIST_KEYS.slice(0, 4).map((key) => (
            <div key={key} className={clsx("h-12 w-full rounded-md", pulse)} />
          ))}
        </div>
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 lg:col-span-5">
          <div className={clsx("h-5 w-32 rounded-[var(--radius-sm)]", pulse)} />
          {LIST_KEYS.slice(0, 5).map((key) => (
            <div key={key} className={clsx("h-10 w-full rounded-md", pulse)} />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className={clsx("h-24 rounded-xl border border-[var(--border)]", pulse)} />
        <div className={clsx("h-24 rounded-xl border border-[var(--border)]", pulse)} />
      </div>
    </div>
  );
}

export function TutorCoursesSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx("w-full px-6 py-10 sm:px-8 lg:px-10", className)}>
      <span className="sr-only">Loading courses</span>
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div className={clsx("h-10 w-40 rounded-[var(--radius-md)]", pulse)} />
        <div className={clsx("h-11 w-36 rounded-md", pulse)} />
      </div>
      <div className="mb-10 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
        <div className={clsx("h-4 w-12 rounded-[var(--radius-sm)]", pulse)} />
        <div className={clsx("mt-3 h-6 w-full max-w-lg rounded-[var(--radius-md)]", pulse)} />
        <div className={clsx("mt-2 h-4 w-full max-w-2xl rounded-[var(--radius-sm)]", pulse)} />
      </div>
      <ListBlockSkeleton items={4} />
    </div>
  );
}

/** @deprecated Prefer StudentDashboardSkeleton / AdminDashboardSkeleton / MentorDashboardSkeleton */
export function DashboardHomeSkeleton({ className }: { className?: string }) {
  return <StudentDashboardSkeleton className={className} />;
}
