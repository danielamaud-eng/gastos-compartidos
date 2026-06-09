'use client'

import { Gasto } from '@/app/page'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

// Color palette
const B = '#1A0E06'   // body — very dark brown
const T = '#C07830'   // tan — paws, muzzle, eyebrows

// Body bar geometry (must match head/tail SVG connection points)
const BAR_TOP = 14        // px from top of 60px container
const BAR_H = 22          // body thickness
const HEAD_W = 90         // px
const TAIL_W = 64         // px
const SVG_H = 60          // total height

function DogHead() {
  // Rightmost 12px is a rect that overlaps/connects to the body bar
  return (
    <svg width={HEAD_W} height={SVG_H} viewBox={`0 0 ${HEAD_W} ${SVG_H}`} style={{ display: 'block', flexShrink: 0 }}>
      {/* Ear — large droopy */}
      <ellipse cx="22" cy="24" rx="14" ry="21" fill={B} transform="rotate(8 22 24)" />

      {/* Head — round */}
      <ellipse cx="48" cy="26" rx="29" ry="21" fill={B} />

      {/* Body connection rect to right edge */}
      <rect x="70" y={BAR_TOP} width={HEAD_W - 70} height={BAR_H} fill={B} />

      {/* Belly color under muzzle — tan underside */}
      <ellipse cx="72" cy="38" rx="16" ry="9" fill={T} opacity="0.6" />

      {/* Muzzle */}
      <ellipse cx="72" cy="32" rx="16" ry="13" fill={T} />

      {/* Eyebrow */}
      <path d="M 40 15 Q 48 11 55 15" stroke={T} strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Eye */}
      <circle cx="46" cy="21" r="5.5" fill="white" />
      <circle cx="46.8" cy="21.8" r="3.2" fill="#08030A" />
      <circle cx="45.2" cy="20.4" r="1.1" fill="white" />

      {/* Nose */}
      <ellipse cx="81" cy="29" rx="5" ry="4" fill="#08030A" />

      {/* Mouth line */}
      <path d="M 77 33 Q 81 37 85 33" stroke="#08030A" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Front leg — chunky */}
      <rect x="30" y="40" width="15" height="18" rx="7.5" fill={B} />
      {/* Paw */}
      <ellipse cx="37.5" cy="56" rx="9.5" ry="5" fill={T} />
    </svg>
  )
}

function DogTail() {
  // Leftmost 12px connects to the body bar
  return (
    <svg width={TAIL_W} height={SVG_H} viewBox={`0 0 ${TAIL_W} ${SVG_H}`} style={{ display: 'block', flexShrink: 0 }}>
      {/* Body connection rect from left edge */}
      <rect x="0" y={BAR_TOP} width="16" height={BAR_H} fill={B} />

      {/* Rear body — rounded rump */}
      <ellipse cx="34" cy="26" rx="28" ry="21" fill={B} />

      {/* Tan belly underside */}
      <ellipse cx="30" cy="40" rx="18" ry="9" fill={T} opacity="0.55" />

      {/* Back leg — chunky */}
      <rect x="14" y="40" width="15" height="18" rx="7.5" fill={B} />
      {/* Paw */}
      <ellipse cx="21.5" cy="56" rx="9.5" ry="5" fill={T} />

      {/* Tail — curling upward */}
      <path d="M 56 22 C 64 12 68 5 63 1 C 58 -2 52 4 55 11"
        stroke={B} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M 56 22 C 64 12 68 5 63 1 C 58 -2 52 4 55 11"
        stroke={B} strokeWidth="8" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function GraficoCategoria({ gastos }: { gastos: Gasto[] }) {
  const porCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
    return acc
  }, {} as Record<string, number>)

  const datos = Object.entries(porCategoria).sort(([, a], [, b]) => b - a)

  if (datos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 shadow-sm text-center">
        <div className="text-5xl mb-3">🐾</div>
        <p className="text-gray-400 text-sm">Sin gastos para mostrar</p>
      </div>
    )
  }

  const maximo = Math.max(...datos.map(([, v]) => v))
  const MIN_W = HEAD_W + TAIL_W + 10

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Gasto por Categoría <span style={{ color: T }}>🐾</span>
      </h2>
      <div className="space-y-5">
        {datos.map(([categoria, total]) => {
          const pct = Math.max((total / maximo) * 100, 16)
          return (
            <div key={categoria}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">{categoria}</span>
                <span className="font-semibold" style={{ color: T }}>{fmt(total)}</span>
              </div>

              {/* Dachshund bar */}
              <div
                className="relative transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, minWidth: MIN_W, height: SVG_H }}
              >
                {/* Body — stretchy middle section */}
                <div
                  className="absolute"
                  style={{
                    left: HEAD_W - 16,
                    right: TAIL_W - 16,
                    top: BAR_TOP,
                    height: BAR_H,
                    backgroundColor: B,
                    minWidth: 0,
                  }}
                />
                {/* Head */}
                <div className="absolute left-0 top-0">
                  <DogHead />
                </div>
                {/* Tail */}
                <div className="absolute right-0 top-0">
                  <DogTail />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
