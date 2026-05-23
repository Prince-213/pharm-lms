"use client";

import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type CatalogFiltersProps = {
  categories: string[];
  levels: string[];
  activeCategory: string;
  activeLevel: string;
  activeSort: string;
};

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-sm font-bold text-[var(--ink-deep)]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterOption({
  name,
  label,
  checked,
  onChange,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex min-h-[44px] cursor-pointer items-center gap-2.5 text-sm text-slate-600">
      <input
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 border-slate-300 text-[var(--emerald)] focus:ring-[var(--emerald)]"
      />
      {label}
    </label>
  );
}

function SortPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition",
        active
          ? "border-[var(--emerald)] bg-[var(--emerald)] text-white"
          : "border-slate-200 bg-white text-slate-600 active:bg-slate-50",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function useCatalogNavigate() {
  const router = useRouter();
  const searchParams = useSearchParams();

  return function navigate(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value == null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.push(qs ? `/courses?${qs}` : "/courses");
  };
}

function FilterPanel({
  categories,
  levels,
  activeCategory,
  activeLevel,
  activeSort,
}: CatalogFiltersProps) {
  const navigate = useCatalogNavigate();

  return (
    <>
      <FilterGroup title="Category">
        <FilterOption
          name="category"
          label="All"
          checked={!activeCategory}
          onChange={() => navigate({ category: null })}
        />
        {categories.map((c) => (
          <FilterOption
            key={c}
            name="category"
            label={c}
            checked={activeCategory.toLowerCase() === c.toLowerCase()}
            onChange={() => navigate({ category: c })}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Sort">
        <FilterOption
          name="sort"
          label="New"
          checked={activeSort === "new" || !activeSort}
          onChange={() => navigate({ sort: "new" })}
        />
        <FilterOption
          name="sort"
          label="Popular"
          checked={activeSort === "popular"}
          onChange={() => navigate({ sort: "popular" })}
        />
        <FilterOption
          name="sort"
          label="Free"
          checked={activeSort === "free"}
          onChange={() => navigate({ sort: "free" })}
        />
      </FilterGroup>

      {levels.length > 0 ? (
        <FilterGroup title="Level">
          <FilterOption
            name="level"
            label="All levels"
            checked={!activeLevel}
            onChange={() => navigate({ level: null })}
          />
          {levels.map((l) => (
            <FilterOption
              key={l}
              name="level"
              label={l}
              checked={activeLevel.toLowerCase() === l.toLowerCase()}
              onChange={() => navigate({ level: l })}
            />
          ))}
        </FilterGroup>
      ) : null}
    </>
  );
}

/** Desktop sidebar filters */
export function CatalogFilters(props: CatalogFiltersProps) {
  return (
    <aside className="hidden space-y-8 rounded-xl border border-slate-100 bg-slate-50/80 p-5 lg:block">
      <FilterPanel {...props} />
    </aside>
  );
}

/** Mobile: sort pills + collapsible filter panel */
export function CatalogFiltersMobile(props: CatalogFiltersProps) {
  const { activeSort, activeCategory, activeLevel } = props;
  const navigate = useCatalogNavigate();
  const [open, setOpen] = useState(false);

  const sort = activeSort === "popular" || activeSort === "free" ? activeSort : "new";
  const hasExtraFilters = Boolean(activeCategory || activeLevel);

  return (
    <div className="space-y-4 lg:hidden">
      <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <SortPill
          label="New"
          active={sort === "new"}
          onClick={() => navigate({ sort: "new" })}
        />
        <SortPill
          label="Popular"
          active={sort === "popular"}
          onClick={() => navigate({ sort: "popular" })}
        />
        <SortPill
          label="Free"
          active={sort === "free"}
          onClick={() => navigate({ sort: "free" })}
        />
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full min-h-[48px] items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-[var(--ink-deep)] shadow-sm"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-[var(--emerald)]" />
          Filters
          {hasExtraFilters ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-[var(--emerald)]">
              Active
            </span>
          ) : null}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <div className="max-h-[min(70vh,28rem)] space-y-8 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/80 p-4 shadow-sm">
          <FilterPanel {...props} />
        </div>
      ) : null}
    </div>
  );
}
