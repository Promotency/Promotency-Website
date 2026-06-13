import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const heroContent = await prisma.heroContent.findUnique({
      where: { id: 'default' }
    })
    return NextResponse.json({ heroContent: heroContent || {} })
  } catch (error) {
    console.error('Fetch hero content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json()
    const { id, ...updateData } = data

    const heroContent = await prisma.heroContent.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData }
    })

    return NextResponse.json({ success: true, heroContent })
  } catch (error) {
    console.error('Update hero content error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
