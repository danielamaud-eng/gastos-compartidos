'use client'

import { useState } from 'react'
import { PERSONAS } from '@/lib/personas'

const CATEGORIAS = [
  'Alimentación', 'Arriendo', 'Servicios', 'Transporte',
  'Salud', 'Entretenimiento', 'Limpieza', 'Mascotas', 'Muebles', 'Otros',
]

function comprimirImagen(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const MAX = 900
        let { width, height } = img
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX }
          else { width = Math.round((width * MAX) / height); height = MAX }
        }
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL('image/jpeg', 0.75))
      }
      img.onerror = reject
      img.src = e.target!.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export default function FormGasto({
  onCreado,
  identidad,
}: {
  onCreado: () => void
  identidad: string
}) {
  const [form, setForm] = useState({
    monto: '',
    categoria: 'Alimentación',
    fecha: new Date().toISOString().split('T')[0],
    nota: '',
    tipo: 'a_medias',
    pagadoPor: identidad,
  })
  const [archivo, setArchivo] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const pareja = PERSONAS.find(p => p !== identidad) ?? 'Pareja'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let comprobante = ''
      if (archivo) {
        if (archivo.size > 10 * 1024 * 1024) {
          setError('El archivo es demasiado grande (máx 10MB)')
          setLoading(false)
          return
        }
        comprobante = await comprimirImagen(archivo)
      }

      const res = await fetch('/api/gastos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, monto: parseFloat(form.monto), comprobante }),
      })

      if (!res.ok) throw new Error('Error al guardar')

      setForm({
        monto: '',
        categoria: 'Alimentación',
        fecha: new Date().toISOString().split('T')[0],
        nota: '',
        tipo: 'a_medias',
        pagadoPor: identidad,
      })
      setArchivo(null)
      onCreado()
    } catch {
      setError('No se pudo guardar el gasto. Intenta nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/95 rounded-xl p-6 shadow-sm border border-rose-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Nuevo Gasto</h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
          <input
            type="number" required min="1" step="any"
            value={form.monto}
            onChange={e => setForm({ ...form, monto: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <select
            value={form.categoria}
            onChange={e => setForm({ ...form, categoria: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
          <input
            type="date" value={form.fecha}
            onChange={e => setForm({ ...form, fecha: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <select
            value={form.tipo}
            onChange={e => setForm({ ...form, tipo: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
          >
            <option value="a_medias">A medias (50/50)</option>
            <option value="solo_mia">Personal (solo mío)</option>
          </select>
        </div>

        {/* ¿Quién pagó? */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">¿Quién pagó?</label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setForm({ ...form, pagadoPor: identidad })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                form.pagadoPor === identidad
                  ? 'bg-rose-500 border-rose-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-rose-300'
              }`}
            >
              Yo ({identidad})
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, pagadoPor: pareja })}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${
                form.pagadoPor !== identidad
                  ? 'bg-violet-500 border-violet-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-violet-300'
              }`}
            >
              {pareja}
            </button>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Nota (opcional)</label>
          <input
            type="text" value={form.nota}
            onChange={e => setForm({ ...form, nota: e.target.value })}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            placeholder="Descripción del gasto..."
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Comprobante (opcional)</label>
          <input
            type="file" accept="image/*,.pdf"
            onChange={e => setArchivo(e.target.files?.[0] || null)}
            className="w-full border rounded-lg px-3 py-2 text-sm"
          />
          {archivo && (
            <p className="text-xs text-gray-500 mt-1">
              {archivo.name} ({(archivo.size / 1024).toFixed(0)} KB) — se comprimirá automáticamente
            </p>
          )}
        </div>

        {error && (
          <div className="md:col-span-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
        )}

        <div className="md:col-span-2">
          <button
            type="submit" disabled={loading}
            className="w-full bg-rose-500 hover:bg-rose-600 disabled:bg-rose-300 text-white py-2.5 rounded-xl font-medium transition-colors"
          >
            {loading ? 'Guardando...' : 'Guardar Gasto'}
          </button>
        </div>
      </form>
    </div>
  )
}
