"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get("username") ?? "");
    const password = String(form.get("password") ?? "");

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Invalid admin credentials.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#050b16] px-6 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <p className="text-xs uppercase tracking-[0.28em] text-red-400">Secure access</p>
        <h1 className="mt-3 text-3xl font-black">Admin login</h1>
        <p className="mt-2 text-sm text-slate-400">Use your secure admin credentials to manage content.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Username</span>
            <input name="username" defaultValue="admin" className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 outline-none focus:border-red-500" />
          </label>
          <label className="block space-y-2 text-sm text-slate-200">
            <span>Password</span>
            <input type="password" name="password" className="w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2.5 outline-none focus:border-red-500" />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="w-full rounded-full bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-500">
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
