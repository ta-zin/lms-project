export default function Home() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-6 py-20 lg:px-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              Learning Management System
            </span>

            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Learn new skills.
              <br />
              Track your progress.
              <br />
              <span className="text-blue-600">
                Achieve your goals.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Explore courses, complete lessons, track your learning
              progress, and test your knowledge with interactive quizzes.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="/courses"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                Explore Courses
              </a>

              <a
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Login
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            title="Structured Learning"
            description="Follow courses and lessons in an organized learning path."
          />

          <FeatureCard
            title="Track Progress"
            description="Your completed lessons and course progress are persisted by the backend."
          />

          <FeatureCard
            title="Test Your Knowledge"
            description="Take quizzes and receive automatically calculated results."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>
    </div>
  );
}