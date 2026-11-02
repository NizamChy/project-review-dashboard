import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";
export default function HomePage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
            <ClipboardCheck size={20} />
          </span>{" "}
          ProjectReview
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Get started <ArrowRight className="ml-1 inline" size={15} />
          </Link>
        </div>
      </nav>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-20 pt-14 lg:grid-cols-2 lg:pt-24">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            <span className="h-2 w-2 rounded-full bg-indigo-500" /> A better way
            to review student work
          </div>
          <h1 className="max-w-2xl text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">
            Great projects deserve a{" "}
            <span className="text-indigo-600">clear path</span> to feedback.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            One simple workspace for students to submit their work and mentors
            to review it, share feedback, and keep everything moving.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              Create student account{" "}
              <ArrowRight className="ml-2 inline" size={16} />
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Open dashboard
            </Link>
          </div>
          <div className="mt-9 flex flex-wrap gap-5 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" /> Simple
              submissions
            </span>
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-emerald-600" /> Role-based
              access
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute -inset-5 rounded-[2rem] bg-gradient-to-br from-indigo-100 via-violet-50 to-sky-100 blur-2xl" />
          <div className="relative rounded-3xl border border-slate-200 bg-white p-5 shadow-2xl shadow-slate-200/70 sm:p-7">
            <div className="flex items-center justify-between border-b border-slate-100 pb-5">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  MENTOR WORKSPACE
                </p>
                <h2 className="mt-1 text-xl font-bold">Review overview</h2>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <GraduationCap size={21} />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Pending", n: "12", color: "amber" },
                { label: "Approved", n: "38", color: "emerald" },
                { label: "Rejected", n: "04", color: "rose" },
              ].map((x) => (
                <div
                  key={x.label}
                  className="rounded-2xl bg-slate-50 p-3 sm:p-4"
                >
                  <p className="text-xs text-slate-500">{x.label}</p>
                  <p className="mt-2 text-2xl font-bold">{x.n}</p>
                  <div
                    className={`mt-3 h-1.5 rounded-full ${x.color === "amber" ? "bg-amber-400" : x.color === "emerald" ? "bg-emerald-400" : "bg-rose-400"}`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              {[
                {
                  title: "Campus marketplace",
                  name: "Ayesha Rahman",
                  status: "Pending",
                  dot: "bg-amber-400",
                },
                {
                  title: "Study planner app",
                  name: "Tanvir Hasan",
                  status: "Approved",
                  dot: "bg-emerald-500",
                },
                {
                  title: "Weather dashboard",
                  name: "Samira Khan",
                  status: "Pending",
                  dot: "bg-amber-400",
                },
              ].map((x) => (
                <div
                  key={x.title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 p-3.5"
                >
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ClipboardCheck size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{x.title}</p>
                    <p className="mt-1 text-xs text-slate-500">by {x.name}</p>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span className={`h-2 w-2 rounded-full ${x.dot}`} />
                    {x.status}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-5 text-center text-xs text-slate-400">
              Illustrative dashboard preview
            </p>
          </div>
        </div>
      </section>
      <section className="border-t border-slate-100 bg-slate-50/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-14 sm:grid-cols-3">
          {[
            {
              icon: <ClipboardCheck size={21} />,
              title: "Submit with confidence",
              desc: "Keep your repository, live demo, and project context in one place.",
            },
            {
              icon: <ShieldCheck size={21} />,
              title: "Reviews that stay organized",
              desc: "Clear approval states and actionable feedback from mentors.",
            },
            {
              icon: <GraduationCap size={21} />,
              title: "Built for both sides",
              desc: "A focused experience for students and a practical dashboard for reviewers.",
            },
          ].map((x) => (
            <div
              key={x.title}
              className="rounded-2xl border border-slate-200 bg-white p-6"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                {x.icon}
              </div>
              <h3 className="mt-4 font-bold">{x.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{x.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <footer className="border-t border-slate-100 px-6 py-6 text-center text-xs text-slate-400">
        ProjectReview · A simple workflow for better project feedback
      </footer>
    </main>
  );
}
