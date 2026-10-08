"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

const CREDENTIALS = {
  email: "admin@oxway.io",
  password: "oxway2025"
};

export default function AdminLogin() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate auth
    if (form.email === CREDENTIALS.email && form.password === CREDENTIALS.password) {
      const sessionData = { email: form.email, role: "admin" };
      localStorage.setItem("oxway-admin-session", JSON.stringify(sessionData));
      document.cookie = `oxway_admin_session=${JSON.stringify(sessionData)}; path=/; max-age=86400; SameSite=Strict`;
      router.push("/admin");
    } else {
      setError("Invalid credentials. Access denied.");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#0A0B0D", fontFamily: "var(--font-mono, monospace)" }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(237,238,240,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(237,238,240,0.03) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative w-full max-w-sm px-4">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.jpg" alt="OXWAY" className="w-14 h-14 object-contain mb-4" style={{ filter: "invert(1) brightness(0.7)" }} />
          <div className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: "#EDEEF0" }}>
            O<span style={{ color: "#E8342A" }}>X</span>WAY
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: "rgba(237,238,240,0.35)" }}>
            Secure Admin Access
          </div>
        </div>

        {/* Card */}
        <div
          className="border p-8"
          style={{ borderColor: "rgba(237,238,240,0.08)", backgroundColor: "#0D0E11" }}
        >
          <div className="text-[10px] uppercase tracking-[0.2em] mb-6" style={{ color: "#E8342A" }}>
            [ AUTH.SYS.01 ] Authenticate
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.45)" }}>
                Email Address
              </label>
              <input
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full bg-transparent border px-4 py-3 text-xs outline-none transition-colors"
                style={{
                  borderColor: "rgba(237,238,240,0.12)",
                  color: "#EDEEF0",
                }}
                onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.12)")}
                placeholder="admin@oxway.io"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-[10px] uppercase tracking-widest mb-2" style={{ color: "rgba(237,238,240,0.45)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  className="w-full bg-transparent border px-4 py-3 text-xs outline-none transition-colors pr-10"
                  style={{ borderColor: "rgba(237,238,240,0.12)", color: "#EDEEF0" }}
                  onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
                  onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.12)")}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-80 transition-opacity"
                  style={{ color: "#EDEEF0" }}
                >
                  {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-[10px]" style={{ color: "#E8342A" }}>
                <AlertCircle size={11} />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 border px-6 py-3 text-[10px] uppercase tracking-[0.2em] transition-all duration-200 flex items-center justify-center gap-3"
              style={{
                borderColor: "#E8342A",
                color: loading ? "rgba(232,52,42,0.5)" : "#E8342A",
                backgroundColor: loading ? "rgba(232,52,42,0.05)" : "transparent",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = loading ? "rgba(232,52,42,0.05)" : "transparent"; }}
            >
              {loading ? (
                <>
                  <span className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                "[ Initiate Access ]"
              )}
            </button>
          </form>

        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-[9px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.2)" }}>
          OXWAY Operating System — Restricted Access
        </div>
      </div>
    </div>
  );
}
