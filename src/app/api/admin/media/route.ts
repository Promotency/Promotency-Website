import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const assets = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' }
    })
    
    // Map to the expected frontend format
    const files = assets.map(a => ({
      id: a.id,
      url: a.url,
      filename: a.originalName,
      size: a.size || 0,
      format: a.type,
      createdAt: a.createdAt.toISOString()
    }))
    
    return NextResponse.json({ files })
  } catch (error) {
    console.error('Fetch media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    
    await prisma.mediaAsset.delete({ where: { id } })
    
    // In a real app, also delete the physical file/Cloudinary asset here.
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete media error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
