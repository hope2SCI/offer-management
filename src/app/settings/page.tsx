import { AppShell } from "@/components/layout/app-shell";
import { AiSettingsForm } from "@/components/settings/ai-settings-form";
import { requireUser } from "@/features/auth/session";
import { getSettingsPageData } from "@/features/settings/queries";

export default async function SettingsPage() {
  const user = await requireUser();
  const settings = await getSettingsPageData(user.id);

  return (
    <AppShell
      username={user.username}
      title="设置"
      description="配置面试复盘 AI 解答所需的服务。"
    >
      <section className="max-w-2xl rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">Deepseek</h2>
        <p className="mt-1 text-sm text-slate-500">
          API Key 只属于当前账号，保存后不会完整回显。
        </p>

        <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
          当前状态：{settings.hasDeepseekApiKey ? "已配置" : "未配置"}
        </div>

        <AiSettingsForm hasDeepseekApiKey={settings.hasDeepseekApiKey} />
      </section>
    </AppShell>
  );
}
