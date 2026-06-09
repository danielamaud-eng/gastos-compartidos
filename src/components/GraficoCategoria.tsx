'use client'

import { useState, useEffect } from 'react'
import { Gasto } from '@/app/page'

// ── Formateo ──────────────────────────────────────────────────────────────────
const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

// ── Paleta Black & Tan ────────────────────────────────────────────────────────
const B  = '#18100A'   // cuerpo — negro fuego oscuro
const T  = '#C47828'   // tan    — patas, hocico, cejas
const T2 = '#E8A04A'   // tan claro — detalles internos

// ── Geometría (px) ───────────────────────────────────────────────────────────
const HEAD_W = 96
const TAIL_W = 68
const SVG_H  = 64
const BAR_TOP = 15
const BAR_H   = 24
const MIN_W   = HEAD_W + TAIL_W + 12   // 176 px mínimo

// ── SVG Cabeza ────────────────────────────────────────────────────────────────
function DogHead() {
  return (
    <svg
      width={HEAD_W} height={SVG_H}
      viewBox={`0 0 ${HEAD_W} ${SVG_H}`}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden
    >
      {/* Conexión al cuerpo */}
      <rect x="72" y={BAR_TOP} width={HEAD_W - 72} height={BAR_H} fill={B} />

      {/* Oreja caída */}
      <ellipse cx="22" cy="26" rx="14" ry="22" fill={B} transform="rotate(6 22 26)" />

      {/* Cabeza */}
      <ellipse cx="50" cy="27" rx="30" ry="22" fill={B} />

      {/* Vientre / cuello */}
      <ellipse cx="74" cy="40" rx="18" ry="10" fill={T} opacity="0.55" />

      {/* Hocico */}
      <ellipse cx="75" cy="33" rx="17" ry="13" fill={T} />

      {/* Ceja */}
      <path d="M 41 15 Q 50 10 57 14" stroke={T2} strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Ojo blanco */}
      <circle cx="47" cy="22" r="6" fill="white" />
      {/* Pupila */}
      <circle cx="48" cy="23" r="3.5" fill="#07020C" />
      {/* Brillo */}
      <circle cx="46.2" cy="21.4" r="1.2" fill="white" />

      {/* Nariz */}
      <ellipse cx="84" cy="29" rx="5.5" ry="4.5" fill="#07020C" />
      {/* Fosa nasal */}
      <ellipse cx="82.5" cy="30" rx="1.2" ry="1.5" fill={B} opacity="0.5" />

      {/* Boca */}
      <path d="M 79 34 Q 84 39 89 34" stroke="#07020C" strokeWidth="1.8" fill="none" strokeLinecap="round" />

      {/* Pata delantera */}
      <rect x="30" y="42" width="14" height="20" rx="7" fill={B} />
      {/* Pezuña */}
      <ellipse cx="37" cy="60" rx="10" ry="5" fill={T} />
      {/* División pezuña */}
      <line x1="37" y1="56" x2="37" y2="63" stroke={T2} strokeWidth="1" opacity="0.6" />
    </svg>
  )
}

// ── SVG Cola ──────────────────────────────────────────────────────────────────
function DogTail() {
  return (
    <svg
      width={TAIL_W} height={SVG_H}
      viewBox={`0 0 ${TAIL_W} ${SVG_H}`}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden
    >
      {/* Conexión al cuerpo */}
      <rect x="0" y={BAR_TOP} width="18" height={BAR_H} fill={B} />

      {/* Grupa — trasero redondeado */}
      <ellipse cx="36" cy="28" rx="30" ry="22" fill={B} />

      {/* Vientre trasero */}
      <ellipse cx="32" cy="42" rx="20" ry="10" fill={T} opacity="0.5" />

      {/* Pata trasera */}
      <rect x="14" y="42" width="14" height="20" rx="7" fill={B} />
      {/* Pezuña */}
      <ellipse cx="21" cy="60" rx="10" ry="5" fill={T} />
      {/* División pezuña */}
      <line x1="21" y1="56" x2="21" y2="63" stroke={T2} strokeWidth="1" opacity="0.6" />

      {/* Cola curvada hacia arriba */}
      <path
        d="M 58 24 C 66 13 70 4 64 0 C 58 -3 51 5 55 13"
        stroke={B} strokeWidth="9" fill="none" strokeLinecap="round"
      />
      {/* Punta de la cola — tan */}
      <circle cx="55.5" cy="13" r="4" fill={T} />
    </svg>
  )
}

// ── Componente DachshundBar ───────────────────────────────────────────────────
interface DachshundBarProps {
  value: number
  maxValue: number
  label: string
  amount: string
  index: number   // para escalonar la animación
}

function DachshundBar({ value, maxValue, label, amount, index }: DachshundBarProps) {
  const [animated, setAnimated] = useState(false)

  useEffect(() => {
    const delay = 80 + index * 120   // cada perro entra escalonado
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [index])

  const targetPct = Math.max((value / maxValue) * 100, 15)
  const currentPct = animated ? targetPct : 15

  return (
    <div className="group">
      {/* Etiqueta + monto */}
      <div className="flex justify-between items-baseline text-sm mb-2 px-0.5">
        <span className="font-semibold text-gray-800 tracking-tight">{label}</span>
        <span className="font-bold tabular-nums" style={{ color: T }}>{amount}</span>
      </div>

      {/* Perro */}
      <div
        style={{
          width: `${currentPct}%`,
          minWidth: MIN_W,
          height: SVG_H,
          position: 'relative',
          transition: 'width 0.8s cubic-bezier(0.34, 1.10, 0.64, 1)',
          willChange: 'width',
        }}
      >
        {/* Cuerpo — se estira */}
        <div
          style={{
            position: 'absolute',
            left: HEAD_W - 18,
            right: TAIL_W - 18,
            top: BAR_TOP,
            height: BAR_H,
            backgroundColor: B,
            minWidth: 0,
            borderRadius: 2,
          }}
        />
        {/* Cabeza */}
        <div style={{ position: 'absolute', left: 0, top: 0 }}>
          <DogHead />
        </div>
        {/* Cola */}
        <div style={{ position: 'absolute', right: 0, top: 0 }}>
          <DogTail />
        </div>
      </div>
    </div>
  )
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function GraficoCategoria({ gastos }: { gastos: Gasto[] }) {
  const porCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
    return acc
  }, {} as Record<string, number>)

  const datos = Object.entries(porCategoria).sort(([, a], [, b]) => b - a)

  if (datos.length === 0) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-10 shadow-sm text-center border border-amber-100">
        <div className="text-5xl mb-3">🐾</div>
        <p className="text-gray-400 text-sm">Sin gastos para mostrar</p>
      </div>
    )
  }

  const maximo = Math.max(...datos.map(([, v]) => v))

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-amber-100">
      <h2 className="text-lg font-bold text-gray-900 mb-1">
        Gasto por Categoría
      </h2>
      <p className="text-xs text-gray-400 mb-6">El largo del perro representa el % del gasto</p>

      <div className="space-y-6 overflow-x-hidden">
        {datos.map(([categoria, total], i) => (
          <DachshundBar
            key={categoria}
            label={categoria}
            amount={fmt(total)}
            value={total}
            maxValue={maximo}
            index={i}
          />
        ))}
      </div>
    </div>
  )
}
