import { Gasto, Pago } from '@/app/page'
import { PERSONAS } from '@/lib/personas'
import { calcularSaldoPar } from '@/lib/calcularSaldos'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export default function Balance({
  gastos,
  pagos,
  identidad,
}: {
  gastos: Gasto[]
  pagos: Pago[]
  identidad: string
}) {
  const pareja      = PERSONAS.find(p => p !== identidad) ?? ''
  const { saldo }   = calcularSaldoPar(gastos, identidad, pareja, pagos)
  const balancePositivo = saldo >= 0

  const totalAMedias  = gastos.filter(g => g.tipo === 'a_medias').reduce((s, g) => s + g.monto, 0)
  const misPersonales = gastos.filter(g => g.tipo === 'solo_mia' && g.pagadoPor === identidad).reduce((s, g) => s + g.monto, 0)
  const totalGeneral  = gastos.reduce((s, g) => s + g.monto, 0)

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white/90 rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Gastos</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{fmt(totalGeneral)}</p>
      </div>

      <div className="bg-white/90 rounded-xl p-4 shadow-sm border-l-4 border-slate-400">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Mis Personales</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{fmt(misPersonales)}</p>
      </div>

      <div className="bg-white/90 rounded-xl p-4 shadow-sm border-l-4 border-orange-400">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">A medias</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{fmt(totalAMedias)}</p>
      </div>

      <div className={`bg-white/90 rounded-xl p-4 shadow-sm border-l-4 ${balancePositivo ? 'border-green-500' : 'border-red-400'}`}>
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {balancePositivo ? 'Te deben' : 'Debes'}
        </p>
        <p className={`text-xl font-bold mt-1 ${balancePositivo ? 'text-green-600' : 'text-red-500'}`}>
          {fmt(Math.abs(saldo))}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">
          {balancePositivo ? 'tu pareja te debe' : 'le debes a tu pareja'}
        </p>
      </div>
    </div>
  )
}
