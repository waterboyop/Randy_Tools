import { randomInt } from "@/lib/lottery";

export type Grade = {
  /** 運勢名稱 */
  name: string;
  /** 抽中的權重（整數，全部加起來是 100，等於百分比） */
  weight: number;
  /** 籤紙上的主色 */
  color: string;
  /** 一句總結 */
  summary: string;
  /** 籤詩：每首 4 句、每句 7 字，抽中時隨機挑一首 */
  poems: [string[], string[]];
  advice: { 事業: string; 財運: string; 感情: string; 健康: string };
  /** 宜 */
  good: string[];
  /** 忌 */
  avoid: string[];
  /** 給今天的一句話 */
  tip: string;
};

/** 由好到壞排列。想調整出現機率，改各自的 weight 就好（總和要維持 100）。 */
export const GRADES: Grade[] = [
  {
    name: "大吉",
    weight: 10,
    color: "#c8201a",
    summary: "萬事順遂，想做的事放手去做。",
    poems: [
      ["春風得意馬蹄輕", "貴人相助路自明", "心中所願皆可成", "把握今朝莫遲疑"],
      ["雲開月朗映前程", "一步一階皆順行", "昔日耕耘今有穫", "滿懷喜氣迎好運"],
    ],
    advice: {
      事業: "有機會就主動爭取，提案、面試都容易被看見。",
      財運: "正財穩、偏財也有驚喜，但仍要量力而為。",
      感情: "真誠表達就有好回應，單身的人留意身邊的人。",
      健康: "精神飽滿，適合開始新的運動或作息。",
    },
    good: ["開始新計畫", "主動聯絡想見的人", "出遠門"],
    avoid: ["得意忘形", "隨口承諾"],
    tip: "運氣很好的時候，更要謙虛，福氣才留得久。",
  },
  {
    name: "中吉",
    weight: 22,
    color: "#d9531e",
    summary: "穩中有進，努力會看到成果。",
    poems: [
      ["溪水潺潺向東流", "日日精進不須憂", "小有收穫當珍惜", "再接再厲自成就"],
      ["雲淡風輕好行舟", "耐心經營有回收", "莫羨他人先到岸", "腳踏實地勝一籌"],
    ],
    advice: {
      事業: "按部就班推進，手上的事會有明確進展。",
      財運: "收入穩定，適合整理收支、做長期規劃。",
      感情: "平淡中有溫暖，多一句關心就很加分。",
      健康: "狀態不錯，維持規律作息就好。",
    },
    good: ["完成拖延的事", "整理環境", "學習新技能"],
    avoid: ["急著求快", "與人比較"],
    tip: "今天適合把基本功做紮實。",
  },
  {
    name: "小吉",
    weight: 20,
    color: "#d98a16",
    summary: "小小的好事正在靠近，保持開放的心。",
    poems: [
      ["晨露初晞草木新", "小小喜事漸近身", "不必貪多求太快", "知足常樂福自臻"],
      ["微光乍現霧漸開", "一點好運悄悄來", "心平氣和多留意", "細節之中藏轉機"],
    ],
    advice: {
      事業: "留意小細節，一個小改善就能讓效率提升。",
      財運: "有小額的進帳或折扣，不必刻意追逐大利。",
      感情: "一個小小的問候，可能帶來意外的溫暖。",
      健康: "稍微活動筋骨，能讓心情輕鬆許多。",
    },
    good: ["小額嘗試", "向人道謝", "散步"],
    avoid: ["貪心", "一次做太多事"],
    tip: "把注意力放在眼前的小確幸。",
  },
  {
    name: "吉",
    weight: 18,
    color: "#a8801c",
    summary: "平順安穩，照著自己的步調走就好。",
    poems: [
      ["平湖秋月靜無波", "守住本分不蹉跎", "按著節奏慢慢走", "一日有一日收穫"],
      ["燈下讀書夜未央", "日常安穩即吉祥", "不求驚天動地事", "平凡之中見安康"],
    ],
    advice: {
      事業: "維持現有節奏，把份內的事做好就是加分。",
      財運: "沒有大起大落，保守理財最合適。",
      感情: "相處自然舒服，不需要特別經營。",
      健康: "作息穩定，記得多喝水、早點休息。",
    },
    good: ["按表操課", "陪伴家人", "早睡"],
    avoid: ["冒險", "臨時改變計畫"],
    tip: "平凡的一天，也是一種福氣。",
  },
  {
    name: "末吉",
    weight: 12,
    color: "#4f7f4a",
    summary: "起步稍慢，但後勁會慢慢出現。",
    poems: [
      ["晚霞映照遲來光", "好事多磨莫心慌", "先苦後甘終有日", "堅持到底自然香"],
      ["霜後梅花更清香", "晚來之福亦吉祥", "眼前縱有小阻礙", "熬過寒冬見春光"],
    ],
    advice: {
      事業: "進度可能稍有延遲，多一點耐心就能追上。",
      財運: "先別急著投入，多觀察再決定。",
      感情: "溝通需要多一些時間，別急著下結論。",
      健康: "容易累，記得給自己留一點休息的空檔。",
    },
    good: ["耐心等待", "檢查細節", "把事情分段完成"],
    avoid: ["急躁", "半途放棄"],
    tip: "好事需要時間，晚一點到的福氣，往往更踏實。",
  },
  {
    name: "凶",
    weight: 12,
    color: "#54657d",
    summary: "今天多留心，放慢腳步，能避開小麻煩。",
    poems: [
      ["烏雲壓頂風初起", "行路須防石階滑", "謹言慎行多思量", "退一步海闊天空"],
      ["舟行逆水力須強", "穩住舵來莫慌張", "小心謹慎防疏漏", "待到風停見艷陽"],
    ],
    advice: {
      事業: "重要文件多檢查一遍，避免粗心犯錯。",
      財運: "不宜衝動消費或借貸，守住荷包。",
      感情: "說話放軟、少爭辯，誤會很快能化解。",
      健康: "注意休息與飲食，出門留意安全。",
    },
    good: ["多檢查", "靜心", "提早出門"],
    avoid: ["衝動決定", "與人爭執", "熬夜"],
    tip: "凶不代表壞事一定發生，而是提醒你今天多一分小心。",
  },
  {
    name: "大凶",
    weight: 6,
    color: "#3a3f4d",
    summary: "今天諸事宜保守，把心靜下來，平安就是福。",
    poems: [
      ["寒雲蔽日暗無光", "行事須防多阻攔", "靜守本心不妄動", "風雨過後見天藍"],
      ["霧鎖長橋路難辨", "此時不宜遠行遊", "收斂鋒芒多自省", "轉機只待明日來"],
    ],
    advice: {
      事業: "重大決定先延後，今天以整理、複查為主。",
      財運: "避免投資與大額支出，錢包放穩一點。",
      感情: "情緒容易被放大，先冷靜再說話。",
      健康: "早點休息，行車與走路都要多留意。",
    },
    good: ["休息", "整理", "向信任的人傾訴"],
    avoid: ["做重大決定", "賭運氣", "衝動發言"],
    tip: "運氣只是一時的，抽到大凶就當作一次提醒，今天低調一點，明天會更好。",
  },
];

export const LUCKY_COLORS = ["紅色", "橘色", "黃色", "綠色", "藍色", "紫色", "白色", "金色"] as const;
export const LUCKY_DIRECTIONS = ["東", "南", "西", "北", "東南", "西南", "東北", "西北"] as const;

export type Draw = {
  /** 第幾籤（1~100） */
  no: number;
  grade: Grade;
  /** 抽到哪一首籤詩（0 或 1） */
  poemIndex: 0 | 1;
  luckyColor: string;
  luckyNumber: number;
  luckyDirection: string;
};

const TOTAL_WEIGHT = GRADES.reduce((s, g) => s + g.weight, 0);

/**
 * 依權重抽一個運勢等級。
 * rand(n) 要回傳 [0, n) 的整數；預設用 crypto 的公平隨機（沒有取餘數偏差）。
 */
export function pickGrade(rand: (n: number) => number = randomInt): Grade {
  let roll = rand(TOTAL_WEIGHT);
  for (const g of GRADES) {
    if (roll < g.weight) return g;
    roll -= g.weight;
  }
  return GRADES[GRADES.length - 1]; // 理論上到不了，保險用
}

/** 抽一支完整的籤 */
export function drawFortune(rand: (n: number) => number = randomInt): Draw {
  return {
    no: rand(100) + 1,
    grade: pickGrade(rand),
    poemIndex: rand(2) as 0 | 1,
    luckyColor: LUCKY_COLORS[rand(LUCKY_COLORS.length)],
    luckyNumber: rand(99) + 1,
    luckyDirection: LUCKY_DIRECTIONS[rand(LUCKY_DIRECTIONS.length)],
  };
}

/** 整理成可以貼給朋友的文字 */
export function toShareText(d: Draw): string {
  const poem = d.grade.poems[d.poemIndex];
  return [
    `今日運勢：${d.grade.name}（第 ${d.no} 籤）`,
    d.grade.summary,
    "",
    ...poem,
    "",
    ...(Object.entries(d.grade.advice) as [string, string][]).map(([k, v]) => `${k}：${v}`),
    "",
    `宜：${d.grade.good.join("、")}`,
    `忌：${d.grade.avoid.join("、")}`,
    `幸運色 ${d.luckyColor}｜幸運數字 ${d.luckyNumber}｜幸運方位 ${d.luckyDirection}`,
    "（僅供娛樂參考）",
  ].join("\n");
}
