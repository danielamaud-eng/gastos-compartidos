import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const gastos = await prisma.gasto.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(gastos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const gasto = await prisma.gasto.create({
    data: {
      monto: body.monto,
      categoria: body.categoria,
      fecha: body.fecha,
      nota: body.nota || '',
      comprobante: body.comprobante || '',
      tipo: body.tipo,
    },
  })
  return NextResponse.json(gasto, { status: 201 })
}
