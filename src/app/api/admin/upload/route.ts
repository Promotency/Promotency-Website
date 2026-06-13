import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const filename = `${uuidv4()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Ensure directory exists
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (e) {
      // Ignore if exists
    }

    await writeFile(path.join(uploadDir, filename), buffer)
    
    const url = `/uploads/${filename}`
    
    const asset = await prisma.mediaAsset.create({
      data: {
        filename,
        originalName: file.name,
        url,
        type: file.type || 'application/octet-stream',
        size: file.size,
      }
    })

    const responseFile = {
      id: asset.id,
      url: asset.url,
      filename: asset.originalName,
      size: asset.size || 0,
      format: asset.type,
      createdAt: asset.createdAt.toISOString()
    }

    return NextResponse.json({ success: true, file: responseFile })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
