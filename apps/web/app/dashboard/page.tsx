"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  LoaderCircle,
  LogOut,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { Alert, Button, Textarea } from "@/components/ui";
import { api, readUser, signOut } from "@/lib/api";
type Status = "PENDING" | "APPROVED" | "REJECTED";
type Project = {
  id: string;
  name: string;
  repoUrl: string;
  liveUrl: string | null;
  description: string;
  status: Status;
  reviewNote: string | null;
  createdAt: string;
  student: { id: string; name: string; email: string };
};
type Stats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};
const style: Record<Status, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-rose-50 text-rose-700 ring-rose-200",
};
export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [status, setStatus] = useState<"ALL" | Status>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reviewing, setReviewing] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [projectData, statData] = await Promise.all([
        api<{
          projects: Project[];
          pagination: { page: number; totalPages: number; total: number };
        }>(
          "/projects?" +
            new URLSearchParams({ page: String(page), limit: "8", status }),
          {},
        ),
        api<{ stats: Stats }>("/projects/stats"),
      ]);
      setProjects(projectData.projects);
      setTotalPages(projectData.pagination.totalPages);
      setTotal(projectData.pagination.total);
      setStats(statData.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load dashboard.");
    } finally {
      setLoading(false);
    }
  }, [page, status]);
  useEffect(() => {
    if (!localStorage.getItem("pr_token")) {
      router.replace("/login");
      return;
    }
    const u = readUser();
    if (u?.role === "STUDENT") {
      router.replace("/submit");
      return;
    }
    void load();
  }, [router, load]);
  async function review(id: string, nextStatus: "APPROVED" | "REJECTED") {
    setBusyId(id);
    setError("");
    setMessage("");
    try {
      await api(`/projects/${id}/review`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus, reviewNote: note }),
      });
      setReviewing(null);
      setNote("");
      setMessage(`Project ${nextStatus.toLowerCase()} successfully.`);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Review action failed.");
    } finally {
      setBusyId("");
    }
  }
  const cards = [
    {
      label: "Total submissions",
      value: stats.total,
      detail: "All submitted projects",
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Awaiting review",
      value: stats.pending,
      detail: "Need your attention",
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved",
      value: stats.approved,
      detail: "Successfully reviewed",
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Rejected",
      value: stats.rejected,
      detail: "Feedback provided",
      color: "bg-rose-50 text-rose-600",
    },
  ];
  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white">
              <ClipboardCheck size={19} />
            </span>
            ProjectReview{" "}
            <span className="hidden rounded-md bg-indigo-50 px-2 py-1 text-xs font-semibold text-indigo-600 sm:inline">
              MENTOR
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-500 sm:inline">
              Mentor workspace
            </span>
            <Button variant="secondary" onClick={signOut}>
              <LogOut size={16} /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-indigo-600">OVERVIEW</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Review dashboard
            </h1>
            <p className="mt-2 text-slate-500">
              Track submissions and help students move forward.
            </p>
          </div>
          <Button variant="secondary" onClick={() => void load()}>
            <RefreshCw size={15} /> Refresh data
          </Button>
        </div>
        {error && (
          <div className="mt-6">
            <Alert>{error}</Alert>
          </div>
        )}
        {message && (
          <div className="mt-6">
            <Alert tone="success">{message}</Alert>
          </div>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((c) => (
            <div
              key={c.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <p className="text-sm font-medium text-slate-500">{c.label}</p>
                <span
                  className={`grid h-9 w-9 place-items-center rounded-xl ${c.color}`}
                >
                  <ClipboardCheck size={18} />
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight">
                {c.value}
              </p>
              <p className="mt-1 text-xs text-slate-400">{c.detail}</p>
            </div>
          ))}
        </div>
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:px-6">
            <div>
              <h2 className="text-lg font-bold">Project submissions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review student work and leave feedback.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Search size={16} className="text-slate-400" />
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as "ALL" | Status);
                  setPage(1);
                }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
              >
                <option value="ALL">All statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>
          {loading ? (
            <div className="flex justify-center py-20">
              <LoaderCircle className="animate-spin text-indigo-600" />
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center">
              <ClipboardCheck className="mx-auto text-slate-300" size={34} />
              <p className="mt-3 font-semibold">No projects found</p>
              <p className="mt-1 text-sm text-slate-500">
                Try a different status filter or check back later.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] border-collapse text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {[
                        "Project",
                        "Student",
                        "Submitted",
                        "Status",
                        "Actions",
                      ].map((x) => (
                        <th
                          key={x}
                          className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((p) => (
                      <tr key={p.id} className="align-top hover:bg-slate-50/60">
                        <td className="max-w-[300px] px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {p.name}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                            {p.description}
                          </p>
                          <div className="mt-2 flex gap-3 text-xs">
                            <a
                              href={p.repoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                            >
                              Repository <ExternalLink size={11} />
                            </a>
                            {p.liveUrl && (
                              <a
                                href={p.liveUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                              >
                                Live <ExternalLink size={11} />
                              </a>
                            )}
                          </div>
                          {p.reviewNote && (
                            <p className="mt-2 max-w-xs text-xs text-slate-500">
                              Feedback: {p.reviewNote}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium">
                            {p.student.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {p.student.email}
                          </p>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">
                          {new Date(p.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${style[p.status]}`}
                          >
                            {p.status[0] + p.status.slice(1).toLowerCase()}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {p.status === "PENDING" ? (
                            <div className="flex flex-col items-start gap-2">
                              <div className="flex gap-2">
                                <Button
                                  className="px-3 py-2 text-xs"
                                  disabled={busyId === p.id}
                                  onClick={() => void review(p.id, "APPROVED")}
                                >
                                  <Check size={14} /> Approve
                                </Button>
                                <Button
                                  variant="danger"
                                  className="px-3 py-2 text-xs"
                                  disabled={busyId === p.id}
                                  onClick={() => {
                                    setReviewing(
                                      reviewing === p.id ? null : p.id,
                                    );
                                    setNote("");
                                  }}
                                >
                                  <X size={14} /> Reject
                                </Button>
                              </div>
                              {reviewing === p.id && (
                                <div className="w-64 space-y-2">
                                  <Textarea
                                    rows={2}
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    maxLength={1000}
                                    placeholder="Optional feedback for the student"
                                  />
                                  <div className="flex gap-2">
                                    <Button
                                      variant="danger"
                                      className="px-3 py-2 text-xs"
                                      disabled={busyId === p.id}
                                      onClick={() =>
                                        void review(p.id, "REJECTED")
                                      }
                                    >
                                      {busyId === p.id ? (
                                        <LoaderCircle
                                          className="animate-spin"
                                          size={13}
                                        />
                                      ) : null}{" "}
                                      Confirm rejection
                                    </Button>
                                    <Button
                                      variant="secondary"
                                      className="px-3 py-2 text-xs"
                                      onClick={() => setReviewing(null)}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              Reviewed
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:px-6">
                <p className="text-sm text-slate-500">
                  Showing {projects.length ? (page - 1) * 8 + 1 : 0}–
                  {Math.min(page * 8, total)} of {total} projects
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft size={16} /> Previous
                  </Button>
                  <span className="px-2 text-sm text-slate-500">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    variant="secondary"
                    className="px-3 py-2"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            </>
          )}
        </section>
        <p className="mt-5 text-center text-xs text-slate-400">
          Dashboard data, filters, pagination, and statistics are served by the
          API.
        </p>
      </div>
    </main>
  );
}
