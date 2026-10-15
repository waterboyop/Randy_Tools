import { polar, slicePath } from "@/lib/lottery";

/**
 * 三個工具的迷你插圖（純 SVG，不含互動）。
 * 沒有用漸層 id，所以同一頁放好幾份也不會互相衝突。
 */

type Props = { className?: string };

/** 幸運大轉盤：藍色轉盤、白色小圓點、水滴指針 */
export function MiniWheel({ className }: Props) {
  const n = 8;
  return (
    <svg viewBox="-110 -110 220 220" aria-hidden className={className}>
      <circle r="107" fill="#0b2e78" />
      <circle r="106.4" fill="none" stroke="#6ea2f5" strokeOpacity="0.6" />
      {Array.from({ length: 16 }, (_, i) => {
        const [x, y] = polar(i * 22.5 + 11.25, 99);
        return <circle key={i} cx={x} cy={y} r="2.4" fill="#fff" />;
      })}
      <circle r="91" fill="#0c2f77" />
      <g transform="rotate(14)">
        {Array.from({ length: n }, (_, i) => (
          <path
            key={i}
            d={slicePath(i, n, 88)}
            fill={i % 2 ? "#e7f0fd" : "#8fb6ee"}
            stroke="#fff"
            strokeOpacity="0.85"
            strokeWidth="1"
          />
        ))}
        {/* 轉盤上的「名字」：用小橫條表示 */}
        {Array.from({ length: n }, (_, i) => {
          const [x, y] = polar((i + 0.5) * (360 / n), 62);
          return (
            <rect
              key={i}
              x={x - 12}
              y={y - 2.2}
              width="24"
              height="4.4"
              rx="2.2"
              fill="#0b2a63"
              opacity="0.7"
              transform={`rotate(${(i + 0.5) * (360 / n) - 90} ${x} ${y})`}
            />
          );
        })}
      </g>
      <circle r="27" fill="#fff" opacity="0.3" />
      <circle r="23" fill="#2f6fe0" stroke="#fff" strokeWidth="3" />
      <path
        d="M0 -40 C2.2 -36.2 6.5 -33.2 6.5 -29 A6.5 6.5 0 0 1 -6.5 -29 C-6.5 -33.2 -2.2 -36.2 0 -40 Z"
        fill="#fff"
        stroke="#1f5bd4"
        strokeWidth="1.3"
      />
      <circle cx="0" cy="-28.6" r="2.9" fill="#2f6fe0" />
    </svg>
  );
}

/** 番茄鐘：深色圓盤上的倒數圓環 */
export function MiniTimer({ className }: Props) {
  const C = 2 * Math.PI * 80;
  const progress = 0.68;
  return (
    <svg viewBox="0 0 220 220" aria-hidden className={className}>
      <circle cx="110" cy="110" r="108" fill="#2b1410" />
      <circle cx="110" cy="110" r="80" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="11" />
      <circle
        cx="110"
        cy="110"
        r="80"
        fill="none"
        stroke="#ff6b4a"
        strokeWidth="11"
        strokeLinecap="round"
        strokeDasharray={C.toFixed(2)}
        strokeDashoffset={(C * (1 - progress)).toFixed(2)}
        transform="rotate(-90 110 110)"
      />
      <text x="110" y="122" textAnchor="middle" fontSize="42" fontWeight="900" fill="#f6efe9">
        25:00
      </text>
      <text x="110" y="148" textAnchor="middle" fontSize="12" letterSpacing="3" fill="#ff6b4a">
        專注中
      </text>
    </svg>
  );
}

/** 好運抽籤：籤筒加一張籤紙 */
export function MiniFortune({ className }: Props) {
  const sticks = [
    { x: 52, top: 52 },
    { x: 62, top: 38 },
    { x: 72, top: 58 },
    { x: 82, top: 42 },
    { x: 92, top: 30 },
    { x: 102, top: 48 },
    { x: 112, top: 36 },
  ];
  return (
    <svg viewBox="0 0 220 250" aria-hidden className={className}>
      <ellipse cx="86" cy="238" rx="56" ry="7" fill="rgba(0,0,0,0.3)" />
      {sticks.map((s) => (
        <g key={s.x}>
          <rect x={s.x - 3.5} y={s.top} width="7" height="150" rx="1.5" fill="#ecd29a" stroke="#8a6a2e" strokeWidth="0.6" />
          <rect x={s.x - 3.5} y={s.top} width="7" height="9" rx="1.5" fill="#b3261e" />
        </g>
      ))}
      <path d="M36 104 Q82 120 128 104 L128 222 Q82 240 36 222 Z" fill="#a8231a" />
      <path d="M50 114 L50 224" stroke="rgba(255,255,255,0.14)" strokeWidth="8" strokeLinecap="round" />
      <path d="M36 104 Q82 120 128 104" fill="none" stroke="#e6b84a" strokeWidth="4" />
      <path d="M36 126 Q82 142 128 126" fill="none" stroke="#e6b84a" strokeWidth="3" />
      <path d="M36 208 Q82 226 128 208" fill="none" stroke="#e6b84a" strokeWidth="3" />
      <text x="82" y="184" textAnchor="middle" fontSize="42" fontWeight="900" fill="#f2c95a" fontFamily="serif">
        籤
      </text>
      {/* 抽出來的籤紙 */}
      <g transform="rotate(9 168 118)">
        <rect x="140" y="48" width="58" height="140" rx="5" fill="#f6ecd2" stroke="#c79a3a" strokeWidth="3" />
        <text x="169" y="102" textAnchor="middle" fontSize="34" fontWeight="900" fill="#c8201a">
          大
        </text>
        <text x="169" y="140" textAnchor="middle" fontSize="34" fontWeight="900" fill="#c8201a">
          吉
        </text>
        <rect x="150" y="156" width="38" height="2.6" rx="1.3" fill="#c79a3a" opacity="0.6" />
        <rect x="156" y="164" width="26" height="2.6" rx="1.3" fill="#c79a3a" opacity="0.45" />
      </g>
    </svg>
  );
}
