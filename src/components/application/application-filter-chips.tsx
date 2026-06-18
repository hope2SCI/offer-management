import Link from "next/link";
import { clsx } from "clsx";
import {
  APPLICATION_STATUSES,
  STATUS_LABELS,
  type ApplicationStatus
} from "@/features/applications/constants";

type ApplicationFilterChipsProps = {
  q?: string;
  priority?: string;
  status?: string;
  source?: string;
  city?: string;
  sources: string[];
  cities: string[];
};

type ChipGroupProps = {
  label: string;
  param: "status" | "source" | "city";
  allLabel: string;
  activeValue?: string;
  options: Array<{ value: string; label: string }>;
  baseParams: URLSearchParams;
};

function chipHref(
  baseParams: URLSearchParams,
  param: "status" | "source" | "city",
  value?: string
) {
  const params = new URLSearchParams(baseParams.toString());
  params.delete("applicationId");
  if (value) {
    params.set(param, value);
  } else {
    params.delete(param);
  }
  const query = params.toString();
  return query ? `/applications?${query}` : "/applications";
}

function ChipGroup({
  label,
  param,
  allLabel,
  activeValue,
  options,
  baseParams
}: ChipGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-xs font-medium text-slate-500">{label}</span>
      <Link
        href={chipHref(baseParams, param)}
        className={clsx(
          "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
          !activeValue
            ? "border-teal-200 bg-teal-50 text-teal-700"
            : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
        )}
      >
        {allLabel}
      </Link>
      {options.map((option) => (
        <Link
          key={option.value}
          href={chipHref(baseParams, param, option.value)}
          className={clsx(
            "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
            activeValue === option.value
              ? "border-teal-200 bg-teal-50 text-teal-700"
              : "border-slate-200 bg-white text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
          )}
        >
          {option.label}
        </Link>
      ))}
    </div>
  );
}

export function ApplicationFilterChips({
  q,
  priority,
  status,
  source,
  city,
  sources,
  cities
}: ApplicationFilterChipsProps) {
  const baseParams = new URLSearchParams();
  if (q) baseParams.set("q", q);
  if (priority) baseParams.set("priority", priority);
  if (status) baseParams.set("status", status);
  if (source) baseParams.set("source", source);
  if (city) baseParams.set("city", city);

  return (
    <section className="mb-5 space-y-3 rounded-lg border border-slate-200 bg-white p-4">
      <ChipGroup
        label="状态"
        param="status"
        allLabel="全部状态"
        activeValue={status}
        baseParams={baseParams}
        options={APPLICATION_STATUSES.map((item) => ({
          value: item,
          label: STATUS_LABELS[item as ApplicationStatus]
        }))}
      />
      <ChipGroup
        label="渠道"
        param="source"
        allLabel="全部渠道"
        activeValue={source}
        baseParams={baseParams}
        options={sources.map((item) => ({ value: item, label: item }))}
      />
      <ChipGroup
        label="城市"
        param="city"
        allLabel="全部城市"
        activeValue={city}
        baseParams={baseParams}
        options={cities.map((item) => ({ value: item, label: item }))}
      />
    </section>
  );
}
