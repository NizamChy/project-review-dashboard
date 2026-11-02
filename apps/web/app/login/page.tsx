"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCheck,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";
import { Alert, Button, Field, Input } from "@/components/ui";
import { api, saveSession } from "@/lib/api";
type AuthResponse = {
  token: string;
  user: { id: string; name: string; email: string; role: "STUDENT" | "MENTOR" };
};

const DEMO_ADMIN = {
  email: "admin@example.com",
  password: "ChangeMe123!",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [info, setInfo] = useState("");

  function handleAdminLogin() {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError("");
    setInfo(
      "Demo admin credentials have been filled in. Click Sign in to access the Admin Dashboard.",
    );
  }

  function handleStudentLogin() {
    setInfo(
      "To continue as a student, please create your account using the Create a student account link below.",
    );
    setError("");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await api<AuthResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      saveSession(data);
      router.push(data.user.role === "MENTOR" ? "/dashboard" : "/submit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-indigo-700 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <ClipboardCheck /> ProjectReview
        </Link>
        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-200">
            Welcome back
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight">
            Your next great review starts here.
          </h1>
          <p className="mt-5 text-lg leading-8 text-indigo-100">
            Keep project submissions organized, get clear feedback, and move
            work forward.
          </p>
        </div>
        <p className="text-sm text-indigo-200">
          A focused workspace for students and mentors.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-10 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mb-8">
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <LockKeyhole />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Enter your details to continue to your workspace.
            </p>
          </div>
          {/*  */}
          {/* Demo Login Options */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleAdminLogin}
              className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              Login as Admin
            </button>

            <button
              type="button"
              onClick={handleStudentLogin}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Login as Student
            </button>
          </div>

          {/* Information Message */}
          {info && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-700"
            >
              {info}
            </div>
          )}
          {/*  */}
          {error && (
            <div className="mb-5">
              <Alert>{error}</Alert>
            </div>
          )}
          <form onSubmit={submit} className="space-y-5">
            <Field label="Email address">
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" disabled={busy} className="w-full py-3">
              {busy && <LoaderCircle className="animate-spin" size={17} />} Sign
              in
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-slate-500">
            New here?{" "}
            <Link
              className="font-semibold text-indigo-600 hover:text-indigo-700"
              href="/signup"
            >
              Create a student account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
