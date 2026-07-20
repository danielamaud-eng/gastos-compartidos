'use client'

import { useState } from 'react'
import { Gasto, Pago } from '@/app/page'
import { PERSONAS } from '@/lib/personas'
import { calcularTodosSaldos, DetalleGasto, PagoCalculo } from '@/lib/calcularSaldos'
import FormPago from '@/components/FormPago'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

function DetalleGastoRow({ d }: { d: DetalleGasto }) {
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

function DetallePagoRow({ p, personaA }: { p: PagoCalculo; personaA: string }) {
  // Mismo signo que el efecto en el saldo: de===A → +monto (saldo sube), de===B → -monto (saldo baja)
  const aporte = p.de === personaA ? p.monto : -p.monto
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0 text-sm">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-gray-400 text-xs whitespace-nowrap">{p.fecha}</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full bg-teal-100 text-teal-700 flex-shrink-0">pago</span>
        <span className="truncate text-gray-600">
          {p.de} → {p.para}{p.nota ? ` · ${p.nota}` : ''}
        </span>
      </div>
      <span className={`font-medium whitespace-nowrap ml-3 ${aporte > 0 ? 'text-green-600' : 'text-red-500'}`}>
        {aporte > 0 ? '+' : ''}{fmt(aporte)}
      </span>
    </div>
  )
}

export default function VistaSaldos({
  gastos,
  pagos,
  onPagoCreado,
}: {
  gastos: Gasto[]
  pagos: Pago[]
  onPagoCreado: () => void
}) {
  const [expandido, setExpandido]         = useState<string | null>(null)
  const [formularioPago, setFormularioPago] = useState<string | null>(null)

  const saldos = calcularTodosSaldos(gastos, pagos)

  return (
    <div className="mb-6 space-y-3">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Saldos entre personas</h2>

      {saldos.map(par => {
        const key       = `${par.personaA}-${par.personaB}`
        const abierto   = expandido === key
        const liquidado = par.monto === 0
        const mostrarForm = formularioPago === key

        const todosMov = [
          ...par.detalle.map(d => ({ tipo: 'gasto' as const, fecha: d.fecha, d })),
          ...par.pagos.map(p => ({ tipo: 'pago' as const, fecha: p.fecha, p })),
        ].sort((a, b) => a.fecha.localeCompare(b.fecha))

        return (
          <div key={key} className="bg-white/90 rounded-xl shadow-sm border border-rose-50 overflow-hidden">
            {/* Cabecera */}
            <div className="flex items-center justify-between px-5 py-4 gap-4">
              <button
                className="flex items-center gap-3 min-w-0 flex-1 text-left"
                onClick={() => setExpandido(abierto ? null : key)}
              >
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${liquidado ? 'bg-gray-300' : par.saldo >= 0 ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className="font-medium text-gray-800">
                  {liquidado
                    ? `${par.personaA} y ${par.personaB} están al día`
                    : `${par.deudor} le debe a ${par.acreedor}`}
                </span>
              </button>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-lg font-bold ${liquidado ? 'text-gray-400' : 'text-gray-900'}`}>
                  {fmt(par.monto)}
                </span>

                {!liquidado && (
                  <button
                    onClick={() => setFormularioPago(mostrarForm ? null : key)}
                    className="bg-teal-500 hover:bg-teal-600 text-white text-xs px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap"
                  >
                    Saldar
                  </button>
                )}

                <button
                  onClick={() => setExpandido(abierto ? null : key)}
                  className="text-gray-300 text-sm w-5 text-center"
                >
                  {abierto ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Formulario de pago inline */}
            {mostrarForm && (
              <div className="px-5 pb-4 border-t border-gray-50">
                <FormPago
                  de={par.deudor}
                  para={par.acreedor}
                  montoSugerido={par.monto}
                  onCreado={() => { setFormularioPago(null); onPagoCreado() }}
                  onCancelar={() => setFormularioPago(null)}
                />
              </div>
            )}

            {/* Detalle colapsable */}
            {abierto && (
              <div className="px-5 pb-4 border-t border-gray-50">
                {todosMov.length === 0 ? (
                  <p className="text-sm text-gray-400 py-3">Sin movimientos.</p>
                ) : (
                  <div className="mt-2">
                    <p className="text-xs text-gray-400 mb-2">
                      Perspectiva de <strong>{par.personaA}</strong>
                      {' '}(+ = {par.personaB} debe · − = {par.personaA} debe)
                    </p>
                    {todosMov.map((mov, i) =>
                      mov.tipo === 'gasto'
                        ? <DetalleGastoRow key={`g-${mov.d.id}-${i}`} d={mov.d} />
                        : <DetallePagoRow  key={`p-${mov.p.id}-${i}`} p={mov.p} personaA={par.personaA} />,
                    )}
                    <div className="flex justify-between pt-3 mt-1 border-t border-gray-100 font-semibold text-sm">
                      <span className="text-gray-600">Saldo neto</span>
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
