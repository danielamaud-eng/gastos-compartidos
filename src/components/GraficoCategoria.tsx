'use client'

import { Gasto } from '@/app/page'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const BODY = '#1A0E06'
const PAWS = '#C07830'

function DogHead() {
  return (
    <svg width="80" height="52" viewBox="0 0 80 52" style={{ display: 'block', flexShrink: 0 }}>
      {/* Ear */}
      <ellipse cx="22" cy="20" rx="13" ry="19" fill={BODY} transform="rotate(12 22 20)" />
      {/* Head */}
      <ellipse cx="44" cy="24" rx="26" ry="17" fill={BODY} />
      {/* Body extension to right edge */}
      <rect x="60" y="17" width="20" height="14" fill={BODY} />
      {/* Muzzle */}
      <ellipse cx="63" cy="28" rx="13" ry="10" fill={PAWS} />
      {/* Eyebrow */}
      <path d="M 35 14 Q 41 11 46 14" stroke={PAWS} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* Eye */}
      <circle cx="40" cy="19" r="4.5" fill="white" />
      <circle cx="40.5" cy="19.5" r="2.6" fill="#08030A" />
      <circle cx="39.2" cy="18.4" r="1" fill="white" />
      {/* Nose */}
      <ellipse cx="70" cy="26" rx="4.5" ry="3.5" fill="#08030A" />
      {/* Mouth */}
      <path d="M 67 29 Q 70 32 73 29" stroke="#08030A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Front leg */}
      <rect x="28" y="35" width="13" height="15" rx="6.5" fill={BODY} />
      <ellipse cx="34.5" cy="49" rx="8" ry="4.5" fill={PAWS} />
    </svg>
  )
}

function DogTail() {
  return (
    <svg width="58" height="52" viewBox="0 0 58 52" style={{ display: 'block', flexShrink: 0 }}>
      {/* Body extension to left edge */}
      <rect x="0" y="17" width="16" height="14" fill={BODY} />
      {/* Rear body */}
      <ellipse cx="28" cy="24" rx="24" ry="16" fill={BODY} />
      {/* Back leg */}
      <rect x="10" y="35" width="13" height="15" rx="6.5" fill={BODY} />
      <ellipse cx="16.5" cy="49" rx="8" ry="4.5" fill={PAWS} />
      {/* Tail */}
      <path d="M 48 20 C 56 12 60 5 55 1 C 50 -2 44 3 47 9"
        stroke={BODY} strokeWidth="7" fill="none" strokeLinecap="round" />
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
      <div className="bg-white rounded-xl p-6 shadow-sm text-center" style={{ color: '#C07830' }}>
        <div className="text-4xl mb-2">🐾</div>
        <p className="text-gray-400 text-sm">Sin gastos para mostrar</p>
      </div>
    )
  }

  const maximo = Math.max(...datos.map(([, v]) => v))

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Gasto por Categoría <span style={{ color: PAWS }}>🐾</span>
      </h2>
      <div className="space-y-5">
        {datos.map(([categoria, total]) => {
          const pct = Math.max((total / maximo) * 100, 14)
          return (
            <div key={categoria}>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">{categoria}</span>
                <span className="font-semibold" style={{ color: PAWS }}>{fmt(total)}</span>
              </div>
              {/* Dachshund bar */}
              <div
                className="relative transition-all duration-700 ease-out"
                style={{ width: `${pct}%`, minWidth: '142px', height: '52px' }}
              >
                {/* Stretchy body connecting head to tail */}
                <div
                  className="absolute"
                  style={{
                    left: 60,
                    right: 42,
                    top: 17,
                    height: 14,
                    backgroundColor: BODY,
                    minWidth: 0,
                  }}
                />
                {/* Head (left) */}
                <div className="absolute left-0 top-0">
                  <DogHead />
                </div>
                {/* Tail (right) */}
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
