import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold text-red-600">
          403
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Access denied
        </h1>

        <p className="mt-4 leading-7 text-slate-600">
          You do not have permission to access
          this page.
        </p>

        <Link
          href="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
        >
          Back to home
        </Link>
      </div>
    </main>
  );
}