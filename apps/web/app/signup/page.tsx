"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ClipboardCheck,
  LoaderCircle,
  UserRoundPlus,
} from "lucide-react";
import { Alert, Button, Field, Input } from "@/components/ui";
import { api, saveSession } from "@/lib/api";
type AuthResponse = {
  token: string;
  user: { id: string; name: string; email: string; role: "STUDENT" | "MENTOR" };
};
export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (
      password.length < 10 ||
      !/[A-Za-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError("Use at least 10 characters, including a letter and a number.");
      return;
    }
    setBusy(true);
    try {
      const data = await api<AuthResponse>("/auth/signup", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      saveSession(data);
      router.push("/submit");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to create your account.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-2">
      <section className="hidden flex-col justify-between bg-slate-950 p-12 text-white lg:flex">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <ClipboardCheck /> ProjectReview
        </Link>
        <div className="max-w-lg">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-300">
            Start building
          </p>
          <h1 className="mt-4 text-5xl font-bold leading-tight">
            Your work. Your progress. One place.
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Submit a project, share the context behind it, and keep track of the
            mentor review.
          </p>
          <div className="mt-8 space-y-4 text-sm text-slate-300">
            <p>✓ One place for project links and details</p>
            <p>✓ Clear approval status and feedback</p>
            <p>✓ A simple, secure student workspace</p>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Student accounts only. Mentor accounts are provisioned by an
          administrator.
        </p>
      </section>
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
          <div className="mb-7">
            <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
              <UserRoundPlus />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Get started with your student workspace.
            </p>
          </div>
          {error && (
            <div className="mb-5">
              <Alert>{error}</Alert>
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <Field label="Full name">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                placeholder="Your name"
                minLength={2}
                maxLength={80}
                required
              />
            </Field>
            <Field label="Email address">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            </Field>
            <Field
              label="Password"
              hint="At least 10 characters, including a letter and a number."
            >
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={10}
                maxLength={72}
                required
              />
            </Field>
            <Field label="Confirm password">
              <Input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </Field>
            <Button type="submit" disabled={busy} className="w-full py-3">
              {busy && <LoaderCircle className="animate-spin" size={17} />}{" "}
              Create student account
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Already registered?{" "}
            <Link href="/login" className="font-semibold text-indigo-600">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
