'use client'

import { useState } from 'react'
import { Gasto } from '@/app/page'
import { PERSONAS } from '@/lib/personas'
import { calcularTodosSaldos, DetalleGasto } from '@/lib/calcularSaldos'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

function DetalleRow({ d }: { d: DetalleGasto }) {
  const positivo = d.aporte > 0
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-gray-400 text-xs whitespace-nowrap">{d.fecha}</span>
        <span className="truncate text-gray-600">{d.categoria}{d.nota ? ` · ${d.nota}` : ''}</span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${
          d.tipo === 'a_medias' ? 'bg-orange-100 text-orange-700' : 'bg-emerald-100 text-emerald-700'
        }`}>
          {d.tipo === 'a_medias' ? '½' : '100%'}
        </span>
      </div>
      <span className={`font-medium whitespace-nowrap ml-3 ${positivo ? 'text-green-600' : 'text-red-500'}`}>
        {positivo ? '+' : ''}{fmt(d.aporte)}
      </span>
    </div>
  )
}

export default function VistaSaldos({ gastos }: { gastos: Gasto[] }) {
  const [expandido, setExpandido] = useState<string | null>(null)
  const saldos = calcularTodosSaldos(gastos)

  return (
    <div className="mb-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Saldos entre personas</h2>

      {saldos.map(par => {
        const key = `${par.personaA}-${par.personaB}`
        const abierto = expandido === key
        const liquidado = par.monto === 0

        return (
          <div key={key} className="bg-white/90 rounded-xl shadow-sm border border-rose-50 overflow-hidden">
            <button
              className="w-full flex items-center justify-between px-5 py-4 text-left gap-4"
              onClick={() => setExpandido(abierto ? null : key)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${liquidado ? 'bg-gray-300' : par.saldo >= 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="font-medium text-gray-800">
                  {liquidado
                    ? `${par.personaA} y ${par.personaB} están al día`
                    : `${par.deudor} le debe a ${par.acreedor}`}
                </span>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-lg font-bold ${liquidado ? 'text-gray-400' : 'text-gray-900'}`}>
                  {fmt(par.monto)}
                </span>
                <span className="text-gray-300 text-sm">{abierto ? '▲' : '▼'}</span>
              </div>
            </button>

            {abierto && (
              <div className="px-5 pb-4 border-t border-gray-50">
                {par.detalle.length === 0 ? (
                  <p className="text-sm text-gray-400 py-3">Sin gastos compartidos.</p>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-2">
                      Saldo desde perspectiva de <strong>{par.personaA}</strong>
                      {' '}(+ = {par.personaB} debe · − = {par.personaA} debe)
                    </p>
                    {par.detalle.map(d => <DetalleRow key={d.id} d={d} />)}
                    <div className="flex justify-between pt-3 mt-1 border-t border-gray-100 font-semibold text-sm">
                      <span className="text-gray-600">Neto</span>
                      <span className={par.saldo >= 0 ? 'text-green-600' : 'text-red-500'}>
                        {par.saldo >= 0 ? '+' : ''}{fmt(par.saldo)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}

      {PERSONAS.length <= 1 && (
        <p className="text-sm text-gray-400 text-center py-4">Agrega más personas para ver saldos.</p>
      )}
    </div>
  )
}
