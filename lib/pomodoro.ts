export type Phase = "focus" | "short" | "long";

export type Settings = {
  /** 各階段長度（分鐘） */
  focus: number;
  short: number;
  long: number;
  /** 每完成幾個專注，下一次休息是長休息 */
  every: number;
  /** 一個階段結束後，自動開始下一個 */
  autoStart: boolean;
  sound: boolean;
  notify: boolean;
};

export const DEFAULTS: Settings = {
  focus: 25,
  short: 5,
  long: 15,
  every: 4,
  autoStart: false,
  sound: true,
  notify: false,
};

/** 設定值的合法範圍 */
export const LIMITS = {
  focus: [1, 120],
  short: [1, 60],
  long: [1, 90],
  every: [2, 8],
} as const;

export const PHASE_LABEL: Record<Phase, string> = { focus: "專注", short: "短休息", long: "長休息" };

export const durationMs = (p: Phase, s: Settings) => (p === "focus" ? s.focus : p === "short" ? s.short : s.long) * 60_000;

/** 剩餘毫秒 → "mm:ss"（無條件進位到秒，所以 0.4 秒時還是顯示 00:01，歸零才顯示 00:00） */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

const clampInt = (v: number, [lo, hi]: readonly [number, number]) => Math.min(hi, Math.max(lo, Math.round(v)));

export type FinishEvent = { id: number; finished: Phase; next: Phase; completed: number };

export type State = {
  settings: Settings;
  phase: Phase;
  running: boolean;
  /** 執行中：這個階段結束的時間點（毫秒時間戳） */
  endAt: number;
  /** 沒在執行時：還剩多少毫秒 */
  remaining: number;
  /** 本次完成的專注數 */
  completed: number;
  now: number;
  /** 最近一次「階段自然結束」；畫面用 id 判斷要不要播提示音、發通知 */
  event: FinishEvent | null;
};

export type Action =
  | { type: "tick"; now: number }
  | { type: "start"; now: number }
  | { type: "pause"; now: number }
  | { type: "toggle"; now: number }
  | { type: "reset" }
  | { type: "skip"; now: number }
  | { type: "select"; phase: Phase }
  | { type: "settings"; patch: Partial<Settings> }
  | { type: "clearCompleted" };

export function initState(settings: Settings = DEFAULTS): State {
  return {
    settings,
    phase: "focus",
    running: false,
    endAt: 0,
    remaining: durationMs("focus", settings),
    completed: 0,
    now: 0,
    event: null,
  };
}

function finish(s: State, now: number): State {
  const finished = s.phase;
  const completed = finished === "focus" ? s.completed + 1 : s.completed;
  const next: Phase = finished === "focus" ? (completed % s.settings.every === 0 ? "long" : "short") : "focus";
  const dur = durationMs(next, s.settings);
  const running = s.settings.autoStart;
  return {
    ...s,
    phase: next,
    completed,
    running,
    // 用「現在」當新階段的起點：就算分頁睡了很久才醒來，也只會前進一個階段，不會連環跳
    endAt: running ? now + dur : 0,
    remaining: dur,
    now,
    event: { id: (s.event?.id ?? 0) + 1, finished, next, completed },
  };
}

export function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "tick":
      if (!s.running) return s;
      return a.now >= s.endAt ? finish(s, a.now) : { ...s, now: a.now };

    case "start":
      if (s.running || s.remaining <= 0) return s;
      return { ...s, running: true, endAt: a.now + s.remaining, now: a.now };

    case "pause":
      if (!s.running) return s;
      return { ...s, running: false, remaining: Math.max(0, s.endAt - a.now), now: a.now };

    case "toggle":
      return reducer(s, { type: s.running ? "pause" : "start", now: a.now });

    case "reset":
      return { ...s, running: false, endAt: 0, remaining: durationMs(s.phase, s.settings) };

    case "skip": {
      // 跳過不算完成：專注 → 短休息；休息 → 專注。計時中就維持計時中
      const next: Phase = s.phase === "focus" ? "short" : "focus";
      const dur = durationMs(next, s.settings);
      return { ...s, phase: next, remaining: dur, endAt: s.running ? a.now + dur : 0, now: a.now };
    }

    case "select":
      return { ...s, phase: a.phase, running: false, endAt: 0, remaining: durationMs(a.phase, s.settings) };

    case "settings": {
      const p = a.patch;
      const settings: Settings = {
        ...s.settings,
        ...p,
        focus: p.focus !== undefined ? clampInt(p.focus, LIMITS.focus) : s.settings.focus,
        short: p.short !== undefined ? clampInt(p.short, LIMITS.short) : s.settings.short,
        long: p.long !== undefined ? clampInt(p.long, LIMITS.long) : s.settings.long,
        every: p.every !== undefined ? clampInt(p.every, LIMITS.every) : s.settings.every,
      };
      // 沒在計時：目前階段的剩餘時間直接換成新長度；計時中：這一輪照舊，新長度從下一個階段開始
      return s.running ? { ...s, settings } : { ...s, settings, remaining: durationMs(s.phase, settings) };
    }

    case "clearCompleted":
      return { ...s, completed: 0 };
  }
}

/** 目前剩餘毫秒（執行中用時間點算，暫停中用存下來的值） */
export const timeLeft = (s: State) => (s.running ? Math.max(0, s.endAt - s.now) : s.remaining);
