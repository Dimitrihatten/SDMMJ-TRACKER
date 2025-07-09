'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  Leaf, 
  ShoppingCart, 
  TrendingUp, 
  Calendar, 
  MapPin, 
  DollarSign,
  Package,
  AlertCircle,
  Search,
  Bot
} from 'lucide-react'
import { formatCurrency, formatDate, calculateDaysUntilReset, calculateAllotmentPercentage, getAllotmentStatus } from '@/lib/utils'
import { AllotmentChart } from '@/components/charts/allotment-chart'
import { SpendingChart } from '@/components/charts/spending-chart'
import { PurchaseTable } from '@/components/tables/purchase-table'
import { ProductSearch } from '@/components/product-search'
import { AIAssistant } from '@/components/ai-assistant'
import { useToast } from '@/components/ui/use-toast'
import Pusher from 'pusher-js'

interface DashboardClientProps {
  user: any
  allotment: any
  purchases: any[]
  stats: {
    totalSpent: number
    avgPurchase: number
    purchaseCount: number
  }
}

export default function DashboardClient({ user, allotment, purchases, stats }: DashboardClientProps) {
  const [selectedCity, setSelectedCity] = useState(user.preferences?.preferredCity || 'All')
  const [searchOpen, setSearchOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const { toast } = useToast()

  // Real-time updates with Pusher
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_APP_KEY) return

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY, {
      cluster: process.env.PUSHER_CLUSTER || 'us2',
    })

    const channel = pusher.subscribe(`user-${user.id}`)
    
    channel.bind('purchase-update', (data: any) => {
      toast({
        title: "New Purchase Recorded",
        description: `Purchase at ${data.dispensaryName} has been added to your history.`,
      })
      // Trigger a refresh or update state
      window.location.reload()
    })

    channel.bind('allotment-warning', (data: any) => {
      toast({
        title: "Allotment Warning",
        description: data.message,
        variant: "destructive",
      })
    })

    return () => {
      pusher.unsubscribe(`user-${user.id}`)
      pusher.disconnect()
    }
  }, [user.id, toast])

  const allotmentPercentage = allotment ? calculateAllotmentPercentage(allotment.usedOz, allotment.totalAllowedOz) : 0
  const allotmentStatus = getAllotmentStatus(allotmentPercentage)
  const daysUntilReset = allotment ? calculateDaysUntilReset(allotment.periodEnd) : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Leaf className="h-8 w-8 text-cannabis-600" />
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {user.name || 'Patient'}</h1>
                <p className="text-sm text-muted-foreground">Card: {user.medicalCardNumber}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setSearchOpen(true)}>
                <Search className="h-4 w-4 mr-2" />
                Search Products
              </Button>
              <Button variant="outline" onClick={() => setAiOpen(true)}>
                <Bot className="h-4 w-4 mr-2" />
                AI Assistant
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Allotment Overview */}
        <div className="grid gap-6 mb-8">
          <Card className="border-2 border-cannabis-200 bg-cannabis-50/30">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">Current Allotment</CardTitle>
                  <CardDescription>
                    {allotment ? `${formatDate(allotment.periodStart)} - ${formatDate(allotment.periodEnd)}` : 'No active period'}
                  </CardDescription>
                </div>
                <Badge className={allotmentStatus.color.replace('text-', 'bg-').replace('600', '100')}>
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {allotmentStatus.message}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Used: {allotment?.usedOz.toFixed(2) || 0} oz</span>
                    <span>Remaining: {allotment?.remainingOz.toFixed(2) || 0} oz</span>
                  </div>
                  <Progress value={allotmentPercentage} className="h-3" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">
                    {daysUntilReset} days until reset
                  </p>
                  <p className="text-lg font-semibold">
                    {allotmentPercentage}% used
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalSpent)}</div>
              <p className="text-xs text-muted-foreground">This period</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Purchase</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.avgPurchase)}</div>
              <p className="text-xs text-muted-foreground">{stats.purchaseCount} purchases</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preferred City</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Cities</SelectItem>
                  <SelectItem value="Rapid City">Rapid City</SelectItem>
                  <SelectItem value="Sioux Falls">Sioux Falls</SelectItem>
                  <SelectItem value="Aberdeen">Aberdeen</SelectItem>
                  <SelectItem value="Brookings">Brookings</SelectItem>
                  <SelectItem value="Watertown">Watertown</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="purchases" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="purchases">Purchase History</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="dispensaries">Dispensaries</TabsTrigger>
          </TabsList>

          <TabsContent value="purchases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Your last 10 cannabis purchases</CardDescription>
              </CardHeader>
              <CardContent>
                <PurchaseTable purchases={purchases} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Allotment Usage</CardTitle>
                  <CardDescription>30-day rolling usage pattern</CardDescription>
                </CardHeader>
                <CardContent>
                  <AllotmentChart data={purchases} />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Spending Trends</CardTitle>
                  <CardDescription>Monthly spending breakdown</CardDescription>
                </CardHeader>
                <CardContent>
                  <SpendingChart data={purchases} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dispensaries" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Featured Dispensaries</CardTitle>
                    <CardDescription>
                      Top-rated dispensaries in {selectedCity === 'All' ? 'South Dakota' : selectedCity}
                    </CardDescription>
                  </div>
                  <Button variant="outline">
                    <MapPin className="h-4 w-4 mr-2" />
                    View Map
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Genesis Farms</h3>
                      <p className="text-sm text-muted-foreground">Rapid City • 4.8★ • Premium Edibles</p>
                    </div>
                    <Button size="sm">View Menu</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Puffy&apos;s Dispensary</h3>
                      <p className="text-sm text-muted-foreground">Sioux Falls • 4.7★ • Best Prices</p>
                    </div>
                    <Button size="sm">View Menu</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Trilly Club LLC</h3>
                      <p className="text-sm text-muted-foreground">Multiple Locations • 5.0★ • Featured Partner</p>
                    </div>
                    <Button size="sm" className="gradient-cannabis text-white">View Menu</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Product Search Modal */}
      <ProductSearch 
        open={searchOpen} 
        onOpenChange={setSearchOpen}
        selectedCity={selectedCity}
      />

      {/* AI Assistant Modal */}
      <AIAssistant
        open={aiOpen}
        onOpenChange={setAiOpen}
        user={user}
      />
    </div>
  )
}