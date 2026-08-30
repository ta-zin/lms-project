import { Suspense } from "react";

import AdminUsersClient from "./AdminUsersClient";


export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          Loading users...
        </div>
      }
    >
      <AdminUsersClient />
    </Suspense>
  );
}