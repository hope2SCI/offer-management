"use client";

import { useActionState } from "react";
import {
  saveAiSettingsAction,
  type AiSettingsFormState
} from "@/features/settings/actions";

export function AiSettingsForm({
  hasDeepseekApiKey
}: {
  hasDeepseekApiKey: boolean;
}) {
  const [state, formAction] = useActionState<AiSettingsFormState, FormData>(
    saveAiSettingsAction,
    { ok: false }
  );

  return (
    <form action={formAction} className="mt-4 space-y-3">
      <label className="block">
        <span className="text-sm font-medium text-slate-700">
          Deepseek API Key
        </span>
        <input
          name="deepseekApiKey"
          type="password"
          autoComplete="off"
          required
          placeholder={
            hasDeepseekApiKey
              ? "输入新 Key 后保存即可替换"
              : "请输入 Deepseek API Key"
          }
          className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
        />
      </label>

      {state.message ? (
        <div
          className={
            state.ok
              ? "rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700"
              : "rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          }
        >
          {state.message}
        </div>
      ) : null}

      <button className="h-10 rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
        保存
      </button>
    </form>
  );
}
