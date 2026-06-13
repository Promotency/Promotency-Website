import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const posts = await prisma.insightPost.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ posts })
  } catch (error) {
    console.error('Fetch posts error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    // Simple slug generator from title
    const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.random().toString(36).substring(2, 6)

    const post = await prisma.insightPost.create({
      data: {
        title: data.title,
        slug: slug,
        body: data.body,
        featuredImage: data.featuredImage || null,
        excerpt: data.excerpt || null,
        isDraft: data.isDraft ?? false,
        publishedAt: data.isDraft ? null : new Date(),
        metaTitle: data.metaTitle || null,
        metaDesc: data.metaDesc || null,
      }
    })
    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json()
    const { id, ...updateData } = data
    if (updateData.isDraft === false && !updateData.publishedAt) {
      updateData.publishedAt = new Date()
    } else if (updateData.isDraft === true) {
      updateData.publishedAt = null
    }

    const post = await prisma.insightPost.update({
      where: { id },
      data: updateData
    })
    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error('Update post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })
    
    await prisma.insightPost.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete post error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
