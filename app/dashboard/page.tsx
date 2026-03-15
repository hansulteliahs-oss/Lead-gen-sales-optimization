// This page is a routing hub. Middleware redirects authenticated users to
// their role-specific dashboard before this page renders.
// If rendered, the user is authenticated but has an unknown role.
export default function DashboardPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500 text-sm">Redirecting...</p>
    </div>
  )
}
