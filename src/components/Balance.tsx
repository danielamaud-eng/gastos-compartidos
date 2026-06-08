import { Gasto } from '@/app/page'

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export default function Balance({ gastos }: { gastos: Gasto[] }) {
  const totalSoloMia = gastos.filter(g => g.tipo === 'solo_mia').reduce((s, g) => s + g.monto, 0)
  const totalAMedias = gastos.filter(g => g.tipo === 'a_medias').reduce((s, g) => s + g.monto, 0)
  const totalGeneral = totalSoloMia + totalAMedias
  const teDebeEl = totalAMedias / 2

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Gastos</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{fmt(totalGeneral)}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-slate-400">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Solo mía</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{fmt(totalSoloMia)}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-400">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">A medias</p>
        <p className="text-xl font-bold text-gray-900 mt-1">{fmt(totalAMedias)}</p>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-green-500">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">Él te debe</p>
        <p className="text-xl font-bold text-green-600 mt-1">{fmt(teDebeEl)}</p>
      </div>
    </div>
  )
}
