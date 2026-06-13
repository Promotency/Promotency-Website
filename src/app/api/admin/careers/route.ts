import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    if (type === 'applications') {
      const status = searchParams.get('status')
      const where: any = {}
      if (status && status !== 'all') where.status = status

      const applications = await prisma.jobApplication.findMany({
        where,
        include: { job: { select: { title: true, department: true } } },
        orderBy: { createdAt: 'desc' },
      })
      return NextResponse.json({ applications })
    }

    // Default to jobs
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: 'desc' },
    })
    
    // Parse requirements from string to array for frontend
    const parsedJobs = jobs.map(job => ({
      ...job,
      requirements: JSON.parse(job.requirements || '[]')
    }))
    
    return NextResponse.json({ jobs: parsedJobs })
  } catch (error) {
    console.error('Fetch careers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    const { title, department, location, type, description, requirements } = data

    if (!title || !department || !location || !type || !description) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const job = await prisma.jobPosting.create({
      data: {
        title, department, location, type, description, 
        requirements: JSON.stringify(requirements || []),
      },
    })

    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error('Create job error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const data = await req.json()

    if (type === 'application') {
      const { id, status } = data
      const app = await prisma.jobApplication.update({
        where: { id },
        data: { status },
      })
      return NextResponse.json({ success: true, application: app })
    }

    // Default to job update
    const { id, ...updateData } = data
    if (updateData.requirements) {
      updateData.requirements = JSON.stringify(updateData.requirements)
    }

    const job = await prisma.jobPosting.update({
      where: { id },
      data: updateData,
    })
    return NextResponse.json({ success: true, job })
  } catch (error) {
    console.error('Update careers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    if (type === 'application') {
      await prisma.jobApplication.delete({ where: { id } })
    } else {
      // Cascade delete applications first
      await prisma.jobApplication.deleteMany({ where: { jobId: id } })
      await prisma.jobPosting.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete careers error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
