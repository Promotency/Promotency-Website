import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import fs from 'fs'
import path from 'path'

export async function GET(request: Request) {
  // Very basic security check: require a setupKey query param
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('setupKey')
  
  // Hardcoded key for this one-time setup
  if (key !== 'promotency-db-migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const backupPath = path.join(process.cwd(), 'data-backup.json')
    if (!fs.existsSync(backupPath)) {
      return NextResponse.json({ error: 'data-backup.json not found' }, { status: 404 })
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'))
    
    // Check if db is already populated
    const existingUsers = await prisma.adminUser.count()
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database is already populated.' })
    }

    console.log("Starting data migration...")

    // Insert data table by table
    if (backupData.AdminUser) await prisma.adminUser.createMany({ data: backupData.AdminUser })
    if (backupData.SiteSettings) await prisma.siteSettings.createMany({ data: backupData.SiteSettings })
    if (backupData.HeroContent) await prisma.heroContent.createMany({ data: backupData.HeroContent })
    if (backupData.Stat) await prisma.stat.createMany({ data: backupData.Stat })
    if (backupData.CaseStudy) await prisma.caseStudy.createMany({ data: backupData.CaseStudy })
    
    // Services have relations, so we insert them carefully
    if (backupData.Service) {
      for (const service of backupData.Service) {
        const faqs = service.faqs || []
        const procesSteps = service.procesSteps || []
        
        // Remove relation arrays for create
        delete service.faqs
        delete service.procesSteps
        
        await prisma.service.create({ data: service })
        
        if (faqs.length > 0) await prisma.serviceFAQ.createMany({ data: faqs })
        if (procesSteps.length > 0) await prisma.processStep.createMany({ data: procesSteps })
      }
    }

    if (backupData.WhyUsEntry) await prisma.whyUsEntry.createMany({ data: backupData.WhyUsEntry })
    if (backupData.TeamMember) await prisma.teamMember.createMany({ data: backupData.TeamMember })
    if (backupData.Testimonial) await prisma.testimonial.createMany({ data: backupData.Testimonial })
    if (backupData.ClientLogo) await prisma.clientLogo.createMany({ data: backupData.ClientLogo })
    if (backupData.PerformanceMetric) await prisma.performanceMetric.createMany({ data: backupData.PerformanceMetric })
    if (backupData.InsightCategory) await prisma.insightCategory.createMany({ data: backupData.InsightCategory })
    if (backupData.InsightTag) await prisma.insightTag.createMany({ data: backupData.InsightTag })
    if (backupData.InsightAuthor) await prisma.insightAuthor.createMany({ data: backupData.InsightAuthor })
    
    // Posts have relations
    if (backupData.InsightPost) {
      for (const post of backupData.InsightPost) {
        const tags = post.tags || []
        delete post.tags
        await prisma.insightPost.create({ data: post })
        
        // Connect tags (many-to-many)
        for (const tag of tags) {
           await prisma.insightPost.update({
             where: { id: post.id },
             data: { tags: { connect: { id: tag.id } } }
           })
        }
      }
    }

    if (backupData.JobPosting) await prisma.jobPosting.createMany({ data: backupData.JobPosting })
    if (backupData.JobApplication) await prisma.jobApplication.createMany({ data: backupData.JobApplication })
    if (backupData.Lead) await prisma.lead.createMany({ data: backupData.Lead })
    if (backupData.MediaAsset) await prisma.mediaAsset.createMany({ data: backupData.MediaAsset })

    return NextResponse.json({ message: 'Migration completed successfully!' })
  } catch (error) {
    console.error('Migration failed:', error)
    return NextResponse.json({ error: 'Migration failed', details: String(error) }, { status: 500 })
  }
}
