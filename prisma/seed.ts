import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // 1. Create Super Admin user
  const hashedPassword = await bcrypt.hash('promotency@11123', 12)
  
  const admin = await prisma.adminUser.upsert({
    where: { email: 'Promotency' },
    update: {
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
    create: {
      name: 'Promotency',
      email: 'Promotency',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  })
  console.log('✅ Admin user created:', admin.email)

  // 2. Create Site Settings (Contact Info)
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      phone: '+91 9711123590',
      address: 'New Ashok Nagar, Delhi - 110096, India',
      email: 'contact@promotency.com',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14013.34440026214!2d77.3039!3d28.5898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce4f66a2b53b7%3A0xc3abcc10b0d6118f!2sNew%20Ashok%20Nagar%2C%20New%20Delhi%2C%20Delhi%20110096!5e0!3m2!1sen!2sin!4v1700000000000',
    },
    create: {
      id: 'default',
      siteName: 'Promotency',
      siteTagline: 'Results-Driven Digital Marketing Agency',
      siteDescription: 'Premium digital marketing, CGI ads, performance campaigns, branding, and web development.',
      email: 'contact@promotency.com',
      phone: '+91 9711123590',
      address: 'New Ashok Nagar, Delhi - 110096, India',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14013.34440026214!2d77.3039!3d28.5898!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390ce4f66a2b53b7%3A0xc3abcc10b0d6118f!2sNew%20Ashok%20Nagar%2C%20New%20Delhi%2C%20Delhi%20110096!5e0!3m2!1sen!2sin!4v1700000000000',
      ctaLabel: "Let's Talk",
    },
  })
  console.log('✅ Site settings created (Contact updated)')

  // 3. Create Home Page Hero Content
  await prisma.heroContent.upsert({
    where: { id: 'default' },
    update: {
      headline: 'We Build Brands That Drive Results',
      subheadline: 'Premium digital marketing, CGI ads, and performance campaigns that deliver measurable ROI for ambitious brands.',
      backgroundImage: '/images/hero-bg.png', // Demo static image
      backgroundVideo: '', // Empty means image is used
      isVideoEnabled: false,
    },
    create: {
      id: 'default',
      headline: 'We Build Brands That Drive Results',
      subheadline: 'Premium digital marketing, CGI ads, and performance campaigns that deliver measurable ROI for ambitious brands.',
      primaryCtaLabel: 'Start Your Project',
      primaryCtaUrl: '/contact',
      secondaryCtaLabel: 'View Our Work',
      secondaryCtaUrl: '/performance',
      backgroundImage: '/images/hero-bg.png',
      backgroundVideo: '',
      isVideoEnabled: false,
      badgeText: 'Award-Winning Digital Agency',
    },
  })
  console.log('✅ Home Page Hero content created')

  // 4. Create Performance Testimonials
  // Delete existing to prevent duplicates during seed rerun
  await prisma.testimonial.deleteMany()
  
  const testimonials = [
    {
      quote: 'Promotency transformed our digital presence completely. Our ROI doubled within 3 months and our brand recognition has never been stronger.',
      name: 'Sarah Mitchell',
      company: 'TechVentures Inc.',
      role: 'CMO',
      rating: 5,
      type: 'text',
      page: 'performance',
      order: 0,
    },
    {
      quote: 'The CGI ads they produced for us were absolutely stunning. We saw a 3x increase in social engagement and our conversion rate jumped 45%.',
      name: 'James Robertson',
      company: 'LuxeCommerce',
      role: 'Founder',
      rating: 5,
      type: 'text',
      page: 'performance',
      order: 1,
    },
    {
      quote: 'Their data-driven approach gives us complete transparency. We know exactly what every dollar is doing and we can see the ROI clearly.',
      name: 'James O\'Brien',
      company: 'GrowthStack',
      role: 'Founder',
      rating: 5,
      type: 'text',
      page: 'performance',
      order: 2,
    },
    {
      quote: 'We partnered with Promotency for our global rebranding, and the visual impact has been phenomenal. Our conversion rates are up 50% across the board.',
      name: 'Sophia Chen',
      company: 'LuxeVision',
      role: 'Marketing Director',
      rating: 5,
      type: 'image',
      mediaUrl: '/images/cgi-spotlight.png',
      page: 'performance',
      order: 3,
    },
    {
      quote: 'The performance marketing team is exceptional. They scaled our Meta Ads from $3K to $30K/month while maintaining 4.5x ROAS throughout. Here is my story.',
      name: 'Marcus Williams',
      company: 'ScaleFast',
      role: 'Head of Growth',
      rating: 5,
      type: 'video',
      mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Demo video URL
      page: 'performance',
      order: 4,
    },
  ]

  for (const t of testimonials) {
    await prisma.testimonial.create({ data: t })
  }
  console.log('✅ Performance Testimonials created (3 text, 1 image, 1 video)')

  // 5. Create Sample Blog Posts (Insights)
  // Delete existing to prevent duplicates during seed rerun
  await prisma.insightPost.deleteMany()
  await prisma.insightCategory.deleteMany()

  const category1 = await prisma.insightCategory.create({
    data: { name: 'Performance Marketing', slug: 'performance-marketing' }
  })
  const category2 = await prisma.insightCategory.create({
    data: { name: 'CGI & Branding', slug: 'cgi-branding' }
  })

  const posts = [
    {
      title: 'How to Scale Your Meta Ads in 2026',
      slug: 'how-to-scale-meta-ads',
      excerpt: 'Discover the ultimate strategies to scale your Facebook and Instagram ad campaigns while maintaining a healthy ROAS.',
      body: '<h2>The Secret to Scaling</h2><p>Scaling Meta ads requires a careful balance between budget increases and algorithm optimization. In this post, we cover the top 3 strategies that have helped our clients increase their ad spend 10x without sacrificing profitability.</p><p>First, focus on broad audience targeting. The algorithm is smarter than ever. Give it room to breathe.</p><h2>Creative is King</h2><p>Your media buying strategy is only as good as your creative. Invest in high-quality UGC and professional CGI ads to stand out.</p>',
      featuredImage: '/images/hero-bg.png',
      isDraft: false,
      categoryId: category1.id,
      publishedAt: new Date(),
    },
    {
      title: 'Why CGI Ads are the Future of Product Marketing',
      slug: 'why-cgi-ads-are-the-future',
      excerpt: 'Traditional product photography is dead. Learn how photorealistic CGI can elevate your brand and drive crazy engagement.',
      body: '<h2>Beyond Reality</h2><p>With CGI, the laws of physics no longer apply. You can showcase your product in impossible environments, exploding the components to show the inner workings, or simply placing it in a perfectly lit, dreamlike studio.</p><p>Our clients using CGI ads have seen a 300% increase in video retention rates compared to standard lifestyle shoots.</p>',
      featuredImage: '/images/cgi-spotlight.png',
      isDraft: false,
      categoryId: category2.id,
      publishedAt: new Date(),
    },
    {
      title: 'The Data-Driven Approach to B2B Lead Gen',
      slug: 'data-driven-b2b-lead-gen',
      excerpt: 'Generating high-quality B2B leads on LinkedIn requires more than just a whitepaper. It requires intent data and smart funnels.',
      body: '<h2>Finding the Right Audience</h2><p>B2B lead generation has shifted. It is no longer about gating every single piece of content. It is about creating demand first, and capturing it later.</p><p>By utilizing intent data providers and combining them with LinkedIn matched audiences, you can put your brand in front of decision-makers exactly when they are looking for a solution.</p>',
      featuredImage: '/images/p-logo.png',
      isDraft: false,
      categoryId: category1.id,
      publishedAt: new Date(),
    }
  ]

  for (const post of posts) {
    await prisma.insightPost.create({ data: post })
  }
  console.log('✅ 3 Sample Blog Posts created')

  console.log('\n🎉 Database seeded successfully!')
  console.log('\n📋 Admin Credentials:')
  console.log('   User ID: Promotency')
  console.log('   Password: promotency@11123')
  console.log('   Recovery Key: PRS@11123#')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
