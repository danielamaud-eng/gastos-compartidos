'use client'

import { Gasto } from '@/app/page'

const COLORES = ['#3B82F6', '#EF4444', '#F59E0B', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#6B7280']

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export default function GraficoCategoria({ gastos }: { gastos: Gasto[] }) {
  const porCategoria = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
    return acc
  }, {} as Record<string, number>)

  const datos = Object.entries(porCategoria).sort(([, a], [, b]) => b - a)

  if (datos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm text-center text-gray-400">
        Sin datos para mostrar
      </div>
    )
  }

  const maximo = Math.max(...datos.map(([, v]) => v))

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-5">Gasto por Categoría</h2>
      <div className="space-y-4">
        {datos.map(([categoria, total], i) => (
          <div key={categoria}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-gray-700">{categoria}</span>
              <span className="text-gray-500">{fmt(total)}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-5 overflow-hidden">
              <div
                className="h-5 rounded-full transition-all duration-700"
                style={{
                  width: `${(total / maximo) * 100}%`,
                  backgroundColor: COLORES[i % COLORES.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
