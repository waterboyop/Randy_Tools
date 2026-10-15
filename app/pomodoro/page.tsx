import type { Metadata } from "next";
import Pomodoro from "@/components/Pomodoro";

export const metadata: Metadata = {
  title: "番茄鐘",
  description: "專注 25 分鐘、休息 5 分鐘，幫你把注意力放在一件事上。",
};

export default function PomodoroPage() {
  return <Pomodoro />;
}
