import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import prisma from '@/lib/prisma'
import DashboardClient from '@/components/dashboard/dashboard-client'

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect('/auth/verify')
  }

  // Fetch user data with all relations
  const [user, currentAllotment, recentPurchases] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        preferences: true,
      }
    }),
    prisma.allotment.findFirst({
      where: {
        userId: session.user.id,
        periodStart: { lte: new Date() },
        periodEnd: { gte: new Date() }
      }
    }),
    prisma.purchase.findMany({
      where: { userId: session.user.id },
      include: {
        dispensary: true,
        items: true,
      },
      orderBy: { purchaseDate: 'desc' },
      take: 10,
    })
  ])

  if (!user) {
    redirect('/auth/verify')
  }

  // Calculate stats
  const totalSpent = recentPurchases.reduce((sum, p) => sum + p.totalAmount, 0)
  const avgPurchase = recentPurchases.length > 0 ? totalSpent / recentPurchases.length : 0

  return (
    <DashboardClient
      user={user}
      allotment={currentAllotment}
      purchases={recentPurchases}
      stats={{
        totalSpent,
        avgPurchase,
        purchaseCount: recentPurchases.length,
      }}
    />
  )
}