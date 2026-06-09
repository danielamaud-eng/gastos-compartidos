import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import ExcelJS from 'exceljs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const gastos = await prisma.gasto.findMany({ orderBy: { fecha: 'asc' } })

  const wb = new ExcelJS.Workbook()
  wb.creator = 'Gastos Compartidos'

  // Hoja 1: todos los gastos
  const ws1 = wb.addWorksheet('Gastos')
  ws1.columns = [
    { header: 'Fecha', key: 'fecha', width: 14 },
    { header: 'Categoría', key: 'categoria', width: 18 },
    { header: 'Monto', key: 'monto', width: 14 },
    { header: 'Tipo', key: 'tipo', width: 16 },
    { header: 'Nota', key: 'nota', width: 35 },
  ]
  ws1.getRow(1).font = { bold: true }
  ws1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE3F2FD' } }

  gastos.forEach(g => {
    ws1.addRow({
      fecha: g.fecha,
      categoria: g.categoria,
      monto: g.monto,
      tipo: g.tipo === 'solo_mia' ? 'Solo mía' : 'A medias',
      nota: g.nota,
    })
  })
  ws1.getColumn('monto').numFmt = '#,##0'

  // Hoja 2: balance y desglose
  const ws2 = wb.addWorksheet('Balance')
  ws2.columns = [
    { header: 'Concepto', key: 'concepto', width: 32 },
    { header: 'Monto', key: 'monto', width: 18 },
  ]
  ws2.getRow(1).font = { bold: true }
  ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } }

  const totalSoloMia = gastos.filter(g => g.tipo === 'solo_mia').reduce((s, g) => s + g.monto, 0)
  const totalAMedias = gastos.filter(g => g.tipo === 'a_medias').reduce((s, g) => s + g.monto, 0)

  ws2.addRow({ concepto: 'Total gastos solo mía', monto: totalSoloMia })
  ws2.addRow({ concepto: 'Total gastos a medias', monto: totalAMedias })
  ws2.addRow({ concepto: 'Él te debe (50% de a medias)', monto: totalAMedias / 2 })
  ws2.addRow({ concepto: 'Total general', monto: totalSoloMia + totalAMedias })
  ws2.addRow([])

  const separador = ws2.addRow({ concepto: 'DESGLOSE POR CATEGORÍA' })
  separador.font = { bold: true }

  const porCat = gastos.reduce((acc, g) => {
    acc[g.categoria] = (acc[g.categoria] || 0) + g.monto
    return acc
  }, {} as Record<string, number>)

  Object.entries(porCat)
    .sort(([, a], [, b]) => b - a)
    .forEach(([cat, total]) => ws2.addRow({ concepto: cat, monto: total }))

  ws2.getColumn('monto').numFmt = '#,##0'

  const buffer = await wb.xlsx.writeBuffer()
  const fecha = new Date().toISOString().split('T')[0]

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="gastos-${fecha}.xlsx"`,
    },
  })
}
