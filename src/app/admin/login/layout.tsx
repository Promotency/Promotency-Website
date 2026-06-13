// Login page bypasses the admin layout (no sidebar needed)
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
