/** 名單上限：超過 100 格，轉盤就太擠了 */
export const MAX_NAMES = 100;
/** 單一名字長度上限 */
export const MAX_NAME_LEN = 30;

/** 把輸入的文字拆成名單：換行、逗號、頓號、分號都能分隔；去掉空白與空項目 */
export function parseNames(text: string): string[] {
  return text
    .split(/[\n\r,，、;；]+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.slice(0, MAX_NAME_LEN));
}

/**
 * 公平的隨機整數 [0, max)。
 * 用 crypto.getRandomValues，並用「拒絕取樣」避免取餘數造成的偏差
 * （2^32 不是 max 的整數倍時，直接取餘數會讓前面的數字機率略高）。
 */
export function randomInt(max: number): number {
  if (!Number.isInteger(max) || max < 1) throw new RangeError("max 必須是 >= 1 的整數");
  const range = 2 ** 32;
  const limit = range - (range % max);
  const buf = new Uint32Array(1);
  let x: number;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

/** 轉盤每一格的顏色：用黃金角度分散色相，相鄰的格子顏色差很多，格數再多也不太會撞色 */
export function sliceColor(i: number): string {
  return `hsl(${Math.round((i * 137.508 + 20) % 360)} 68% 80%)`;
}

/**
 * 轉盤每一格的顏色代號：兩種顏色（0、1）交錯，相鄰的格子一定不同。
 * 格數是奇數時，最後一格會剛好和第一格同色，所以最後一格改用第三種顏色（2）。
 */
export function sliceTone(i: number, count: number): 0 | 1 | 2 {
  if (count > 2 && count % 2 === 1 && i === count - 1) return 2;
  return (i % 2) as 0 | 1;
}

/** 可重現的偽隨機 [0,1)：只用在裝飾（彩帶、星點），不能拿來抽獎。伺服器與瀏覽器算出來一樣，不會造成水合差異 */
export function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** 估算文字寬度：全形字約一個字級寬，半形約 0.58 個字級 */
function textWidth(s: string, fontSize: number): number {
  let w = 0;
  for (const ch of s) w += (ch.codePointAt(0) ?? 0) > 0x2e80 ? fontSize : fontSize * 0.58;
  return w;
}

/** 轉盤上的文字太長就截斷成「…」 */
export function fitLabel(name: string, maxWidth: number, fontSize: number): string {
  if (textWidth(name, fontSize) <= maxWidth) return name;
  let out = "";
  for (const ch of name) {
    if (textWidth(out + ch + "…", fontSize) > maxWidth) break;
    out += ch;
  }
  return out + "…";
}

/**
 * 先把字縮小到放得下（最小縮到 minScale 倍），縮到底還放不下才用「…」截斷。
 * 回傳要顯示的文字與實際字級（四捨五入到 2 位，避免伺服器與瀏覽器的浮點數差異）。
 */
export function fitLabelScaled(
  name: string,
  maxWidth: number,
  baseSize: number,
  minScale = 0.62,
): { text: string; size: number } {
  const w = textWidth(name, baseSize);
  if (w <= maxWidth) return { text: name, size: baseSize };
  const size = Math.round(Math.max(baseSize * minScale, (baseSize * maxWidth) / w) * 100) / 100;
  return { text: fitLabel(name, maxWidth, size), size };
}

/** 依格數決定文字大小；格數太多（> 40）就不畫文字，改看結果卡片 */
export function labelFontSize(count: number): number | null {
  if (count <= 8) return 12;
  if (count <= 16) return 10.5;
  if (count <= 28) return 8.5;
  if (count <= 40) return 6.5;
  return null;
}

export const mod = (n: number, m: number) => ((n % m) + m) % m;

/** 四捨五入到小數 3 位（也順便把 -0 變成 0） */
const round3 = (v: number) => Math.round(v * 1000) / 1000 + 0;

/**
 * 以正上方為 0°、順時針為正，回傳圓上的座標。
 * 一定要四捨五入：Math.sin / Math.cos 在 Node（伺服器）和瀏覽器算出來，最後一兩位可能不同，
 * 直接放進 SVG 會造成伺服器 HTML 和瀏覽器不一致（hydration 錯誤）。
 */
export function polar(deg: number, r: number): [number, number] {
  const rad = (deg * Math.PI) / 180;
  return [round3(r * Math.sin(rad)), round3(-r * Math.cos(rad))];
}

/** 第 i 格的扇形路徑（count 格均分一圈）；只有一格時畫整個圓 */
export function slicePath(i: number, count: number, r: number): string {
  if (count === 1) return `M0 ${-r} A${r} ${r} 0 1 1 0 ${r} A${r} ${r} 0 1 1 0 ${-r} Z`;
  const step = 360 / count;
  const [x0, y0] = polar(i * step, r);
  const [x1, y1] = polar((i + 1) * step, r);
  return `M0 0 L${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${step > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)} Z`;
}

/**
 * 要讓第 index 格停在正上方的指針下，輪盤「總旋轉角度」要是多少。
 * current 是目前的總旋轉角度；回傳值一定比 current 大（至少多轉 turns 圈），
 * jitter（-0.5~0.5）讓停的位置在格子內有些偏移，不會每次都停正中央。
 */
export function targetRotation(
  current: number,
  index: number,
  count: number,
  turns: number,
  jitter = 0,
): number {
  const step = 360 / count;
  const center = index * step + step / 2 + jitter * step * 0.7;
  const target = mod(-center, 360);
  const delta = mod(target - mod(current, 360), 360);
  return current + turns * 360 + delta;
}

/** 反過來算：輪盤旋轉到 rotation 時，正上方指針指到第幾格（用來驗證） */
export function sliceUnderPointer(rotation: number, count: number): number {
  const step = 360 / count;
  return Math.floor(mod(-rotation, 360) / step) % count;
}
