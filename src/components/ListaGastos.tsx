import { Gasto } from '@/app/page'

const COLORES_CATEGORIA: Record<string, string> = {
  'Alimentación': 'bg-yellow-100 text-yellow-800',
  'Arriendo': 'bg-red-100 text-red-800',
  'Servicios': 'bg-blue-100 text-blue-800',
  'Transporte': 'bg-green-100 text-green-800',
  'Salud': 'bg-pink-100 text-pink-800',
  'Entretenimiento': 'bg-purple-100 text-purple-800',
  'Limpieza': 'bg-cyan-100 text-cyan-800',
  'Mascotas': 'bg-lime-100 text-lime-800',
  'Muebles': 'bg-amber-100 text-amber-800',
  'Otros': 'bg-gray-100 text-gray-700',
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

export default function ListaGastos({
  gastos,
  onEliminar,
  identidad,
}: {
  gastos: Gasto[]
  onEliminar: (id: number) => void
  identidad: string
}) {
  if (gastos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 shadow-sm text-center text-gray-400">
        No hay gastos registrados
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Fecha</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Monto</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Tipo</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Pagó</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Nota</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Comp.</th>
              <th className="px-4 py-3 w-8"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {gastos.map(gasto => (
              <tr key={gasto.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">{gasto.fecha}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${COLORES_CATEGORIA[gasto.categoria] ?? 'bg-gray-100 text-gray-700'}`}>
                    {gasto.categoria}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                  {fmt(gasto.monto)}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${gasto.tipo === 'a_medias' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                    {gasto.tipo === 'a_medias' ? 'A medias' : 'Personal'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${gasto.pagadoPor === identidad ? 'bg-rose-100 text-rose-700' : 'bg-violet-100 text-violet-700'}`}>
                    {gasto.pagadoPor === identidad ? 'Yo' : gasto.pagadoPor ? 'Pareja' : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-500 max-w-xs truncate">{gasto.nota || '—'}</td>
                <td className="px-4 py-3 text-center">
                  {gasto.comprobante ? (
                    <a href={gasto.comprobante} target="_blank" rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-xs font-medium">
                      Ver
                    </a>
                  ) : '—'}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => { if (confirm('¿Eliminar este gasto?')) onEliminar(gasto.id) }}
                    className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
                    title="Eliminar"
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
