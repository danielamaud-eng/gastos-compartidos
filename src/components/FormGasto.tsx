'use client'

import { useState } from 'react'

const CATEGORIAS = [
  'Alimentación', 'Arriendo', 'Servicios', 'Transporte',
  'Salud', 'Entretenimiento', 'Limpieza', 'Mascotas', 'Muebles', 'Otros',
]

export default function FormGasto({ onCreado }: { onCreado: () => void }) {
  const [form, setForm] = useState({
    monto: '',
    categoria: 'Alimentación',
    fecha: new Date().toISOString().split('T')[0],
    nota: '',
    tipo: 'a_medias',
  })
  const [archivo, setArchivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    let comprobante = ''
    if (archivo) {
      const fd = new FormData()
      fd.append('file', archivo)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const data = await res.json()
      comprobante = data.url
    }

    await fetch('/api/gastos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, monto: parseFloat(form.monto), comprobante }),
    })

    setForm({
      monto: '',
      categoria: 'Alimentación',
      fecha: new Date().toISOString().split('T')[0],
      nota: '',
      tipo: 'a_medias',
    })
    setArchivo(null)
    setLoading(false)
    onCreado()
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-blue-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Gasto</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <input
            type="number"
            required
            min="1"
            step="any"
            value={form.monto}
            onChange={e => setForm({ ...form, monto: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={form.categoria}
            onChange={e => setForm({ ...form, categoria: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date"
            value={form.fecha}
            onChange={e => setForm({ ...form, fecha: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={e => setForm({ ...form, tipo: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="a_medias">A medias</option>
            <option value="solo_mia">Solo mía</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
          <input
            type="text"
            value={form.nota}
            onChange={e => setForm({ ...form, nota: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Descripción del gasto..."
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (opcional)</label>
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={e => setArchivo(e.target.files?.[0] || null)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {archivo && <p className="text-xs text-gray-500 mt-1">{archivo.name}</p>}
        </div>
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-2.5 rounded-xl font-medium transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar Gasto'}
          </button>
        </div>
      </form>
    </div>
  )
}
