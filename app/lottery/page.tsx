import type { Metadata } from "next";
import Link from "next/link";
import LotteryWheel from "@/components/LotteryWheel";

export const metadata: Metadata = {
  title: "幸運大轉盤",
  description: "輸入名單，轉動轉盤，抽出幸運的人。",
};

export default function LotteryPage() {
  return (
    <div className="flex-1 overflow-hidden bg-[radial-gradient(ellipse_at_50%_22%,#2467d8_0%,#12418f_42%,#071c4a_100%)] text-white">
      <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-8 sm:px-6 sm:pt-12">
        <Link href="/" className="text-sm text-sky-100/65 transition-colors hover:text-white">
          ← 回到小工具箱
        </Link>
        <LotteryWheel />
      </div>
    </div>
  );
}
