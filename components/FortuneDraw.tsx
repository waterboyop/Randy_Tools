"use client";

import { useEffect, useRef, useState } from "react";
import { drawFortune, toShareText, type Draw } from "@/lib/fortune";

type Phase = "idle" | "shaking" | "out" | "done";

const SHAKE_MS = 1500;
const OUT_MS = 800;
const REDUCED_MS = 250;

/** 籤筒：深紅筒身、金色橫帶、一把竹籤；被抽中的那支會往上彈出 */
function Cylinder({ popped }: { popped: boolean }) {
  // 各支籤的位置與露出的高度（最後一支 idx 4 是會被抽出來的那支）
  const sticks = [
    { x: 60, top: 40 },
    { x: 70, top: 26 },
    { x: 80, top: 46 },
    { x: 90, top: 30 },
    { x: 100, top: 14 },
    { x: 110, top: 36 },
    { x: 120, top: 24 },
    { x: 130, top: 44 },
    { x: 140, top: 32 },
  ];
  return (
    <svg viewBox="0 0 200 284" aria-hidden className="block w-full">
      <defs>
        <linearGradient id="fd-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9b873" />
          <stop offset="0.5" stopColor="#f3dca4" />
          <stop offset="1" stopColor="#c9a35a" />
        </linearGradient>
        <linearGradient id="fd-body" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5c0f0a" />
          <stop offset="0.35" stopColor="#a8231a" />
          <stop offset="0.7" stopColor="#8a1a12" />
          <stop offset="1" stopColor="#4a0b07" />
        </linearGradient>
      </defs>

      <ellipse cx="100" cy="272" rx="64" ry="8" fill="rgba(0,0,0,0.4)" />

      {/* 竹籤（先畫，筒身會蓋住它們的下半截） */}
      {sticks.map((s, i) => {
        const chosen = i === 4;
        return (
          <g
            key={i}
            style={{
              transformBox: "fill-box",
              transformOrigin: "50% 100%",
              transform: chosen && popped ? "translateY(-78px) rotate(-7deg)" : "none",
              transition: chosen ? "transform 0.7s cubic-bezier(0.2, 0.9, 0.25, 1.15)" : undefined,
            }}
          >
            <rect x={s.x - 3.5} y={s.top} width="7" height="160" rx="1.5" fill="url(#fd-wood)" stroke="#8a6a2e" strokeWidth="0.6" />
            <rect x={s.x - 3.5} y={s.top} width="7" height="9" rx="1.5" fill="#b3261e" />
          </g>
        );
      })}

      {/* 筒身 */}
      <path d="M46 112 Q100 130 154 112 L154 252 Q100 272 46 252 Z" fill="url(#fd-body)" />
      <path d="M62 124 L62 252" stroke="rgba(255,255,255,0.13)" strokeWidth="9" strokeLinecap="round" />
      <path d="M46 112 Q100 130 154 112" fill="none" stroke="#e6b84a" strokeWidth="4" />
      <path d="M46 136 Q100 154 154 136" fill="none" stroke="#e6b84a" strokeWidth="3" />
      <path d="M46 238 Q100 258 154 238" fill="none" stroke="#e6b84a" strokeWidth="3" />
      <text x="100" y="206" textAnchor="middle" fontSize="50" fontWeight="900" fill="#f2c95a" fontFamily="serif">
        籤
      </text>
    </svg>
  );
}

export default function FortuneDraw() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [draw, setDraw] = useState<Draw | null>(null);
  const [history, setHistory] = useState<Draw[]>([]);
  const [copied, setCopied] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  const busy = phase === "shaking" || phase === "out";

  const pull = () => {
    if (busy) return;
    clearTimers();
    setCopied(false);
    setDraw(null);
    setPhase("shaking");

    const result = drawFortune(); // 結果在開始搖籤的瞬間就決定了，後面只是動畫
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shake = reduce ? REDUCED_MS : SHAKE_MS;
    const out = reduce ? REDUCED_MS : OUT_MS;

    timers.current.push(setTimeout(() => setPhase("out"), shake));
    timers.current.push(
      setTimeout(() => {
        setDraw(result);
        setHistory((h) => [...h.slice(-9), result]);
        setPhase("done");
      }, shake + out),
    );
  };

  const copy = async () => {
    if (!draw) return;
    try {
      await navigator.clipboard.writeText(toShareText(draw));
      setCopied(true);
      timers.current.push(setTimeout(() => setCopied(false), 2000));
    } catch {
      setCopied(false);
    }
  };

  const g = draw?.grade;
  const poem = draw && g ? g.poems[draw.poemIndex] : null;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-16">
      {/* 左：籤筒 */}
      <section aria-label="籤筒" className="mx-auto w-full max-w-[22rem]">
        <button
          type="button"
          onClick={pull}
          disabled={busy}
          aria-label="搖籤筒抽籤"
          className="group mx-auto block w-[68%] rounded-3xl outline-offset-4 transition-transform enabled:hover:scale-[1.03] enabled:active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#e6b84a] disabled:cursor-wait"
        >
          <div className={phase === "shaking" ? "shake" : ""}>
            <Cylinder popped={phase === "out" || phase === "done"} />
          </div>
        </button>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={pull}
            disabled={busy}
            className="w-full max-w-[17rem] rounded-full bg-gradient-to-b from-[#f3cf6a] to-[#d29a22] py-4 text-lg font-black text-[#3a0d08] shadow-[0_10px_26px_rgba(0,0,0,0.45),inset_0_-3px_0_rgba(120,60,0,0.25)] transition enabled:hover:brightness-105 enabled:active:scale-[0.98] disabled:cursor-wait disabled:opacity-60"
          >
            {busy ? "搖籤中…" : phase === "done" ? "再抽一次" : "抽籤"}
          </button>
          <p className="text-center text-xs leading-6 text-[#f1dfb6]/60">
            靜下心，想一件今天最在意的事，
            <br />
            再按下抽籤。
          </p>
        </div>

        {history.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between border-b border-[#e6b84a]/20 pb-2">
              <h3 className="text-xs tracking-[0.25em] text-[#f1dfb6]/60">本次抽過</h3>
              <button
                type="button"
                disabled={busy}
                onClick={() => setHistory([])}
                className="text-xs text-[#f1dfb6]/50 underline underline-offset-4 hover:text-white disabled:opacity-40"
              >
                清除
              </button>
            </div>
            <ul className="mt-3 flex flex-wrap gap-2">
              {history.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs"
                >
                  <span aria-hidden className="h-2 w-2 rounded-full" style={{ backgroundColor: h.grade.color }} />
                  {h.grade.name}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* 右：結果 */}
      <section aria-label="抽籤結果" className="min-w-0">
        {phase === "idle" && (
          <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-3xl border border-dashed border-[#e6b84a]/35 p-8 text-center">
            <p className="text-2xl font-black text-[#f2c95a]">還沒抽籤</p>
            <p className="mt-3 max-w-xs text-sm leading-7 text-[#f1dfb6]/65">
              按下「抽籤」，搖一搖籤筒，看看今天的運勢。每一次都是公平隨機，想抽幾次都可以。
            </p>
          </div>
        )}

        {busy && (
          <div className="flex min-h-[22rem] flex-col items-center justify-center rounded-3xl border border-dashed border-[#e6b84a]/35 p-8 text-center">
            <p className="text-2xl font-black text-[#f2c95a]">{phase === "shaking" ? "搖籤中…" : "有一支籤掉出來了"}</p>
            <p className="mt-3 text-sm text-[#f1dfb6]/65">請稍候</p>
          </div>
        )}

        {phase === "done" && draw && g && poem && (
          <div key={history.length} className="slip-in">
            {/* 籤紙 */}
            <article
              aria-label={`第 ${draw.no} 籤，${g.name}`}
              className="mx-auto max-w-md rounded-2xl border-4 border-[#c79a3a] bg-[#f6ecd2] p-6 text-[#3a1a10] shadow-[0_18px_46px_rgba(0,0,0,0.5)] sm:p-8"
            >
              <div className="flex items-center justify-between border-b-2 border-[#c79a3a]/50 pb-3 text-sm tracking-[0.3em]">
                <span>第 {draw.no} 籤</span>
                <span style={{ color: g.color }} className="font-bold">
                  今日運勢
                </span>
              </div>

              <div className="mt-6 flex items-start justify-center gap-8 sm:gap-12">
                <p
                  className="font-black leading-none tracking-[0.15em] [writing-mode:vertical-rl]"
                  style={{ color: g.color, fontSize: "clamp(3.6rem, 12vw, 5.2rem)" }}
                >
                  {g.name}
                </p>
                <div className="text-lg leading-10 tracking-[0.25em] [writing-mode:vertical-rl] sm:text-xl sm:leading-[2.6rem]">
                  {poem.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                </div>
              </div>

              <p className="mt-6 border-t-2 border-[#c79a3a]/50 pt-4 text-center text-sm font-medium leading-7">
                {g.summary}
              </p>
            </article>

            {/* 詳細解說 */}
            <div className="mx-auto mt-8 max-w-md space-y-6">
              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(Object.entries(g.advice) as [string, string][]).map(([k, v]) => (
                  <div key={k} className="rounded-2xl border border-[#e6b84a]/25 bg-black/20 p-4">
                    <dt className="text-xs font-bold tracking-[0.3em] text-[#f2c95a]">{k}</dt>
                    <dd className="mt-2 text-sm leading-6 text-[#f8ecd0]">{v}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-bold tracking-[0.3em] text-[#8fe0a0]">宜</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {g.good.map((x) => (
                      <li key={x} className="rounded-full bg-[#8fe0a0]/15 px-3 py-1 text-xs text-[#c9f2d2]">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.3em] text-[#ff9b8a]">忌</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {g.avoid.map((x) => (
                      <li key={x} className="rounded-full bg-[#ff9b8a]/15 px-3 py-1 text-xs text-[#ffd1c8]">
                        {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-black/25 px-5 py-4 text-sm">
                <span className="text-xs tracking-[0.3em] text-[#f1dfb6]/60">今日幸運物</span>
                <span>
                  幸運色 <b className="text-[#f2c95a]">{draw.luckyColor}</b>
                </span>
                <span>
                  數字 <b className="text-[#f2c95a]">{draw.luckyNumber}</b>
                </span>
                <span>
                  方位 <b className="text-[#f2c95a]">{draw.luckyDirection}</b>
                </span>
              </div>

              <p className="text-center text-sm leading-7 text-[#f1dfb6]/85">「{g.tip}」</p>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={copy}
                  className="rounded-full border border-[#e6b84a]/50 px-6 py-2.5 text-sm text-[#f6e2a8] transition-colors hover:bg-[#e6b84a]/15"
                >
                  {copied ? "已複製" : "複製結果"}
                </button>
              </div>

              <p className="text-center text-xs text-[#f1dfb6]/40">抽籤純屬娛樂，僅供參考，開心就好。</p>
            </div>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {phase === "done" && draw ? `抽到第 ${draw.no} 籤，${draw.grade.name}。${draw.grade.summary}` : ""}
        </p>
      </section>
    </div>
  );
}
