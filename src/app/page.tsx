'use client'

import { useState, useEffect, useCallback } from 'react'
import FormGasto from '@/components/FormGasto'
import Balance from '@/components/Balance'
import ListaGastos from '@/components/ListaGastos'
import GraficoCategoria from '@/components/GraficoCategoria'

export type Gasto = {
  id: number
  monto: number
  categoria: string
  fecha: string
  nota: string
  comprobante: string
  tipo: string
}

const FOTOS_STRIP = ['/images/foto1.jpg', '/images/foto2.jpg', '/images/foto3.jpg']
const STRIP_FALLBACK = ['#fce7f3', '#fdf4ff', '#fff7ed']

function ProfileCircle() {
  const [hasError, setHasError] = useState(false)
  return (
    <div
      className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-white shadow-md flex-shrink-0 flex items-center justify-center text-2xl select-none"
      style={{ background: '#fce7f3' }}
    >
      {hasError ? (
        <span>🐾</span>
      ) : (
        <img
          src="/images/perfil.jpg"
          alt=""
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      )}
    </div>
  )
}

export default function Home() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'solo_mia' | 'a_medias'>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarGrafico, setMostrarGrafico] = useState(false)
  const [loading, setLoading] = useState(true)

  const cargarGastos = useCallback(async () => {
    const res = await fetch('/api/gastos')
    const data = await res.json()
    setGastos(data)
    setLoading(false)
  }, [])

  useEffect(() => { cargarGastos() }, [cargarGastos])

  const handleGastoCreado = () => {
    cargarGastos()
    setMostrarFormulario(false)
  }

  const handleEliminar = async (id: number) => {
    await fetch(`/api/gastos/${id}`, { method: 'DELETE' })
    cargarGastos()
  }

  const gastosFiltrados = gastos.filter(g => {
    if (filtroTipo !== 'todos' && g.tipo !== filtroTipo) return false
    if (filtroCategoria !== 'todas' && g.categoria !== filtroCategoria) return false
    return true
  })

  const categorias = Array.from(new Set(gastos.map(g => g.categoria)))

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#FFF8F5' }}>

      {/* ── Header personal ────────────────────────── */}
      <header className="relative overflow-hidden border-b border-rose-100">
        {/* Fondo degradado */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50" />
        {/* Textura pata de perro muy sutil */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Ctext y='55' font-size='38' opacity='0.12'%3E🐾%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            {/* Foto circular — guardar como public/images/perfil.jpg */}
            <ProfileCircle />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Gastos Compartidos
                <span className="ml-2 text-rose-400">🐾</span>
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Nuestro registro del hogar</p>
            </div>
            <a
              href="/api/export"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
            >
              Exportar Excel
            </a>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Tira de fotos ───────────────────────────
            Guarda foto1.jpg, foto2.jpg, foto3.jpg en public/images/
            Si no hay foto, muestra un bloque de color suave.       */}
        <div className="flex gap-2 mb-6">
          {FOTOS_STRIP.map((src, i) => (
            <div
              key={i}
              className="flex-1 h-32 rounded-2xl overflow-hidden shadow-sm"
              style={{ background: STRIP_FALLBACK[i] }}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.opacity = '0' }}
              />
            </div>
          ))}
        </div>

        {/* ── Tarjetas de balance ─────────────────── */}
        <Balance gastos={gastos} />

        {/* ── Acciones ────────────────────────────── */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setMostrarFormulario(v => !v)}
            className="bg-rose-500 hover:bg-rose-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            {mostrarFormulario ? '✕ Cancelar' : '+ Agregar Gasto'}
          </button>
          <button
            onClick={() => setMostrarGrafico(v => !v)}
            className="bg-violet-500 hover:bg-violet-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            {mostrarGrafico ? 'Ocultar gráfico' : 'Ver gráfico'}
          </button>
        </div>

        {mostrarFormulario && (
          <div className="mb-6">
            <FormGasto onCreado={handleGastoCreado} />
          </div>
        )}

        {mostrarGrafico && (
          <div className="mb-6">
            <GraficoCategoria gastos={gastos} />
          </div>
        )}

        {/* ── Filtros ──────────────────────────────── */}
        <div className="bg-white rounded-xl px-4 py-3 mb-4 shadow-sm flex flex-wrap gap-4 items-center border border-rose-50">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Tipo:</label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value as typeof filtroTipo)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="todos">Todos</option>
              <option value="solo_mia">Solo mía</option>
              <option value="a_medias">A medias</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Categoría:</label>
            <select
              value={filtroCategoria}
              onChange={e => setFiltroCategoria(e.target.value)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="todas">Todas</option>
              {categorias.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <span className="text-sm text-gray-400 ml-auto">
            {gastosFiltrados.length} {gastosFiltrados.length === 1 ? 'gasto' : 'gastos'}
          </span>
        </div>

        {/* ── Lista ────────────────────────────────── */}
        {loading ? (
          <div className="text-center py-16 text-gray-300">Cargando...</div>
        ) : (
          <ListaGastos gastos={gastosFiltrados} onEliminar={handleEliminar} />
        )}

        {/* Footer */}
        <p className="text-center pt-10 pb-4 text-gray-300 text-sm select-none">
          Hecho con amor 🐾
        </p>
      </div>
    </main>
  )
}
