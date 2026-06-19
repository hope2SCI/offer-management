import { logoutAction } from "@/features/auth/actions";
import { getAvatarInitial } from "./account-menu-utils";

type AccountMenuProps = {
  username: string;
};

export function AccountMenu({ username }: AccountMenuProps) {
  const initial = getAvatarInitial(username);

  return (
    <details className="group relative">
      <summary
        aria-label="账户菜单"
        className="focus-ring flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-full bg-teal-700 text-sm font-semibold text-white transition-colors hover:bg-teal-800 group-open:bg-teal-800 [&::-webkit-details-marker]:hidden"
      >
        <span aria-hidden="true">{initial}</span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
        <div className="px-4 py-3">
          <p className="text-xs font-medium text-slate-500">当前账户</p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-950">
            {username}
          </p>
        </div>
        <form action={logoutAction} className="border-t border-slate-200 p-1">
          <button
            type="submit"
            className="focus-ring flex h-10 w-full cursor-pointer items-center rounded-md px-3 text-left text-sm font-medium text-red-700 transition-colors hover:bg-red-50"
          >
            退出登录
          </button>
        </form>
      </div>
    </details>
  );
}
