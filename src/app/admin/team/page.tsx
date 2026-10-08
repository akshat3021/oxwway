"use client";

import React, { useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

function LinkedinIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function TwitterIcon({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

const TEAM = [
  { id: 1, name: "Arjun Mehta",    role: "Chief Executive Officer",       dept: "Leadership",   img: null, active: true  },
  { id: 2, name: "Priya Nair",     role: "Chief Technology Officer",      dept: "Leadership",   img: null, active: true  },
  { id: 3, name: "Luca Romano",    role: "Lead Robotics Engineer",        dept: "Engineering",  img: null, active: true  },
  { id: 4, name: "Sofia Andersen", role: "Head of ML Research",           dept: "Research",     img: null, active: true  },
  { id: 5, name: "James Wu",       role: "Senior Motion Control Eng.",    dept: "Engineering",  img: null, active: true  },
  { id: 6, name: "Aiko Tanaka",    role: "Industrial Designer",           dept: "Design",       img: null, active: false },
];

const DEPT_COLOR: Record<string, string> = {
  Leadership: "#E8342A", Engineering: "#4A9EFF", Research: "#34C97A", Design: "#F5A623", Operations: "#A78BFA",
};

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-10 h-10 flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ backgroundColor: "rgba(232,52,42,0.12)", color: "#E8342A", border: "1px solid rgba(232,52,42,0.2)" }}>
      {initials}
    </div>
  );
}

export default function TeamAdmin() {
  const [members, setMembers] = useState(TEAM);
  const [showForm, setShowForm] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", dept: "Engineering" });

  const addMember = () => {
    if (!newMember.name || !newMember.role) return;
    setMembers(m => [...m, { id: Date.now(), ...newMember, img: null, active: true }]);
    setNewMember({ name: "", role: "", dept: "Engineering" });
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ TEAM.SYS ]</div>
          <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>Team</h1>
          <p className="text-[10px] mt-1" style={{ color: "rgba(237,238,240,0.4)" }}>{members.filter(m => m.active).length} active members</p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
          style={{ borderColor: "#E8342A", color: "#E8342A" }}
          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(232,52,42,0.08)"}
          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent"}
        >
          <Plus size={12} /> Add Member
        </button>
      </div>

      {/* Add member form */}
      {showForm && (
        <div className="border p-5 mb-5 grid grid-cols-3 gap-3 items-end" style={{ borderColor: "rgba(237,238,240,0.12)", backgroundColor: "#0D0E11" }}>
          {[
            { label: "Name", key: "name", ph: "Full name" },
            { label: "Role", key: "role", ph: "e.g. Senior Engineer" },
          ].map(({ label, key, ph }) => (
            <div key={key}>
              <label className="block text-[9px] uppercase tracking-widest mb-1.5" style={{ color: "rgba(237,238,240,0.4)" }}>{label}</label>
              <input
                value={(newMember as any)[key]}
                onChange={e => setNewMember(m => ({ ...m, [key]: e.target.value }))}
                placeholder={ph}
                className="w-full bg-transparent border px-3 py-2 text-xs outline-none"
                style={{ borderColor: "rgba(237,238,240,0.1)", color: "#EDEEF0" }}
                onFocus={e => (e.currentTarget.style.borderColor = "#E8342A")}
                onBlur={e => (e.currentTarget.style.borderColor = "rgba(237,238,240,0.1)")}
              />
            </div>
          ))}
          <button
            onClick={addMember}
            className="border px-4 py-2 text-[10px] uppercase tracking-widest transition-all"
            style={{ borderColor: "#E8342A", color: "#E8342A" }}
          >
            Add
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {members.map(member => (
          <div
            key={member.id}
            className="border flex items-center gap-4 px-5 py-4 hover:bg-white/[0.015] transition-colors"
            style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11", opacity: member.active ? 1 : 0.5 }}
          >
            <Avatar name={member.name} />
            <div className="flex-1">
              <div className="text-sm mb-0.5" style={{ color: "#EDEEF0" }}>{member.name}</div>
              <div className="text-[10px]" style={{ color: "rgba(237,238,240,0.45)" }}>{member.role}</div>
            </div>
            <span
              className="text-[9px] uppercase tracking-widest px-2.5 py-1 border flex-shrink-0"
              style={{ color: DEPT_COLOR[member.dept] ?? "#EDEEF0", borderColor: `${DEPT_COLOR[member.dept] ?? "#EDEEF0"}35`, backgroundColor: `${DEPT_COLOR[member.dept] ?? "#EDEEF0"}10` }}
            >
              {member.dept}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button className="opacity-30 hover:opacity-70 transition-opacity"><LinkedinIcon size={13} /></button>
              <button className="opacity-30 hover:opacity-70 transition-opacity"><TwitterIcon size={13} /></button>
              <button className="opacity-40 hover:opacity-100 transition-opacity"><Edit2 size={13} /></button>
              <button onClick={() => setMembers(m => m.filter(x => x.id !== member.id))} className="opacity-40 hover:text-red-400 hover:opacity-100 transition-all"><Trash2 size={13} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
