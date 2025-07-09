import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaClient } from '@prisma/client'
import { verifyMedicalCard } from './medical-verify'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Medical Card',
      credentials: {
        medicalCardNumber: { 
          label: "Medical Card Number", 
          type: "text",
          placeholder: "e.g., 4YBPK2GJ2"
        },
      },
      async authorize(credentials) {
        if (!credentials?.medicalCardNumber) {
          throw new Error('Medical card number is required')
        }

        try {
          // Verify the medical card with SD API
          const isValid = await verifyMedicalCard(credentials.medicalCardNumber)
          
          if (!isValid) {
            throw new Error('Invalid medical card number')
          }

          // Find or create user
          let user = await prisma.user.findUnique({
            where: { medicalCardNumber: credentials.medicalCardNumber }
          })

          if (!user) {
            user = await prisma.user.create({
              data: {
                medicalCardNumber: credentials.medicalCardNumber,
                lastVerified: new Date(),
              }
            })

            // Create initial allotment
            const periodStart = new Date()
            const periodEnd = new Date()
            periodEnd.setDate(periodEnd.getDate() + 30)

            await prisma.allotment.create({
              data: {
                userId: user.id,
                periodStart,
                periodEnd,
                totalAllowedOz: 3.0,
                usedOz: 0,
                remainingOz: 3.0,
              }
            })
          } else {
            // Update last verified
            await prisma.user.update({
              where: { id: user.id },
              data: { lastVerified: new Date() }
            })
          }

          return {
            id: user.id,
            medicalCardNumber: user.medicalCardNumber,
            email: user.email,
            name: user.name,
          }
        } catch (error) {
          console.error('Authentication error:', error)
          throw new Error('Authentication failed')
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.medicalCardNumber = user.medicalCardNumber
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.medicalCardNumber = token.medicalCardNumber as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/verify',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}