import { JobFunnelChart } from "@/components/insights/job-funnel-chart";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/features/auth/session";
import { getInsightMetrics } from "@/features/insights/metrics";

function Rate({ value }: { value: number }) {
  return <span>{value}%</span>;
}

export default async function InsightsPage() {
  const user = await requireUser();
  const metrics = await getInsightMetrics(user.id);

  const cards = [
    { label: "总投递数", value: metrics.cards.totalApplied },
    { label: "进入面试数", value: metrics.cards.interviewCount },
    { label: "Offer 数", value: metrics.cards.offerCount },
    {
      label: "面试率",
      value: `${metrics.cards.interviewRate}%`,
      note: "进入面试数 / 总投递数"
    },
    {
      label: "Offer 率",
      value: `${metrics.cards.offerRate}%`,
      note: "Offer 数 / 总投递数"
    },
    { label: "面试转 Offer 率", 
      value: `${metrics.cards.interviewToOfferRate}%`,
      note: "Offer 数 / 进入面试数 "
    }
  ];

  return (
    <AppShell
      username={user.username}
      title="数据洞察"
      description="查看投递转化效果、渠道效果和城市投递分布。"
    >
      <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-3 text-2xl font-semibold text-slate-950">
              {card.value}
            </p>
            {"note" in card ? (
              <p className="mt-2 text-xs text-slate-500">{card.note}</p>
            ) : null}
          </div>
        ))}
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">求职漏斗</h2>
          <JobFunnelChart data={metrics.jobFunnel} />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-slate-950">渠道效果</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 font-medium">渠道</th>
                  <th className="py-2 font-medium">投递数</th>
                  <th className="py-2 font-medium">面试数</th>
                  <th className="py-2 font-medium">Offer 数</th>
                  <th className="py-2 font-medium">面试率</th>
                  <th className="py-2 font-medium">Offer 率</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.channels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-slate-500">
                      暂无渠道数据
                    </td>
                  </tr>
                ) : (
                  metrics.channels.map((channel) => (
                    <tr key={channel.name}>
                      <td className="py-3 font-medium text-slate-950">{channel.name}</td>
                      <td className="py-3 text-slate-700">{channel.appliedCount}</td>
                      <td className="py-3 text-slate-700">{channel.interviewCount}</td>
                      <td className="py-3 text-slate-700">{channel.offerCount}</td>
                      <td className="py-3 text-slate-700">
                        <Rate value={channel.interviewRate} />
                      </td>
                      <td className="py-3 text-slate-700">
                        <Rate value={channel.offerRate} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-slate-950">城市投递分布</h2>
        <div className="mt-4 space-y-4">
          {metrics.cities.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">暂无城市数据</p>
          ) : (
            metrics.cities.map((city) => (
              <div key={city.name}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-slate-950">{city.name}</span>
                  <span className="text-slate-500">{city.count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-teal-700"
                    style={{ width: `${city.percent}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </AppShell>
  );
}
