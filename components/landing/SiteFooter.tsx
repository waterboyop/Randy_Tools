import Link from "next/link";

const TOOLS = [
  { href: "/lottery", label: "幸運大轉盤" },
  { href: "/pomodoro", label: "番茄鐘" },
  { href: "/fortune", label: "好運抽籤" },
];

export default function SiteFooter() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1.2fr]">
          <div>
            <p className="text-2xl font-black tracking-wide">Randy的小工具箱</p>
            <p className="mt-4 max-w-xs text-sm leading-7 text-paper/60">
              三個隨手就能打開的小工具。不用註冊，不用安裝，手機和電腦都能用。
            </p>
          </div>

          <nav aria-label="工具連結">
            <p className="text-xs tracking-[0.3em] text-paper/40">TOOLS</p>
            <ul className="mt-4 space-y-3 text-sm">
              {TOOLS.map((t) => (
                <li key={t.href}>
                  <Link href={t.href} className="text-paper/80 transition-colors hover:text-accent">
                    {t.label} →
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="text-xs tracking-[0.3em] text-paper/40">PRIVACY</p>
            <p className="mt-4 text-sm leading-7 text-paper/60">
              所有工具都在你的瀏覽器裡執行。你輸入的名單、設定與抽到的結果，都不會被上傳或儲存。
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-paper/15 pt-6 text-xs text-paper/45 sm:flex-row sm:items-center">
          <p>© 2026 Randy的小工具箱</p>
          <a href="#top" className="transition-colors hover:text-paper">
            回到頂端 ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
