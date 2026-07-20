import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const pagos = await prisma.pago.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(pagos)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const pago = await prisma.pago.create({
    data: {
      monto: body.monto,
      fecha: body.fecha,
      de: body.de,
      para: body.para,
      nota: body.nota || '',
    },
  })
  return NextResponse.json(pago, { status: 201 })
}
