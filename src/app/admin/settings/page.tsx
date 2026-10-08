"use client";

import React, { useState } from "react";
import { Shield, Key, Bell, Monitor, Save, Eye, EyeOff, RefreshCw, Check } from "lucide-react";

export default function SettingsAdmin() {
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [saved, setSaved] = useState<string | null>(null);
  const [notifs, setNotifs] = useState({ email: true, login: true, publish: false, weekly: true });
  const [twofa, setTwofa] = useState(false);

  const save = (section: string) => { setSaved(section); setTimeout(() => setSaved(null), 2000); };

  const inputStyle: React.CSSProperties = {
    width: "100%", backgroundColor: "transparent", border: "1px solid rgba(237,238,240,0.1)",
    padding: "10px 14px", fontSize: 12, color: "#EDEEF0", outline: "none",
  };

  const Toggle = ({ on, onToggle }: { on: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className="relative w-10 h-5 flex-shrink-0 transition-colors duration-200"
      style={{ backgroundColor: on ? "#E8342A" : "rgba(237,238,240,0.1)" }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 transition-all duration-200"
        style={{ backgroundColor: "#EDEEF0", left: on ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );

  const Section = ({ icon: Icon, title, id, children }: { icon: any; title: string; id: string; children: React.ReactNode }) => (
    <section className="border" style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}>
      <div className="flex items-center gap-3 px-6 py-4 border-b" style={{ borderColor: "rgba(237,238,240,0.07)" }}>
        <Icon size={14} style={{ color: "#E8342A" }} />
        <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.6)" }}>{title}</span>
        {saved === id && <span className="ml-auto text-[10px] flex items-center gap-1" style={{ color: "#34C97A" }}><Check size={10} /> Saved</span>}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ SECURITY.SYS ]</div>
        <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>Settings</h1>
      </div>

      <div className="flex flex-col gap-5">
        {/* Password */}
        <Section icon={Key} title="Change Password" id="pw">
          <div className="flex flex-col gap-3">
            {(["current", "next", "confirm"] as const).map(field => (
              <div key={field}>
                <label className="block text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(237,238,240,0.4)" }}>
                  {field === "current" ? "Current Password" : field === "next" ? "New Password" : "Confirm New Password"}
                </label>
                <div className="relative">
                  <input
                    type={show[field] ? "text" : "password"}
                    value={pwForm[field]}
                    onChange={e => setPwForm(f => ({ ...f, [field]: e.target.value }))}
                    style={{ ...inputStyle, paddingRight: 40 }}
                    onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
                    onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShow(s => ({ ...s, [field]: !s[field] }))} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100">
                    {show[field] ? <EyeOff size={12} style={{ color: "#EDEEF0" }} /> : <Eye size={12} style={{ color: "#EDEEF0" }} />}
                  </button>
                </div>
              </div>
            ))}
            <button onClick={() => save("pw")} className="self-start flex items-center gap-2 border px-4 py-2 text-[10px] uppercase tracking-widest mt-2 transition-all" style={{ borderColor: "#E8342A", color: "#E8342A" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
            >
              <Save size={11} /> Update Password
            </button>
          </div>
        </Section>

        {/* 2FA */}
        <Section icon={Shield} title="Two-Factor Authentication" id="2fa">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-xs mb-0.5" style={{ color: "#EDEEF0" }}>Authenticator App</div>
              <div className="text-[10px]" style={{ color: "rgba(237,238,240,0.4)" }}>Use Google Authenticator or similar</div>
            </div>
            <Toggle on={twofa} onToggle={() => setTwofa(v => !v)} />
          </div>
          {twofa && (
            <div className="border p-4 text-center" style={{ borderColor: "rgba(237,238,240,0.1)" }}>
              <div className="w-24 h-24 bg-white mx-auto mb-3 flex items-center justify-center text-[9px] text-black">QR CODE</div>
              <div className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.4)" }}>Scan with your authenticator app</div>
              <div className="font-mono text-[10px] mt-2 tracking-widest" style={{ color: "#E8342A" }}>OXWAY-2FA-DEMO-KEY</div>
            </div>
          )}
        </Section>

        {/* Notifications */}
        <Section icon={Bell} title="Notification Preferences" id="notif">
          <div className="flex flex-col gap-4">
            {(Object.keys(notifs) as (keyof typeof notifs)[]).map(key => {
              const labels: Record<string, [string, string]> = {
                email:   ["Email Alerts", "Receive important account alerts via email"],
                login:   ["Login Notifications", "Alert on new login from unrecognized device"],
                publish: ["Content Published", "Notify when content goes live"],
                weekly:  ["Weekly Summary", "Weekly digest of site activity"],
              };
              const [label, desc] = labels[key];
              return (
                <div key={key} className="flex items-center justify-between">
                  <div>
                    <div className="text-xs mb-0.5" style={{ color: "#EDEEF0" }}>{label}</div>
                    <div className="text-[10px]" style={{ color: "rgba(237,238,240,0.4)" }}>{desc}</div>
                  </div>
                  <Toggle on={notifs[key]} onToggle={() => setNotifs(n => ({ ...n, [key]: !n[key] }))} />
                </div>
              );
            })}
            <button onClick={() => save("notif")} className="self-start flex items-center gap-2 border px-4 py-2 text-[10px] uppercase tracking-widest transition-all" style={{ borderColor: "#E8342A", color: "#E8342A" }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
            >
              <Save size={11} /> Save Preferences
            </button>
          </div>
        </Section>

        {/* Sessions */}
        <Section icon={Monitor} title="Active Sessions" id="sessions">
          {[
            { device: "Chrome on Windows 11", ip: "10.82.109.146", time: "Now", current: true },
            { device: "Safari on iPhone 15",  ip: "192.168.1.42",  time: "2 days ago", current: false },
          ].map(({ device, ip, time, current }) => (
            <div key={device} className="flex items-center justify-between py-3 border-b last:border-0" style={{ borderColor: "rgba(237,238,240,0.06)" }}>
              <div>
                <div className="text-xs mb-0.5 flex items-center gap-2" style={{ color: "#EDEEF0" }}>
                  {device}
                  {current && <span className="text-[8px] border px-1.5 py-0.5" style={{ color: "#34C97A", borderColor: "rgba(52,201,122,0.4)" }}>Current</span>}
                </div>
                <div className="text-[9px]" style={{ color: "rgba(237,238,240,0.35)" }}>{ip} · {time}</div>
              </div>
              {!current && (
                <button className="text-[9px] uppercase tracking-widest flex items-center gap-1 opacity-50 hover:opacity-100 hover:text-red-400 transition-all" style={{ color: "#EDEEF0" }}>
                  <RefreshCw size={10} /> Revoke
                </button>
              )}
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}
