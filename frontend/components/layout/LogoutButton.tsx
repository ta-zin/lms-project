"use client";

import { useRouter } from "next/navigation";

import { logout } from "@/lib/auth";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      Logout
    </button>
  );
}