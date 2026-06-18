import { redirectForAuthPages, loginAction } from "@/features/auth/actions";

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  await redirectForAuthPages("login");
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-teal-700">Offer Management</p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950">
          登录工作台
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          继续管理你的岗位、简历和日程。
        </p>
        {error ? (
          <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {decodeURIComponent(error)}
          </div>
        ) : null}
        <form action={loginAction} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-700">用户名</span>
            <input
              name="username"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              required
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-slate-700">密码</span>
            <input
              name="password"
              type="password"
              className="mt-1 h-10 w-full rounded-md border border-slate-300 px-3 focus-ring"
              required
              minLength={6}
            />
          </label>
          <button className="h-10 w-full rounded-md bg-teal-700 px-4 text-sm font-semibold text-white hover:bg-teal-800">
            登录
          </button>
        </form>
      </section>
    </main>
  );
}
