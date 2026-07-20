'use client'

import { useState } from 'react'

interface Props {
  de: string
  para: string
  montoSugerido: number
  onCreado: () => void
  onCancelar: () => void
}

const fmt = (n: number) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(n)

const hoy = () => new Date().toISOString().slice(0, 10)

export default function FormPago({ de, para, montoSugerido, onCreado, onCancelar }: Props) {
  const [monto, setMonto]   = useState(Math.round(montoSugerido).toString())
  const [fecha, setFecha]   = useState(hoy())
  const [nota, setNota]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const montoNum = parseFloat(monto)
    if (!montoNum || montoNum <= 0) { setError('Ingresa un monto válido'); return }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/pagos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: montoNum, fecha, de, para, nota }),
      })
      if (!res.ok) throw new Error('Error al registrar el pago')
      onCreado()
    } catch {
      setError('No se pudo registrar el pago. Intenta de nuevo.')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-teal-50 border border-teal-200 rounded-xl p-4 mt-3">
      <p className="text-sm font-semibold text-teal-800 mb-3">
        {de} paga a {para}
      </p>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Monto</label>
          <input
            type="number"
            value={monto}
            onChange={e => setMonto(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            placeholder="0"
            min="1"
            required
          />
          {montoSugerido > 0 && (
            <button
              type="button"
              onClick={() => setMonto(Math.round(montoSugerido).toString())}
              className="mt-1 text-xs text-teal-600 hover:underline"
            >
              Usar saldo pendiente ({fmt(montoSugerido)})
            </button>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-600 mb-1">Nota (opcional)</label>
        <input
          type="text"
          value={nota}
          onChange={e => setNota(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-400"
          placeholder="Ej: transferencia julio"
        />
      </div>

      {error && <p className="text-red-500 text-xs mb-3">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
        >
          {loading ? 'Guardando…' : 'Registrar pago'}
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
