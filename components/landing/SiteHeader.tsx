"use client";

import Link from "next/link";
import { useState } from "react";

const NAV = [
  { href: "#lottery", label: "幸運大轉盤" },
  { href: "#pomodoro", label: "番茄鐘" },
  { href: "#fortune", label: "好運抽籤" },
];

/** 工具箱圖示：把手加箱身，箱身上有一個小圓點 */
function Logo() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden className="h-8 w-8">
      <rect x="2" y="10" width="28" height="19" rx="4" fill="#1c1b19" />
      <path d="M11 10V8a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v2" fill="none" stroke="#1c1b19" strokeWidth="2.6" />
      <rect x="2" y="17" width="28" height="3" fill="#e5532d" />
      <rect x="13.5" y="15" width="5" height="7" rx="1.4" fill="#f5f3ee" />
    </svg>
  );
}

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-paper/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <Logo />
          <span className="text-lg font-black tracking-wide">Randy的小工具箱</span>
        </Link>

        <nav aria-label="主要導覽" className="hidden items-center gap-8 text-sm md:flex">
          {NAV.map((n) => (
            <a key={n.href} href={n.href} className="text-ink/70 transition-colors hover:text-ink">
              {n.label}
            </a>
          ))}
          <a
            href="#tools"
            className="rounded-full bg-ink px-5 py-2 text-paper transition-colors hover:bg-accent"
          >
            開始使用
          </a>
        </nav>

        <button
          type="button"
          aria-label={open ? "關閉選單" : "開啟選單"}
          aria-expanded={open}
          aria-controls="mobile-nav"
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
        >
          <span className={`h-0.5 w-6 bg-ink transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`h-0.5 w-6 bg-ink transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`h-0.5 w-6 bg-ink transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="手機導覽" className="border-t border-ink/10 bg-paper px-4 pb-4 md:hidden">
          <ul>
            {NAV.map((n) => (
              <li key={n.href} className="border-b border-ink/10 last:border-b-0">
                <a href={n.href} onClick={() => setOpen(false)} className="block py-4 text-lg font-bold">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
