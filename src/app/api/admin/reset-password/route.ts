import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { recoveryKey, newPassword } = await req.json()

    if (!recoveryKey || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const envRecoveryKey = process.env.RECOVERY_KEY

    if (!envRecoveryKey || recoveryKey !== envRecoveryKey) {
      return NextResponse.json({ error: 'Invalid recovery key' }, { status: 401 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    // Update the SUPER_ADMIN user
    const adminUser = await prisma.adminUser.findFirst({
      where: { role: 'SUPER_ADMIN' }
    })

    if (!adminUser) {
      return NextResponse.json({ error: 'Super Admin user not found' }, { status: 404 })
    }

    await prisma.adminUser.update({
      where: { id: adminUser.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
