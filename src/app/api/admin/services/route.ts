import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.service.findMany({
      orderBy: { order: 'asc' }
    })
    
    // Parse the JSON string arrays for frontend
    const parsedServices = services.map(s => ({
      ...s,
      inclusions: JSON.parse(s.inclusions || '[]')
    }))
    
    return NextResponse.json({ services: parsedServices })
  } catch (error) {
    console.error('Fetch services error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { services } = body
    
    if (!services || !Array.isArray(services)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    // Update each service sequentially to maintain order and data
    for (const service of services) {
      await prisma.service.update({
        where: { id: service.id },
        data: {
          title: service.title,
          slug: service.slug,
          shortDesc: service.shortDesc,
          description: service.description,
          heroHeadline: service.heroHeadline || null,
          heroSubheadline: service.heroSubheadline || null,
          order: service.order,
          isActive: service.isActive,
          inclusions: JSON.stringify(service.inclusions || [])
        }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update services error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
