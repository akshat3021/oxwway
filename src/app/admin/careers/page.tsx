"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, MapPin, Clock, Briefcase } from "lucide-react";

const JOBS = [
  { id: 1, title: "Senior Robotics Engineer",    dept: "Engineering", location: "San Francisco, CA", type: "Full-time", status: "open",   posted: "2025-07-10", applicants: 24 },
  { id: 2, title: "ML Systems Researcher",        dept: "Research",    location: "Remote",            type: "Full-time", status: "open",   posted: "2025-07-08", applicants: 41 },
  { id: 3, title: "Hardware QA Lead",             dept: "Operations",  location: "Austin, TX",        type: "Full-time", status: "open",   posted: "2025-07-01", applicants: 12 },
  { id: 4, title: "Motion Control Specialist",    dept: "Engineering", location: "San Francisco, CA", type: "Full-time", status: "closed", posted: "2025-06-15", applicants: 58 },
  { id: 5, title: "Brand Designer",               dept: "Design",      location: "Remote",            type: "Contract",  status: "open",   posted: "2025-07-18", applicants: 7  },
];

export default function CareersAdmin() {
  const [jobs, setJobs] = useState(JOBS);

  return (
    <div className="max-w-5xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: "#E8342A" }}>[ CAREERS.SYS ]</div>
          <h1 className="text-2xl font-light uppercase tracking-widest" style={{ color: "#EDEEF0", fontFamily: "var(--font-display, sans-serif)" }}>
            Careers
          </h1>
          <p className="text-[10px] mt-1" style={{ color: "rgba(237,238,240,0.4)" }}>
            {jobs.filter(j => j.status === "open").length} open positions
          </p>
        </div>
        <Link
          href="/admin/careers/new"
          className="flex items-center gap-2 border px-4 py-2.5 text-[10px] uppercase tracking-widest transition-all"
          style={{ borderColor: "#E8342A", color: "#E8342A" }}
          onMouseEnter={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "rgba(232,52,42,0.08)")}
          onMouseLeave={e => ((e.currentTarget as HTMLAnchorElement).style.backgroundColor = "transparent")}
        >
          <Plus size={12} /> Add Role
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {jobs.map(job => (
          <div
            key={job.id}
            className="border flex items-center gap-5 px-5 py-4 hover:bg-white/[0.015] transition-colors"
            style={{ borderColor: "rgba(237,238,240,0.07)", backgroundColor: "#0D0E11" }}
          >
            <div className="w-10 h-10 border flex items-center justify-center flex-shrink-0" style={{ borderColor: "rgba(237,238,240,0.1)" }}>
              <Briefcase size={16} style={{ color: job.status === "open" ? "#E8342A" : "rgba(237,238,240,0.25)" }} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-sm mb-1" style={{ color: "#EDEEF0" }}>{job.title}</div>
              <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.4)" }}>
                <span>{job.dept}</span>
                <span className="flex items-center gap-1"><MapPin size={8} />{job.location}</span>
                <span className="flex items-center gap-1"><Clock size={8} />{job.type}</span>
              </div>
            </div>

            <div className="text-center flex-shrink-0">
              <div className="text-lg font-light tabular-nums" style={{ color: "#EDEEF0" }}>{job.applicants}</div>
              <div className="text-[9px] uppercase tracking-widest" style={{ color: "rgba(237,238,240,0.35)" }}>Applicants</div>
            </div>

            <div className="flex-shrink-0">
              <span
                className="text-[9px] uppercase tracking-widest px-2.5 py-1 border"
                style={{
                  color: job.status === "open" ? "#34C97A" : "rgba(237,238,240,0.3)",
                  borderColor: job.status === "open" ? "rgba(52,201,122,0.4)" : "rgba(237,238,240,0.1)",
                  backgroundColor: job.status === "open" ? "rgba(52,201,122,0.06)" : "transparent",
                }}
              >
                {job.status}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/admin/careers/new?edit=${job.id}`} className="opacity-40 hover:opacity-100 transition-opacity"><Edit2 size={13} /></Link>
              <button
                onClick={() => setJobs(j => j.filter(x => x.id !== job.id))}
                className="opacity-40 hover:text-red-400 hover:opacity-100 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
