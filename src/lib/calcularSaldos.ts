import { PERSONAS } from '@/lib/personas'

export type GastoCalculo = {
  id: number
  monto: number
  tipo: string
  pagadoPor: string
  fecha: string
  categoria: string
  nota: string
}

export type DetalleGasto = GastoCalculo & {
  // positivo → personaB le debe a personaA por este gasto
  // negativo → personaA le debe a personaB por este gasto
  aporte: number
}

export type PagoCalculo = {
  id: number
  monto: number
  fecha: string
  de: string
  para: string
  nota: string
}

export type SaldoPar = {
  personaA: string
  personaB: string
  // Saldo neto desde perspectiva de personaA (descontados los pagos).
  // positivo → personaB le debe a personaA
  // negativo → personaA le debe a personaB
  saldo: number
  acreedor: string
  deudor: string
  monto: number // siempre positivo
  detalle: DetalleGasto[]
  pagos: PagoCalculo[]
}

export function calcularSaldoPar(
  gastos: GastoCalculo[],
  personaA: string,
  personaB: string,
  pagos: PagoCalculo[] = [],
): SaldoPar {
  let saldo = 0
  const detalle: DetalleGasto[] = []

  for (const g of gastos) {
    const { pagadoPor, tipo, monto } = g
    if (tipo === 'solo_mia') continue
    if (pagadoPor !== personaA && pagadoPor !== personaB) continue

    let aporte = 0
    if (tipo === 'a_medias') {
      aporte = pagadoPor === personaA ? monto / 2 : -(monto / 2)
    } else if (tipo === 'cargo_total') {
      aporte = pagadoPor === personaA ? monto : -monto
    }

    if (aporte !== 0) {
      saldo += aporte
      detalle.push({ ...g, aporte })
    }
  }

  // de === personaA → personaA pagó su deuda → saldo sube (hacia 0 desde negativo)
  // de === personaB → personaB pagó su deuda → saldo baja (hacia 0 desde positivo)
  const pagosPar = pagos.filter(
    p => (p.de === personaA && p.para === personaB) ||
         (p.de === personaB && p.para === personaA),
  )
  for (const p of pagosPar) {
    saldo += p.de === personaA ? p.monto : -p.monto
  }

  const acreedor = saldo >= 0 ? personaA : personaB
  const deudor   = saldo >= 0 ? personaB : personaA

  return { personaA, personaB, saldo, acreedor, deudor, monto: Math.abs(saldo), detalle, pagos: pagosPar }
}

export function calcularTodosSaldos(
  gastos: GastoCalculo[],
  pagos: PagoCalculo[] = [],
): SaldoPar[] {
  const personas = [...PERSONAS]
  const resultado: SaldoPar[] = []
  for (let i = 0; i < personas.length; i++) {
    for (let j = i + 1; j < personas.length; j++) {
      resultado.push(calcularSaldoPar(gastos, personas[i], personas[j], pagos))
    }
  }
  return resultado
}
