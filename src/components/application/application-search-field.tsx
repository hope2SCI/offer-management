"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type ApplicationSearchFieldProps = {
  defaultValue?: string;
};

export function ApplicationSearchField({
  defaultValue = ""
}: ApplicationSearchFieldProps) {
  const [value, setValue] = useState(defaultValue);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function clearSearch() {
    setValue("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("q");
    params.delete("applicationId");
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  }

  return (
    <div className="relative flex-1">
      <input
        name="q"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="搜索公司、岗位、城市或渠道"
        className="h-10 w-full rounded-md border border-slate-300 px-3 pr-9 focus-ring"
      />
      {value ? (
        <button
          type="button"
          onClick={clearSearch}
          aria-label="清空搜索"
          className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-base leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>
      ) : null}
    </div>
  );
}
