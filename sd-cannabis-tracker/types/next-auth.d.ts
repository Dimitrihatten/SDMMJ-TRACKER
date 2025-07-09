import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      medicalCardNumber: string
    } & DefaultSession['user']
  }

  interface User {
    id: string
    medicalCardNumber: string
    email?: string | null
    name?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    medicalCardNumber: string
  }
}