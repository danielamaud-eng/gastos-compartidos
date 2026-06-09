import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.gasto.delete({ where: { id: parseInt(params.id) } })
  return NextResponse.json({ ok: true })
}
