"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FilePlus2,
  LoaderCircle,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { Alert, Button, Field, Input, Textarea } from "@/components/ui";
import { api, readUser, signOut } from "@/lib/api";
type Project = {
  id: string;
  name: string;
  repoUrl: string;
  liveUrl: string | null;
  description: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewNote: string | null;
  createdAt: string;
};
const statusStyle = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};
export default function SubmitPage() {
  const router = useRouter();
  const [user, setUser] = useState<ReturnType<typeof readUser>>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  async function load() {
    try {
      const data = await api<{ projects: Project[] }>("/projects/mine");
      setProjects(data.projects);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    const u = readUser();
    if (!localStorage.getItem("pr_token")) {
      router.replace("/login");
      return;
    }
    if (u?.role === "MENTOR") {
      router.replace("/dashboard");
      return;
    }
    setUser(u);
    void load();
  }, [router]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setBusy(true);
    try {
      await api("/projects", {
        method: "POST",
        body: JSON.stringify({ name, repoUrl, liveUrl, description }),
      });
      setName("");
      setRepoUrl("");
      setLiveUrl("");
      setDescription("");
      setSuccess(
        "Project submitted successfully. You can track its review status below.",
      );
      await load();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Unable to submit your project.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <ClipboardCheck size={19} />
            </span>
            ProjectReview
          </Link>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user?.name ?? "Student"}</p>
              <p className="text-xs text-slate-500">Student workspace</p>
            </div>
            <Button variant="secondary" onClick={signOut}>
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="mb-8">
          <p className="text-sm font-semibold text-indigo-600">
            STUDENT PORTAL
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Your projects
          </h1>
          <p className="mt-2 text-slate-500">
            Submit your work and follow the review process.
          </p>
        </div>
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <FilePlus2 />
              </div>
              <div>
                <h2 className="text-lg font-bold">Submit a project</h2>
                <p className="text-sm text-slate-500">
                  Share your repository and project details.
                </p>
              </div>
            </div>
            {error && (
              <div className="mb-4">
                <Alert>{error}</Alert>
              </div>
            )}
            {success && (
              <div className="mb-4">
                <Alert tone="success">{success}</Alert>
              </div>
            )}
            <form onSubmit={submit} className="space-y-5">
              <Field label="Project name">
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  minLength={3}
                  maxLength={120}
                  placeholder="e.g. Personal finance tracker"
                  required
                />
              </Field>
              <Field
                label="Repository URL"
                hint="GitHub, GitLab, or Bitbucket repository."
              >
                <Input
                  type="url"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/you/project"
                  required
                />
              </Field>
              <Field label="Live link (optional)">
                <Input
                  type="url"
                  value={liveUrl}
                  onChange={(e) => setLiveUrl(e.target.value)}
                  placeholder="https://your-project.vercel.app"
                />
              </Field>
              <Field
                label="Project description"
                hint={`${description.length}/3000 characters · Minimum 30 characters`}
              >
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  minLength={30}
                  maxLength={3000}
                  rows={5}
                  placeholder="What does your project do? Mention key features, your role, and the technologies used."
                  required
                />
              </Field>
              <Button type="submit" disabled={busy} className="w-full py-3">
                {busy ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <ArrowRight size={17} />
                )}{" "}
                Submit for review
              </Button>
              <p className="text-center text-xs text-slate-400">
                Limit: 10 submission requests per hour.
              </p>
            </form>
          </section>
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Submission history</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {projects.length} project{projects.length === 1 ? "" : "s"}{" "}
                  submitted
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setLoading(true);
                  void load();
                }}
              >
                <RefreshCw size={15} /> Refresh
              </Button>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <LoaderCircle className="animate-spin text-indigo-600" />
              </div>
            ) : projects.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center">
                <ClipboardCheck className="mx-auto text-slate-300" size={32} />
                <p className="mt-3 font-semibold">No projects yet</p>
                <p className="mt-1 text-sm text-slate-500">
                  Your submitted projects will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((p) => (
                  <article
                    key={p.id}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <h3 className="font-semibold text-slate-900">{p.name}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyle[p.status]}`}
                      >
                        {p.status[0] + p.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                      {p.description}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
                      <a
                        className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                        href={p.repoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Repository <ExternalLink size={12} />
                      </a>
                      {p.liveUrl && (
                        <a
                          className="inline-flex items-center gap-1 text-indigo-600 hover:underline"
                          href={p.liveUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Live demo <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                    {p.reviewNote && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Mentor feedback
                        </p>
                        <p className="mt-1 text-sm text-slate-700">
                          {p.reviewNote}
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-xs text-slate-400">
                      Submitted {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                    {p.status === "APPROVED" && (
                      <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                        <CheckCircle2 size={14} /> Project approved
                      </p>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
