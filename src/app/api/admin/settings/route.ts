import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' }
    })
    return NextResponse.json({ settings: settings || {} })
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Remove the id from the incoming payload so we don't try to update the primary key
    const { id, ...updateData } = data

    const settings = await prisma.siteSettings.upsert({
      where: { id: 'default' },
      update: updateData,
      create: { id: 'default', ...updateData }
    })

    return NextResponse.json({ success: true, settings })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
