import type { Metadata } from "next";
import Link from "next/link";
import FortuneDraw from "@/components/FortuneDraw";

export const metadata: Metadata = {
  title: "好運抽籤",
  description: "搖一搖籤筒，抽一支籤，看看今天的運勢是大吉還是大凶。",
};

export default function FortunePage() {
  return (
    <div className="flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_50%_12%,#5e1912_0%,#2b0d09_48%,#120504_100%)] text-[#f8ecd0]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Link href="/" className="text-sm text-[#f1dfb6]/60 transition-colors hover:text-white">
          ← 回到小工具箱
        </Link>
        <header className="mb-12 mt-6 text-center sm:mb-16">
          <p className="text-xs tracking-[0.5em] text-[#e6b84a]">FORTUNE</p>
          <h1 className="mt-3 bg-gradient-to-b from-[#fff1b8] to-[#e0a82e] bg-clip-text text-5xl font-black tracking-widest text-transparent [filter:drop-shadow(0_3px_0_#7a1a0f)_drop-shadow(0_10px_14px_rgba(0,0,0,0.5))] sm:text-6xl">
            好運抽籤
          </h1>
          <p className="mx-auto mt-5 max-w-md text-sm leading-7 text-[#f1dfb6]/70">
            搖一搖籤筒，抽一支籤，看看今天的運勢。
          </p>
        </header>
        <FortuneDraw />
      </div>
    </div>
  );
}
