import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { order: 'asc' }
    })
    return NextResponse.json({ testimonials })
  } catch (error) {
    console.error('Fetch testimonials error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const testimonial = await prisma.testimonial.create({
      data: {
        quote: data.quote,
        name: data.name,
        company: data.company,
        role: data.role,
        photo: data.photo || null,
        rating: data.rating || 5,
        type: data.type || 'text',
        mediaUrl: data.mediaUrl || null,
        page: data.page || 'performance',
        order: data.order || 0,
        isActive: data.isActive !== undefined ? data.isActive : true,
        isFeatured: data.isFeatured || false,
      }
    })
    return NextResponse.json({ success: true, testimonial })
  } catch (error) {
    console.error('Create testimonial error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json()
    const { id, ...updateData } = data
    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json({ success: true, testimonial })
  } catch (error) {
    console.error('Update testimonial error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    
    await prisma.testimonial.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete testimonial error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
