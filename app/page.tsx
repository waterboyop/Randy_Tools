import Link from "next/link";
import { MiniFortune, MiniTimer, MiniWheel } from "@/components/landing/Illustrations";
import SiteFooter from "@/components/landing/SiteFooter";
import SiteHeader from "@/components/landing/SiteHeader";

type Tool = {
  id: string;
  no: string;
  href: string;
  name: string;
  tagline: string;
  points: string[];
  suits: string[];
  /** 區塊背景 */
  bg: string;
  /** 強調色（數字描邊、按鈕） */
  accent: string;
  /** 強調色上的文字色 */
  onAccent: string;
  Art: (p: { className?: string }) => React.ReactElement;
};

const TOOLS: Tool[] = [
  {
    id: "lottery",
    no: "01",
    href: "/lottery",
    name: "幸運大轉盤",
    tagline: "輸入名單，轉動轉盤，抽出幸運的人。",
    points: [
      "名單最多 100 人，名字自動分成轉盤的格子",
      "公平隨機，轉盤慢慢減速，停在抽中的那個人身上",
      "可以設定「抽中的人不再參加」，一次抽好幾個獎項",
    ],
    suits: ["尾牙抽獎", "課堂點名", "決定誰請客"],
    bg: "linear-gradient(135deg, #1f5fd0 0%, #0f3a8e 55%, #071c4a 100%)",
    accent: "#8fb6ee",
    onAccent: "#0b2a63",
    Art: MiniWheel,
  },
  {
    id: "pomodoro",
    no: "02",
    href: "/pomodoro",
    name: "番茄鐘",
    tagline: "專注 25 分鐘，休息 5 分鐘，把注意力放在一件事上。",
    points: [
      "專注、短休息、長休息自動輪替，時間都能自己調",
      "分頁標題會顯示倒數，切到別的視窗也看得到",
      "時間到有提示音，也可以開桌面通知",
    ],
    suits: ["讀書", "寫作", "趕工作進度"],
    bg: "linear-gradient(135deg, #3d1b14 0%, #2b1410 55%, #160a08 100%)",
    accent: "#ff6b4a",
    onAccent: "#2b1410",
    Art: MiniTimer,
  },
  {
    id: "fortune",
    no: "03",
    href: "/fortune",
    name: "好運抽籤",
    tagline: "搖一搖籤筒，抽一支籤，看看今天的運勢。",
    points: [
      "從大吉到大凶共七個等級，附籤詩與四個面向的建議",
      "每次都是公平隨機，想抽幾次都可以",
      "一鍵複製結果，直接分享給朋友",
    ],
    suits: ["每天一支籤", "做決定前的小儀式", "和朋友玩玩看"],
    bg: "radial-gradient(ellipse at 30% 20%, #6a1d14 0%, #2e0e0a 55%, #130504 100%)",
    accent: "#e6b84a",
    onAccent: "#3a0d08",
    Art: MiniFortune,
  },
];

const FEATURES = [
  { title: "不用註冊", text: "打開網頁就能用，不需要帳號與密碼。" },
  { title: "不用安裝", text: "手機、平板、電腦的瀏覽器都能開。" },
  { title: "資料不上傳", text: "名單與設定只留在你的瀏覽器裡。" },
  { title: "公平隨機", text: "抽獎與抽籤都用瀏覽器內建的安全亂數。" },
];

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="top" className="flex-1">
        {/* ---------- Hero ---------- */}
        <section className="relative overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-14 sm:px-6 md:grid-cols-[1.1fr_0.9fr] md:pb-28 md:pt-20">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-1.5 text-xs tracking-[0.25em] text-muted">
                <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-accent" />
                RANDY&apos;S TOOLBOX
              </p>
              <h1 className="mt-7 text-[clamp(2.8rem,8.5vw,6rem)] font-black leading-[1.08] tracking-tight">
                Randy的
                <br />
                <span className="marker">小工具箱</span>
                <span className="text-accent">。</span>
              </h1>
              <p className="mt-8 max-w-md text-base leading-8 text-ink/70">
                抽獎、專注、抽籤。三個隨手就能打開的小工具，在需要的時候剛好派上用場。
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <a
                  href="#tools"
                  className="rounded-full bg-ink px-8 py-3.5 font-medium text-paper transition-colors hover:bg-accent"
                >
                  看看有什麼 ↓
                </a>
                <Link
                  href="/fortune"
                  className="rounded-full border border-ink/25 px-8 py-3.5 font-medium transition-colors hover:border-ink"
                >
                  先抽支籤
                </Link>
              </div>
            </div>

            {/* 三個工具的插圖拼貼 */}
            <div aria-hidden className="relative mx-auto aspect-square w-full max-w-md">
              <div className="absolute inset-[6%] rounded-full bg-accent/10" />
              <div className="float absolute left-0 top-[14%] w-[64%] drop-shadow-[0_18px_28px_rgba(11,42,99,0.35)]" style={{ "--r": "-6deg" } as React.CSSProperties}>
                <MiniWheel className="block w-full" />
              </div>
              <div className="float absolute right-0 top-0 w-[42%] drop-shadow-[0_14px_22px_rgba(43,20,16,0.4)]" style={{ "--r": "8deg", animationDelay: "-2s" } as React.CSSProperties}>
                <MiniTimer className="block w-full" />
              </div>
              <div className="float absolute bottom-0 right-[4%] w-[40%] drop-shadow-[0_14px_22px_rgba(58,13,8,0.4)]" style={{ "--r": "-5deg", animationDelay: "-4s" } as React.CSSProperties}>
                <MiniFortune className="block w-full" />
              </div>
            </div>
          </div>
        </section>

        {/* ---------- 特色 ---------- */}
        <section aria-label="特色" className="border-y border-ink/10">
          <ul className="mx-auto grid max-w-6xl grid-cols-2 divide-ink/10 px-4 sm:px-6 lg:grid-cols-4 lg:divide-x">
            {FEATURES.map((f, i) => (
              <li
                key={f.title}
                className={`py-7 pr-4 lg:px-7 lg:first:pl-0 ${i % 2 === 1 ? "pl-4 lg:pl-7" : ""} ${i < 2 ? "border-b border-ink/10 lg:border-b-0" : ""}`}
              >
                <p className="text-lg font-black">{f.title}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------- 三個工具 ---------- */}
        <div id="tools" className="scroll-mt-20">
          <div className="mx-auto max-w-6xl px-4 pb-12 pt-20 sm:px-6 md:pt-28">
            <p className="text-xs tracking-[0.35em] text-muted">TOOLS</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">三個小工具</h2>
          </div>

          {TOOLS.map((t, i) => (
            <section
              key={t.id}
              id={t.id}
              className="relative overflow-hidden text-white"
              style={{ background: t.bg }}
            >
              {/* 大大的描邊數字 */}
              <span
                aria-hidden
                className="pointer-events-none absolute -top-6 select-none text-[14rem] font-black leading-none sm:text-[20rem]"
                style={{
                  [i % 2 ? "left" : "right"]: "-1rem",
                  color: "transparent",
                  WebkitTextStroke: `2px ${t.accent}`,
                  opacity: 0.18,
                }}
              >
                {t.no}
              </span>

              <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 md:grid-cols-2 lg:py-28">
                <div className={i % 2 ? "md:order-2" : ""}>
                  <div className="mx-auto w-full max-w-sm rounded-[2.5rem] bg-white/[0.06] p-8 ring-1 ring-white/15 backdrop-blur-sm">
                    <t.Art className="float block w-full drop-shadow-[0_20px_30px_rgba(0,0,0,0.45)]" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-bold tracking-[0.3em]" style={{ color: t.accent }}>
                    TOOL {t.no}
                  </p>
                  <h3 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{t.name}</h3>
                  <p className="mt-5 max-w-md text-lg leading-8 text-white/85">{t.tagline}</p>

                  <ul className="mt-8 space-y-4">
                    {t.points.map((p) => (
                      <li key={p} className="flex gap-4 text-sm leading-7 text-white/80">
                        <span
                          aria-hidden
                          className="mt-2.5 h-1.5 w-5 shrink-0 rounded-full"
                          style={{ backgroundColor: t.accent }}
                        />
                        {p}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-xs tracking-[0.25em] text-white/45">適合</span>
                    {t.suits.map((s) => (
                      <span key={s} className="rounded-full border border-white/20 px-3.5 py-1 text-xs text-white/80">
                        {s}
                      </span>
                    ))}
                  </div>

                  <Link
                    href={t.href}
                    className="mt-10 inline-flex items-center gap-3 rounded-full px-8 py-4 text-lg font-black transition hover:brightness-110 active:scale-[0.98]"
                    style={{ backgroundColor: t.accent, color: t.onAccent }}
                  >
                    開始使用
                    <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* ---------- 結尾 ---------- */}
        <section className="mx-auto max-w-6xl px-4 py-24 text-center sm:px-6 md:py-32">
          <h2 className="text-balance text-4xl font-black tracking-tight sm:text-5xl">
            需要的時候，<span className="marker">打開就能用</span>
          </h2>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {TOOLS.map((t) => (
              <Link
                key={t.id}
                href={t.href}
                className="rounded-full border border-ink/20 px-7 py-3 font-medium transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                {t.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
