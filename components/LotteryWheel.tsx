"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MAX_NAMES,
  fitLabelScaled,
  labelFontSize,
  parseNames,
  polar,
  pseudoRandom,
  randomInt,
  sliceTone,
  slicePath,
  targetRotation,
} from "@/lib/lottery";

const SAMPLE = ["小明", "小華", "小美", "阿強", "阿珍", "大雄"];
const SPIN_MS = 5200;
const SPIN_MS_REDUCED = 700;

// ---- 轉盤幾何（viewBox 單位）----
const R = 92; // 扇形半徑
const HUB = 24; // 中央圓的半徑
const LABEL_START = 41; // 名字從這個半徑以外才開始（水滴尖端在 38，避免壓到名字）
const DOTS = 16; // 外圈白色小圓點數
const TONES = ["#8fb6ee", "#e7f0fd", "#bcd4f5"]; // 藍：中、淡、第三色（奇數格的最後一格）
const INK = "#0b2a63"; // 文字用的深藍

type Phase = "idle" | "spinning" | "done";
type Win = { index: number; name: string };

function Wheel({
  names,
  rotation,
  spinning,
  duration,
  highlight,
}: {
  names: string[];
  rotation: number;
  spinning: boolean;
  duration: number;
  highlight: number | null;
}) {
  const n = names.length;
  const fontSize = labelFontSize(n);
  const step = n > 0 ? 360 / n : 360;
  const labelEnd = R - 6;
  const labelMax = labelEnd - LABEL_START;

  return (
    <svg
      role="img"
      aria-label={n >= 2 ? `抽獎轉盤，共 ${n} 個名字` : "抽獎轉盤，尚未輸入足夠的名字"}
      viewBox="-114 -114 228 228"
      data-spinning={spinning}
      className="block w-full drop-shadow-[0_14px_26px_rgba(2,12,40,0.5)]"
    >
      <defs>
        <radialGradient id="lw-ring" r="0.5">
          <stop offset="0.82" stopColor="#123f93" />
          <stop offset="1" stopColor="#0a2a6e" />
        </radialGradient>
        <linearGradient id="lw-hub" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a9bff" />
          <stop offset="1" stopColor="#1f5bd4" />
        </linearGradient>
        <radialGradient id="lw-vig" r="0.5">
          <stop offset="0.7" stopColor="#0b2a63" stopOpacity="0" />
          <stop offset="1" stopColor="#0b2a63" stopOpacity="0.16" />
        </radialGradient>
      </defs>

      {/* 外圈：深藍底 + 細亮邊 + 一圈白色小圓點 */}
      <circle r="111" fill="url(#lw-ring)" />
      <circle r="110.4" fill="none" stroke="#6ea2f5" strokeOpacity="0.6" strokeWidth="1" />
      {Array.from({ length: DOTS }, (_, i) => {
        const [x, y] = polar((i * 360) / DOTS + 360 / DOTS / 2, 102.5);
        return <circle key={i} cx={x} cy={y} r="2.3" fill="#fff" className={i % 2 ? "bulb-a" : "bulb-b"} />;
      })}
      <circle r="94.5" fill="#0c2f77" />

      {/* 會轉動的扇形 */}
      {n === 0 ? (
        <circle r={R} fill="#cfe0fa" />
      ) : (
        <g
          style={{
            transformOrigin: "0px 0px", // viewBox 原點 (0,0) 就是轉盤中心
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? `transform ${duration}ms cubic-bezier(0.1, 0.72, 0.12, 1)` : "none",
          }}
        >
          {names.map((name, i) => {
            const mid = i * step + step / 2;
            const label = fontSize !== null ? fitLabelScaled(name, labelMax, fontSize) : null;
            return (
              <g key={i}>
                <path
                  d={slicePath(i, n, R)}
                  fill={TONES[sliceTone(i, n)]}
                  stroke="#fff"
                  strokeOpacity="0.85"
                  strokeWidth={n > 40 ? 0.3 : 0.9}
                />
                {label && (
                  <text
                    transform={`rotate(${mid - 90})`}
                    x={labelEnd}
                    textAnchor="end"
                    dominantBaseline="central"
                    fontSize={label.size}
                    fontWeight={800}
                    fill={INK}
                  >
                    {label.text}
                  </text>
                )}
              </g>
            );
          })}
          {/* 抽中的那一格：染上亮藍並加白框 */}
          {highlight !== null && highlight < n && (
            <path
              d={slicePath(highlight, n, R)}
              fill="#2f7bff"
              fillOpacity="0.38"
              stroke="#fff"
              strokeWidth={n > 40 ? 1.2 : n > 20 ? 2 : 3}
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}
        </g>
      )}

      {/* 立體感：邊緣微暗 */}
      <circle r={R} fill="url(#lw-vig)" pointerEvents="none" />

      {/* 中央圓：藍色漸層 + 白邊（文字由疊在上面的按鈕顯示） */}
      <circle r={HUB + 4} fill="#fff" opacity="0.28" />
      <circle r={HUB} fill="url(#lw-hub)" stroke="#fff" strokeWidth="3" />

      {/* 指針：圓鈕上方的一滴水滴，尖端指向正上方（尖端在半徑 38 處） */}
      <g>
        <path
          d="M0 -38 C2.2 -34.2 6.5 -31.2 6.5 -27 A6.5 6.5 0 0 1 -6.5 -27 C-6.5 -31.2 -2.2 -34.2 0 -38 Z"
          fill="#fff"
          stroke="#1f5bd4"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        <circle cx="0" cy="-26.6" r="2.9" fill="#2f6fe0" />
      </g>
    </svg>
  );
}

/** 中獎時從轉盤上方噴出的彩帶：位置與顏色用固定公式算（只是裝飾），不是抽獎用的隨機 */
const CONFETTI = Array.from({ length: 34 }, (_, i) => ({
  x: (pseudoRandom(i + 1) - 0.5) * 520,
  y: 140 + pseudoRandom(i + 60) * 260,
  r: (pseudoRandom(i + 120) - 0.5) * 900,
  w: 6 + pseudoRandom(i + 180) * 6,
  h: 10 + pseudoRandom(i + 240) * 8,
  delay: pseudoRandom(i + 300) * 0.25,
  color: ["#ffffff", "#8fb6ee", "#4b8ff5", "#bcd4f5", "#2f6fe0"][i % 5],
}));

function Confetti() {
  return (
    <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 z-20 h-0 w-0">
      {CONFETTI.map((c, i) => (
        <span
          key={i}
          className="confetti-piece absolute block rounded-[1px]"
          style={
            {
              width: c.w,
              height: c.h,
              background: c.color,
              animationDelay: `${c.delay}s`,
              "--x": `${c.x}px`,
              "--y": `${c.y}px`,
              "--r": `${c.r}deg`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

export default function LotteryWheel() {
  const [text, setText] = useState("");
  const [removeWinner, setRemoveWinner] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [rotation, setRotation] = useState(0);
  const [duration, setDuration] = useState(SPIN_MS);
  const [win, setWin] = useState<Win | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const parsed = useMemo(() => parseNames(text), [text]);
  const overLimit = parsed.length > MAX_NAMES;
  const names = useMemo(() => parsed.slice(0, MAX_NAMES), [parsed]);
  const duplicates = names.length - new Set(names).size;
  const spinning = phase === "spinning";

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  const draw = () => {
    if (spinning) return;

    // 「抽中的人不再參加」：上一位得主先從名單移除，再從剩下的人裡抽
    let pool = names;
    if (removeWinner && win && names[win.index] === win.name) {
      pool = names.filter((_, i) => i !== win.index);
      setText(pool.join("\n"));
    }
    if (pool.length < 2) return;

    const index = randomInt(pool.length); // 先決定誰中獎，轉盤再轉過去
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ms = reduce ? SPIN_MS_REDUCED : SPIN_MS;

    setWin(null);
    setDuration(ms);
    setPhase("spinning");
    setRotation(targetRotation(rotation, index, pool.length, reduce ? 1 : 6, Math.random() - 0.5));

    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setWin({ index, name: pool[index] });
      setHistory((h) => [...h, pool[index]]);
      setPhase("done");
    }, ms + 150);
  };

  const canDraw = names.length >= 2 && !spinning;
  const nextPool = removeWinner && win ? names.length - 1 : names.length;
  const cannotContinue = phase === "done" && removeWinner && nextPool < 2;
  const disabled = !canDraw || cannotContinue;

  const hubText = spinning ? ["轉動", "中…"] : phase === "done" ? ["再抽", "一次"] : ["開始", "抽獎"];

  const chip =
    "rounded-full border border-sky-200/40 px-4 py-1.5 text-sm text-sky-50 transition-colors hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent";

  return (
    <>
      <header className="mb-10 mt-6 text-center sm:mb-14">
        <h1 className="inline-block bg-gradient-to-b from-white to-[#8fb6ee] bg-clip-text text-5xl font-black tracking-wide text-transparent [filter:drop-shadow(0_2px_0_#1d4fb4)_drop-shadow(0_5px_0_#0f3a8e)_drop-shadow(0_12px_12px_rgba(2,12,40,0.45))] sm:text-6xl">
          幸運大轉盤
        </h1>
        <p className="mt-5 text-sm text-sky-100/80">
          {names.length > 0 ? (
            <>
              本次共 <span className="font-bold text-white">{names.length}</span> 位參加抽獎
            </>
          ) : (
            "輸入名單，按下開始抽獎"
          )}
        </p>
      </header>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-14">
        {/* 左：名單 */}
        <section
          aria-labelledby="list-title"
          className="h-fit rounded-3xl border border-sky-200/20 bg-[#06235f]/50 p-5 backdrop-blur-sm sm:p-6"
        >
          <div className="flex items-end justify-between">
            <h2 id="list-title" className="text-lg font-bold text-white">
              參加名單
            </h2>
            <p className="text-sm text-sky-100/70">
              <span className="font-bold text-white">{names.length}</span> 人
            </p>
          </div>
          <p className="mt-1 text-xs leading-5 text-sky-100/55">一行一個名字，也可以用逗號分隔。</p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            readOnly={spinning}
            rows={10}
            placeholder={"小明\n小華\n小美\n…"}
            aria-label="參加名單"
            className="mt-3 block w-full resize-y rounded-2xl border border-sky-200/25 bg-[#041846]/70 p-4 text-base leading-7 text-sky-50 outline-none transition-colors placeholder:text-sky-100/25 focus:border-white read-only:opacity-60"
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" disabled={spinning} onClick={() => setText(SAMPLE.join("\n"))} className={chip}>
              放入範例名單
            </button>
            <button
              type="button"
              disabled={spinning || text === ""}
              onClick={() => {
                setText("");
                setWin(null);
                setPhase("idle");
              }}
              className={chip}
            >
              清空
            </button>
          </div>

          {(overLimit || duplicates > 0) && (
            <ul className="mt-3 space-y-1 text-xs leading-5 text-[#ffd98a]">
              {overLimit && <li>名單最多 {MAX_NAMES} 人，超過的部分不會參加抽獎。</li>}
              {duplicates > 0 && <li>有 {duplicates} 個重複的名字，重複的人會有比較多的中獎機會。</li>}
            </ul>
          )}

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm leading-6 text-sky-50">
            <input
              type="checkbox"
              checked={removeWinner}
              onChange={(e) => setRemoveWinner(e.target.checked)}
              disabled={spinning}
              className="mt-1 h-4 w-4 accent-[#5a9bff]"
            />
            <span>
              抽中的人不再參加下一輪
              <span className="block text-xs text-sky-100/55">
                適合一次抽好幾個獎項；下次抽獎時會先把得主移出名單。
              </span>
            </span>
          </label>
        </section>

        {/* 右：轉盤與結果 */}
        <section aria-label="轉盤" className="min-w-0">
          <div className="relative mx-auto w-full max-w-[34rem]">
            {phase === "done" && win && <Confetti key={history.length} />}

            <Wheel
              names={names}
              rotation={rotation}
              spinning={spinning}
              duration={duration}
              highlight={phase === "done" && win ? win.index : null}
            />

            {/* 中央的透明按鈕：蓋在圓鈕上，負責顯示文字與接收點擊 */}
            <button
              type="button"
              onClick={draw}
              disabled={disabled}
              aria-label={spinning ? "轉動中" : phase === "done" ? "再抽一次" : "開始抽獎"}
              className="absolute left-1/2 top-1/2 flex aspect-square w-[21%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-end rounded-full pb-[4.5%] text-[clamp(0.65rem,2.3vw,1.1rem)] font-black leading-[1.15] text-white outline-offset-2 transition-transform enabled:hover:scale-105 enabled:active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{hubText[0]}</span>
              <span>{hubText[1]}</span>
            </button>

            {names.length < 2 && (
              <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[16%]">
                <p className="max-w-[13rem] rounded-2xl bg-[#06235f]/80 px-4 py-3 text-center text-sm leading-6 text-sky-50 backdrop-blur-sm">
                  {names.length === 0 ? "在左邊輸入名單，轉盤就會出現" : "至少要 2 個名字才能抽獎"}
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col items-center gap-5" aria-live="polite">
            <button
              type="button"
              onClick={draw}
              disabled={disabled}
              className="w-full max-w-md rounded-full bg-gradient-to-b from-white to-[#cfe0fb] px-8 py-4 text-lg font-black text-[#0b2a63] shadow-[0_10px_26px_rgba(2,12,40,0.4),inset_0_-3px_0_rgba(31,91,212,0.25)] transition enabled:hover:brightness-105 enabled:active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {spinning ? "轉動中…" : phase === "done" ? "再抽一次" : "開始抽獎"}
            </button>

            {cannotContinue && <p className="text-sm text-sky-100/70">名單剩下不到 2 個人，無法繼續抽了。</p>}

            {phase === "done" && win && (
              <div className="pop w-full max-w-md rounded-3xl border border-white/60 bg-gradient-to-b from-[#3d7df0] to-[#1a4fb8] px-6 py-6 text-center shadow-[0_14px_34px_rgba(2,12,40,0.45)]">
                <p className="text-xs tracking-[0.3em] text-sky-100/80">抽中的是</p>
                <p className="mt-2 break-words text-4xl font-black leading-tight text-white drop-shadow-[0_2px_8px_rgba(2,12,40,0.4)] sm:text-5xl">
                  {win.name}
                </p>
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="mx-auto mt-10 max-w-md">
              <div className="flex items-center justify-between border-b border-sky-200/20 pb-2">
                <h3 className="text-sm font-bold text-white">抽獎紀錄</h3>
                <button
                  type="button"
                  disabled={spinning}
                  onClick={() => setHistory([])}
                  className="text-xs text-sky-100/60 underline underline-offset-4 hover:text-white disabled:opacity-40"
                >
                  清除紀錄
                </button>
              </div>
              <ol className="divide-y divide-sky-200/10 text-sm">
                {history.map((h, i) => (
                  <li key={i} className="flex gap-4 py-2">
                    <span className="w-16 shrink-0 whitespace-nowrap text-sky-100/55">第 {i + 1} 次</span>
                    <span className="break-words font-medium text-white">{h}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
