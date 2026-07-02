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
  // Desde la perspectiva de personaA:
  // positivo → personaB le debe a personaA por este gasto
  // negativo → personaA le debe a personaB por este gasto
  aporte: number
}

export type SaldoPar = {
  personaA: string
  personaB: string
  // Saldo neto desde perspectiva de personaA.
  // positivo → personaB le debe a personaA
  // negativo → personaA le debe a personaB
  saldo: number
  acreedor: string // quien recibe
  deudor: string   // quien paga
  monto: number    // siempre positivo
  detalle: DetalleGasto[]
}

/**
 * Calcula el saldo neto entre dos personas dado el listado de gastos.
 * El netting es automático: si cada uno le debe algo al otro, se resta
 * y queda una única deuda neta.
 */
export function calcularSaldoPar(
  gastos: GastoCalculo[],
  personaA: string,
  personaB: string,
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

  const acreedor = saldo >= 0 ? personaA : personaB
  const deudor   = saldo >= 0 ? personaB : personaA

  return { personaA, personaB, saldo, acreedor, deudor, monto: Math.abs(saldo), detalle }
}

/**
 * Calcula saldos para todos los pares de personas.
 * Escalable a más de 2 usuarios.
 */
export function calcularTodosSaldos(gastos: GastoCalculo[]): SaldoPar[] {
  const personas = [...PERSONAS]
  const resultado: SaldoPar[] = []
  for (let i = 0; i < personas.length; i++) {
    for (let j = i + 1; j < personas.length; j++) {
      resultado.push(calcularSaldoPar(gastos, personas[i], personas[j]))
    }
  }
  return resultado
}
