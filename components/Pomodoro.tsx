"use client";

import Link from "next/link";
import { useEffect, useReducer, useRef, useState } from "react";
import {
  LIMITS,
  PHASE_LABEL,
  durationMs,
  formatTime,
  initState,
  reducer,
  timeLeft,
  type Phase,
  type Settings,
} from "@/lib/pomodoro";

const THEME: Record<Phase, { bg: string; accent: string; soft: string }> = {
  focus: { bg: "#2b1410", accent: "#ff6b4a", soft: "#44201a" },
  short: { bg: "#0d2a22", accent: "#4fd1a0", soft: "#14402f" },
  long: { bg: "#0f1f3d", accent: "#6ea8ff", soft: "#19315c" },
};

const R = 108;
const CIRC = 2 * Math.PI * R;

/** 三個音的提示音（WebAudio 現場合成，不需要音檔） */
function chime(ctx: AudioContext) {
  const t0 = ctx.currentTime;
  for (const [freq, at] of [
    [880, 0],
    [1175, 0.18],
    [1568, 0.36],
  ]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, t0 + at);
    gain.gain.exponentialRampToValueAtTime(0.25, t0 + at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + 0.55);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0 + at);
    osc.stop(t0 + at + 0.6);
  }
}

function Stepper({
  label,
  value,
  unit,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const btn =
    "flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-lg leading-none transition-colors hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent";
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-white/80">{label}</span>
      <div className="flex items-center gap-3">
        <button type="button" aria-label={`${label}減少`} disabled={value <= min} onClick={() => onChange(value - 1)} className={btn}>
          −
        </button>
        <span className="w-14 text-center text-sm tabular-nums" aria-live="polite">
          {value} {unit}
        </span>
        <button type="button" aria-label={`${label}增加`} disabled={value >= max} onClick={() => onChange(value + 1)} className={btn}>
          +
        </button>
      </div>
    </div>
  );
}

function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5">
      <span className="text-sm text-white/80">
        {label}
        {hint && <span className="block text-xs text-white/45">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? "bg-white/85" : "bg-white/20"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full transition-all ${checked ? "left-[1.375rem] bg-[#2b1410]" : "left-0.5 bg-white/80"}`}
        />
      </button>
    </div>
  );
}

export default function Pomodoro() {
  const [state, dispatch] = useReducer(reducer, undefined, () => initState());
  const [task, setTask] = useState("");
  const [notifyHint, setNotifyHint] = useState<string | null>(null);
  const audio = useRef<AudioContext | null>(null);

  const { settings, phase, running, completed, event } = state;
  const left = timeLeft(state);
  const total = durationMs(phase, settings);
  const theme = THEME[phase];
  const timeStr = formatTime(left);
  const started = running || state.remaining < total; // 已經開始過（暫停中也算）

  // 瀏覽器要求聲音必須在使用者操作之後才能啟動，所以在按「開始」時先把 AudioContext 準備好
  const unlockAudio = () => {
    try {
      audio.current ??= new AudioContext();
      void audio.current.resume();
    } catch {
      /* 不支援就沒有聲音，不影響計時 */
    }
  };

  const start = () => {
    unlockAudio();
    dispatch({ type: "start", now: Date.now() });
  };
  const toggle = () => {
    unlockAudio();
    dispatch({ type: "toggle", now: Date.now() });
  };
  const set = (patch: Partial<Settings>) => dispatch({ type: "settings", patch });

  // 計時：每 250ms 檢查一次「現在」。時間是用結束時間點算的，所以分頁在背景被降速也不會變慢。
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => dispatch({ type: "tick", now: Date.now() }), 250);
    const onVisible = () => {
      if (!document.hidden) dispatch({ type: "tick", now: Date.now() });
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [running]);

  // 階段自然結束：提示音 + 桌面通知（分頁在背景時才發，避免和畫面重複）
  useEffect(() => {
    if (!event) return;
    if (settings.sound && audio.current) chime(audio.current);
    if (settings.notify && typeof Notification !== "undefined" && Notification.permission === "granted" && document.hidden) {
      const focusDone = event.finished === "focus";
      new Notification(focusDone ? "專注完成！" : "休息結束", {
        body: focusDone
          ? `休息 ${event.next === "long" ? settings.long : settings.short} 分鐘吧`
          : `回來專注 ${settings.focus} 分鐘`,
      });
    }
    // 只在「新的結束事件」出現時執行，設定值是當下的最新值即可
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  // 分頁標題顯示倒數，切到別的分頁也看得到
  useEffect(() => {
    document.title = running
      ? `${timeStr} ${PHASE_LABEL[phase]} | Randy的小工具箱`
      : "番茄鐘 | Randy的小工具箱";
  }, [running, timeStr, phase]);

  // 空白鍵：開始／暫停（焦點在輸入框、按鈕上時不攔截）
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const el = e.target as HTMLElement | null;
      if (el && /^(INPUT|TEXTAREA|SELECT|BUTTON|SUMMARY)$/.test(el.tagName)) return;
      e.preventDefault();
      unlockAudio();
      dispatch({ type: "toggle", now: Date.now() });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleNotify = async (on: boolean) => {
    if (!on) {
      set({ notify: false });
      setNotifyHint(null);
      return;
    }
    if (typeof Notification === "undefined") {
      setNotifyHint("這個瀏覽器不支援桌面通知。");
      return;
    }
    let perm = Notification.permission;
    if (perm === "default") perm = await Notification.requestPermission();
    if (perm === "granted") {
      set({ notify: true });
      setNotifyHint(null);
    } else {
      setNotifyHint("瀏覽器沒有允許通知，請在網址列旁的網站設定裡開啟。");
    }
  };

  const filled = phase === "long" ? settings.every : completed % settings.every;
  const status = running ? `${PHASE_LABEL[phase]}中` : started ? "已暫停" : "準備開始";
  const mainLabel = running ? "暫停" : started ? "繼續" : phase === "focus" ? "開始專注" : "開始休息";

  const announce = event
    ? event.finished === "focus"
      ? `專注結束，已完成 ${event.completed} 個專注，接著是${PHASE_LABEL[event.next]}`
      : "休息結束，回到專注"
    : "";

  const ghost =
    "rounded-full border border-white/25 px-5 py-2 text-sm transition-colors hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div
      className="flex-1 text-[#f6efe9] transition-colors duration-700"
      style={{ backgroundColor: theme.bg }}
    >
      <div className="mx-auto w-full max-w-md px-4 pb-20 pt-8 sm:pt-12">
        <Link href="/" className="text-sm text-white/55 transition-colors hover:text-white">
          ← 回到小工具箱
        </Link>

        <h1 className="mt-6 text-center text-sm font-bold tracking-[0.4em] text-white/70">POMODORO</h1>

        {/* 階段切換 */}
        <div
          role="group"
          aria-label="切換階段"
          className="mx-auto mt-5 flex w-full max-w-xs rounded-full bg-black/25 p-1"
        >
          {(["focus", "short", "long"] as Phase[]).map((p) => (
            <button
              key={p}
              type="button"
              disabled={running}
              aria-pressed={phase === p}
              title={running ? "計時中無法切換，請先暫停" : undefined}
              onClick={() => dispatch({ type: "select", phase: p })}
              className="flex-1 rounded-full py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed"
              style={
                phase === p
                  ? { backgroundColor: theme.accent, color: theme.bg }
                  : { color: "rgba(246,239,233,0.7)", opacity: running ? 0.5 : 1 }
              }
            >
              {PHASE_LABEL[p]}
            </button>
          ))}
        </div>

        {/* 倒數圓環 */}
        <div className="relative mx-auto mt-8 w-full max-w-[20rem]">
          <svg viewBox="0 0 240 240" aria-hidden className="block w-full">
            <circle cx="120" cy="120" r={R} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
            <circle
              cx="120"
              cy="120"
              r={R}
              fill="none"
              stroke={theme.accent}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRC.toFixed(2)}
              strokeDashoffset={(CIRC * (1 - (total > 0 ? left / total : 0))).toFixed(2)}
              transform="rotate(-90 120 120)"
              style={{ transition: "stroke-dashoffset 0.3s linear, stroke 0.7s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p
              role="timer"
              aria-label={`剩餘 ${timeStr}`}
              className="text-[4.25rem] font-black leading-none tabular-nums sm:text-[5rem]"
            >
              {timeStr}
            </p>
            <p className="mt-3 text-sm tracking-widest" style={{ color: theme.accent }}>
              {status}
            </p>
          </div>
        </div>

        {/* 這個番茄要做什麼 */}
        <div className="mx-auto mt-6 max-w-xs">
          <label className="sr-only" htmlFor="task">
            這個番茄要專注做什麼
          </label>
          <input
            id="task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            maxLength={60}
            placeholder="這個番茄要專注做什麼？（選填）"
            className="w-full border-0 border-b border-white/25 bg-transparent py-2 text-center text-sm text-white outline-none transition-colors placeholder:text-white/35 focus:border-white/70"
          />
        </div>

        {/* 控制 */}
        <div className="mt-8 flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={running ? toggle : start}
            className="w-full max-w-xs rounded-full py-4 text-lg font-black transition active:scale-[0.98]"
            style={{ backgroundColor: theme.accent, color: theme.bg }}
          >
            {mainLabel}
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={!started}
              onClick={() => dispatch({ type: "reset" })}
              className={ghost}
            >
              重設
            </button>
            <button
              type="button"
              onClick={() => dispatch({ type: "skip", now: Date.now() })}
              className={ghost}
            >
              跳過
            </button>
          </div>
          <p className="text-xs text-white/40">按空白鍵也可以開始或暫停</p>
        </div>

        {/* 進度 */}
        <div className="mt-10 rounded-3xl p-5 transition-colors duration-700" style={{ backgroundColor: theme.soft }}>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/80">
              本次已完成 <span className="text-lg font-black text-white">{completed}</span> 個專注
            </p>
            {completed > 0 && (
              <button
                type="button"
                onClick={() => dispatch({ type: "clearCompleted" })}
                className="text-xs text-white/45 underline underline-offset-4 hover:text-white"
              >
                歸零
              </button>
            )}
          </div>
          <div className="mt-4 flex items-center gap-2.5" aria-label={`距離長休息還有 ${settings.every - filled} 個專注`}>
            {Array.from({ length: settings.every }, (_, i) => (
              <span
                key={i}
                className="h-3 flex-1 rounded-full transition-colors duration-500"
                style={{ backgroundColor: i < filled ? theme.accent : "rgba(255,255,255,0.14)" }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-white/45">
            每完成 {settings.every} 個專注，就有一次 {settings.long} 分鐘的長休息
          </p>
        </div>

        {/* 設定 */}
        <details className="group mt-4 rounded-3xl border border-white/12 p-5">
          <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium">
            設定
            <span aria-hidden className="text-white/50 transition-transform group-open:rotate-180">
              ▾
            </span>
          </summary>
          <div className="mt-3 divide-y divide-white/10">
            <Stepper label="專注" unit="分鐘" value={settings.focus} min={LIMITS.focus[0]} max={LIMITS.focus[1]} onChange={(v) => set({ focus: v })} />
            <Stepper label="短休息" unit="分鐘" value={settings.short} min={LIMITS.short[0]} max={LIMITS.short[1]} onChange={(v) => set({ short: v })} />
            <Stepper label="長休息" unit="分鐘" value={settings.long} min={LIMITS.long[0]} max={LIMITS.long[1]} onChange={(v) => set({ long: v })} />
            <Stepper label="幾個專注後長休息" unit="個" value={settings.every} min={LIMITS.every[0]} max={LIMITS.every[1]} onChange={(v) => set({ every: v })} />
            <Switch
              label="自動開始下一階段"
              hint="專注與休息會自己接著跑"
              checked={settings.autoStart}
              onChange={(v) => set({ autoStart: v })}
            />
            <div>
              <Switch label="結束時播放提示音" checked={settings.sound} onChange={(v) => set({ sound: v })} />
              <button
                type="button"
                onClick={() => {
                  unlockAudio();
                  if (audio.current) chime(audio.current);
                }}
                className="mb-2 text-xs text-white/55 underline underline-offset-4 hover:text-white"
              >
                試聽提示音
              </button>
            </div>
            <div>
              <Switch
                label="桌面通知"
                hint="切到別的分頁時，時間到會跳出通知"
                checked={settings.notify}
                onChange={toggleNotify}
              />
              {notifyHint && <p className="pb-2 text-xs leading-5 text-[#ffb59f]">{notifyHint}</p>}
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-white/40">
            計時中改時間，這一輪不受影響，下一個階段才會套用。設定與紀錄不會儲存，重新整理就會恢復預設。
          </p>
        </details>

        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>
    </div>
  );
}
