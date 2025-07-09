import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Leaf, Shield, BarChart3, Clock, MapPin, Smartphone } from 'lucide-react'

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cannabis-50 to-white">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Leaf className="h-8 w-8 text-cannabis-600" />
            <span className="text-2xl font-bold text-gray-900">SD Cannabis Tracker</span>
          </div>
          <Link href="/auth/verify">
            <Button className="gradient-cannabis text-white">
              Patient Login
            </Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="mb-6 text-5xl font-bold text-gray-900">
          South Dakota Medical Cannabis
          <span className="block text-cannabis-600">Patient Tracker</span>
        </h1>
        <p className="mb-8 text-xl text-gray-600 max-w-2xl mx-auto">
          Track your allotment, compare dispensary prices, and manage your medical cannabis purchases - all in one secure, HIPAA-compliant platform.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/verify">
            <Button size="lg" className="gradient-cannabis text-white">
              Get Started with Your Medical Card
            </Button>
          </Link>
          <Link href="/about">
            <Button size="lg" variant="outline">
              Learn More
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need in One Place</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="card-hover">
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-cannabis-600 mb-4" />
              <CardTitle>Real-Time Allotment Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Monitor your 3oz monthly limit with live updates. Know exactly how much you&apos;ve purchased and when your allotment resets.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <MapPin className="h-10 w-10 text-cannabis-600 mb-4" />
              <CardTitle>Compare Dispensary Prices</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Find the best deals across Rapid City, Sioux Falls, and other SD cities. Real-time inventory from Genesis Farms, Puffy&apos;s, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Shield className="h-10 w-10 text-cannabis-600 mb-4" />
              <CardTitle>HIPAA-Compliant Security</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Your medical information is protected with AES-256 encryption and SOC 2 certified security standards.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Clock className="h-10 w-10 text-cannabis-600 mb-4" />
              <CardTitle>Purchase History & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Track spending trends, view detailed purchase history, and get personalized recommendations based on your preferences.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Smartphone className="h-10 w-10 text-cannabis-600 mb-4" />
              <CardTitle>24/7 AI Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get instant answers about products, dosing, and South Dakota cannabis regulations from our intelligent assistant.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <Leaf className="h-10 w-10 text-cannabis-600 mb-4" />
              <CardTitle>Featured Products & Deals</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Discover new products and exclusive deals from verified South Dakota dispensaries. Edibles only - fully compliant with state law.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-cannabis-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Take Control of Your Medical Cannabis?</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of South Dakota patients who trust our platform for accurate tracking and the best dispensary deals.
          </p>
          <Link href="/auth/verify">
            <Button size="lg" className="gradient-cannabis text-white">
              Verify Your Medical Card Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">SD Cannabis Tracker</h3>
              <p className="text-gray-400">
                A product of Trilly Club LLC
                <br />
                Founded 2025
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/legal/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/legal/hipaa" className="hover:text-white">HIPAA Compliance</Link></li>
                <li><Link href="/legal/cookies" className="hover:text-white">Cookie Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/api-docs" className="hover:text-white">API Documentation</Link></li>
                <li><Link href="/status" className="hover:text-white">System Status</Link></li>
                <li><Link href="/mobile" className="hover:text-white">Mobile Apps</Link></li>
                <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Get Your Card</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/cards/resident" className="hover:text-white">SD Resident Card</Link></li>
                <li><Link href="/cards/caregiver" className="hover:text-white">Caregiver Card</Link></li>
                <li><Link href="/cards/nonresident" className="hover:text-white">Non-Resident Card</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2025 Trilly Club LLC. All rights reserved. | 18+ Only | Medical Use Only</p>
          </div>
        </div>
      </footer>
    </div>
  )
}