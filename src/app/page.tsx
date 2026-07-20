'use client'

import { useState, useEffect, useCallback } from 'react'
import FormGasto from '@/components/FormGasto'
import Balance from '@/components/Balance'
import ListaGastos from '@/components/ListaGastos'
import GraficoCategoria from '@/components/GraficoCategoria'
import VistaSaldos from '@/components/VistaSaldos'
import { PERSONAS } from '@/lib/personas'

export type Gasto = {
  id: number
  monto: number
  categoria: string
  fecha: string
  nota: string
  comprobante: string
  tipo: string
  pagadoPor: string
}

export type Pago = {
  id: number
  monto: number
  fecha: string
  de: string
  para: string
  nota: string
}

function ProfileCircle() {
  return (
    <div
      className="w-14 h-14 rounded-full overflow-hidden border-[3px] border-white shadow-md flex-shrink-0 flex items-center justify-center text-2xl select-none"
      style={{ background: `#fce7f3 url('/images/perfil.jpg') center/cover no-repeat` }}
    >
      <span style={{ mixBlendMode: 'multiply', opacity: 0.4 }}>🐾</span>
    </div>
  )
}

// ── Pantalla de configuración inicial ────────────────────────────────────────
function SetupIdentidad({ onConfirm }: { onConfirm: (nombre: string) => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundImage: "url('/dachshund-bg.svg')", backgroundSize: '320px 220px' }}>
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-sm w-full text-center">
        <div className="text-5xl mb-4">🐾</div>
        <h1 className="text-xl font-bold text-gray-900 mb-1">Gastos Compartidos</h1>
        <p className="text-sm text-gray-500 mb-6">¿Quién eres?</p>
        <div className="flex flex-col gap-3">
          {PERSONAS.map(nombre => (
            <button
              key={nombre}
              onClick={() => onConfirm(nombre)}
              className="w-full py-4 rounded-xl font-bold text-lg border-2 border-rose-200 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-colors text-gray-800"
            >
              {nombre}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Home() {
  const [gastos, setGastos]           = useState<Gasto[]>([])
  const [pagos, setPagos]             = useState<Pago[]>([])
  const [filtroTipo, setFiltroTipo]   = useState<'todos' | 'solo_mia' | 'a_medias' | 'cargo_total'>('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [mostrarGrafico, setMostrarGrafico]       = useState(false)
  const [mostrarSaldos, setMostrarSaldos]         = useState(false)
  const [loading, setLoading]         = useState(true)
  const [identidad, setIdentidad]     = useState<string | null>(null)

  useEffect(() => {
    const id = localStorage.getItem('identidad') || ''
    setIdentidad(id)
  }, [])

  const cargarDatos = useCallback(async () => {
    const [gastosRes, pagosRes] = await Promise.all([
      fetch('/api/gastos'),
      fetch('/api/pagos'),
    ])
    setGastos(await gastosRes.json())
    setPagos(await pagosRes.json())
    setLoading(false)
  }, [])

  useEffect(() => {
    if (identidad !== null && identidad !== '') cargarDatos()
  }, [identidad, cargarDatos])

  const handleConfirmarIdentidad = (nombre: string) => {
    localStorage.setItem('identidad', nombre)
    setIdentidad(nombre)
  }

  const handleGastoCreado = () => {
    cargarDatos()
    setMostrarFormulario(false)
  }

  const handleEliminar = async (id: number) => {
    await fetch(`/api/gastos/${id}`, { method: 'DELETE' })
    cargarDatos()
  }

  if (identidad === null) return null
  if (identidad === '') return <SetupIdentidad onConfirm={handleConfirmarIdentidad} />

  const gastosFiltrados = gastos.filter(g => {
    if (filtroTipo !== 'todos' && g.tipo !== filtroTipo) return false
    if (filtroCategoria !== 'todas' && g.categoria !== filtroCategoria) return false
    return true
  })

  const categorias = Array.from(new Set(gastos.map(g => g.categoria)))

  return (
    <main className="min-h-screen" style={{ backgroundImage: "url('/dachshund-bg.svg')", backgroundSize: '320px 220px', backgroundRepeat: 'repeat' }}>

      {/* ── Header ────────────────────────── */}
      <header className="relative overflow-hidden border-b border-rose-100">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-amber-50" />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80'%3E%3Ctext y='55' font-size='38' opacity='0.12'%3E🐾%3C/text%3E%3C/svg%3E")`,
            backgroundSize: '80px 80px',
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 py-5">
          <div className="flex items-center gap-4">
            <ProfileCircle />
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">
                Gastos Compartidos
                <span className="ml-2 text-rose-400">🐾</span>
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Hola, <strong>{identidad}</strong></p>
            </div>
            <div className="flex items-center gap-2">
              <a
                href="/api/export"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                Exportar Excel
              </a>
              <button
                onClick={() => { localStorage.removeItem('identidad'); setIdentidad('') }}
                className="text-gray-400 hover:text-gray-600 text-xs px-2 py-2"
                title="Cambiar nombre"
              >
                ✎
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* ── Balance ─────────────────── */}
        <Balance gastos={gastos} pagos={pagos} identidad={identidad} />

        {/* ── Acciones ────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-6">
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
          <button
            onClick={() => setMostrarSaldos(v => !v)}
            className="bg-teal-500 hover:bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm"
          >
            {mostrarSaldos ? 'Ocultar saldos' : 'Ver saldos'}
          </button>
        </div>

        {mostrarFormulario && (
          <div className="mb-6">
            <FormGasto onCreado={handleGastoCreado} identidad={identidad} />
          </div>
        )}

        {mostrarGrafico && (
          <div className="mb-6">
            <GraficoCategoria gastos={gastos} />
          </div>
        )}

        {mostrarSaldos && (
          <VistaSaldos
            gastos={gastos}
            pagos={pagos}
            onPagoCreado={cargarDatos}
          />
        )}

        {/* ── Filtros ──────────────────────────────── */}
        <div className="bg-white/90 rounded-xl px-4 py-3 mb-4 shadow-sm flex flex-wrap gap-4 items-center border border-rose-50">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-600">Tipo:</label>
            <select
              value={filtroTipo}
              onChange={e => setFiltroTipo(e.target.value as typeof filtroTipo)}
              className="border rounded-lg px-3 py-1.5 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-rose-300"
            >
              <option value="todos">Todos</option>
              <option value="solo_mia">Personal</option>
              <option value="a_medias">A medias</option>
              <option value="cargo_total">Cargo 100%</option>
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
          <ListaGastos gastos={gastosFiltrados} onEliminar={handleEliminar} identidad={identidad} />
        )}

        <p className="text-center pt-10 pb-4 text-gray-300 text-sm select-none">Hecho con amor 🐾</p>
      </div>
    </main>
  )
}
