import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AdminLayoutClient from './AdminLayoutClient'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  
  if (!session) {
    redirect('/admin/login')
  }

  return (
    <AdminLayoutClient session={session}>
      {children}
    </AdminLayoutClient>
  )
}
