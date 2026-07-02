import { describe, it, expect } from 'vitest'
import { calcularSaldoPar, calcularTodosSaldos } from './calcularSaldos'

const A = 'Daniela'
const B = 'Cristian'

function gasto(overrides: Partial<{
  id: number; monto: number; tipo: string; pagadoPor: string
  fecha: string; categoria: string; nota: string
}>) {
  return { id: 1, monto: 100, tipo: 'a_medias', pagadoPor: A,
    fecha: '2026-01-01', categoria: 'Otros', nota: '', ...overrides }
}

describe('calcularSaldoPar', () => {
  it('sin gastos → saldo cero', () => {
    const r = calcularSaldoPar([], A, B)
    expect(r.saldo).toBe(0)
    expect(r.monto).toBe(0)
    expect(r.detalle).toHaveLength(0)
  })

  it('a_medias pagado por A → B debe la mitad', () => {
    const r = calcularSaldoPar([gasto({ monto: 200, pagadoPor: A })], A, B)
    expect(r.saldo).toBe(100)
    expect(r.acreedor).toBe(A)
    expect(r.deudor).toBe(B)
    expect(r.detalle[0].aporte).toBe(100)
  })

  it('a_medias pagado por B → A debe la mitad', () => {
    const r = calcularSaldoPar([gasto({ monto: 200, pagadoPor: B })], A, B)
    expect(r.saldo).toBe(-100)
    expect(r.acreedor).toBe(B)
    expect(r.deudor).toBe(A)
    expect(r.monto).toBe(100)
  })

  it('cargo_total pagado por A → B debe el total', () => {
    const r = calcularSaldoPar(
      [gasto({ monto: 300, tipo: 'cargo_total', pagadoPor: A })], A, B,
    )
    expect(r.saldo).toBe(300)
    expect(r.detalle[0].aporte).toBe(300)
  })

  it('cargo_total pagado por B → A debe el total', () => {
    const r = calcularSaldoPar(
      [gasto({ monto: 300, tipo: 'cargo_total', pagadoPor: B })], A, B,
    )
    expect(r.saldo).toBe(-300)
    expect(r.acreedor).toBe(B)
  })

  it('solo_mia se ignora en el saldo compartido', () => {
    const r = calcularSaldoPar(
      [gasto({ monto: 500, tipo: 'solo_mia', pagadoPor: A })], A, B,
    )
    expect(r.saldo).toBe(0)
    expect(r.detalle).toHaveLength(0)
  })

  it('netting cruzado: B debe $100, A debe $60 → saldo neto $40 a favor de A', () => {
    const gastos = [
      gasto({ id: 1, monto: 200, tipo: 'a_medias', pagadoPor: A }), // B debe 100
      gasto({ id: 2, monto: 120, tipo: 'a_medias', pagadoPor: B }), // A debe 60
    ]
    const r = calcularSaldoPar(gastos, A, B)
    expect(r.saldo).toBe(40)
    expect(r.acreedor).toBe(A)
    expect(r.deudor).toBe(B)
    expect(r.monto).toBe(40)
    expect(r.detalle).toHaveLength(2)
  })

  it('netting exacto: saldo cero cuando ambos deben lo mismo', () => {
    const gastos = [
      gasto({ id: 1, monto: 100, tipo: 'a_medias', pagadoPor: A }),
      gasto({ id: 2, monto: 100, tipo: 'a_medias', pagadoPor: B }),
    ]
    const r = calcularSaldoPar(gastos, A, B)
    expect(r.saldo).toBe(0)
    expect(r.monto).toBe(0)
  })

  it('mix a_medias + cargo_total neteados', () => {
    const gastos = [
      gasto({ id: 1, monto: 100, tipo: 'cargo_total', pagadoPor: A }), // B debe 100
      gasto({ id: 2, monto: 200, tipo: 'a_medias',   pagadoPor: B }), // A debe 100
    ]
    const r = calcularSaldoPar(gastos, A, B)
    expect(r.saldo).toBe(0)
  })

  it('gastos de terceros (pagadoPor vacío) se ignoran', () => {
    const r = calcularSaldoPar(
      [gasto({ monto: 1000, pagadoPor: '' })], A, B,
    )
    expect(r.saldo).toBe(0)
  })

  it('detalle refleja aporte individual de cada gasto', () => {
    const gastos = [
      gasto({ id: 1, monto: 100, tipo: 'a_medias',   pagadoPor: A }),
      gasto({ id: 2, monto: 60,  tipo: 'cargo_total', pagadoPor: A }),
    ]
    const r = calcularSaldoPar(gastos, A, B)
    const aportes = r.detalle.map(d => d.aporte)
    expect(aportes).toEqual([50, 60])
    expect(r.saldo).toBe(110)
  })
})

describe('calcularTodosSaldos', () => {
  it('retorna un par Daniela-Cristian', () => {
    const saldos = calcularTodosSaldos([])
    expect(saldos).toHaveLength(1)
    expect(saldos[0].personaA).toBe('Daniela')
    expect(saldos[0].personaB).toBe('Cristian')
  })

  it('el saldo del par es consistente con calcularSaldoPar', () => {
    const gastos = [gasto({ monto: 200, pagadoPor: A })]
    const [par] = calcularTodosSaldos(gastos)
    const directo = calcularSaldoPar(gastos, A, B)
    expect(par.saldo).toBe(directo.saldo)
  })
})
