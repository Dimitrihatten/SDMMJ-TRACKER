import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current allotment
    const currentAllotment = await prisma.allotment.findFirst({
      where: {
        userId: session.user.id,
        periodStart: { lte: new Date() },
        periodEnd: { gte: new Date() }
      }
    })

    if (!currentAllotment) {
      // Create new allotment period if none exists
      const periodStart = new Date()
      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + 30)

      const newAllotment = await prisma.allotment.create({
        data: {
          userId: session.user.id,
          periodStart,
          periodEnd,
          totalAllowedOz: 3.0,
          usedOz: 0,
          remainingOz: 3.0,
        }
      })

      return NextResponse.json(newAllotment)
    }

    // Check if allotment needs to be reset
    if (currentAllotment.periodEnd < new Date()) {
      // Create new period
      const periodStart = new Date()
      const periodEnd = new Date()
      periodEnd.setDate(periodEnd.getDate() + 30)

      const newAllotment = await prisma.allotment.create({
        data: {
          userId: session.user.id,
          periodStart,
          periodEnd,
          totalAllowedOz: 3.0,
          usedOz: 0,
          remainingOz: 3.0,
        }
      })

      return NextResponse.json(newAllotment)
    }

    return NextResponse.json(currentAllotment)
  } catch (error) {
    console.error('Allotment API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}