'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LoadingSkeleton } from '@/components/ui/Loading'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Leaf, 
  ShoppingCart, 
  Plus,
  ArrowRight,
  Eye,
  Star,
  Calendar,
  Activity,
  Users,
  Award,
  BarChart3,
  PieChart,
  Target,
  Zap,
  Globe,
  Shield,
  Check
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'
import { creditsAPI, transactionsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({})
  const [recentCredits, setRecentCredits] = useState([])
  const [recentTransactions, setRecentTransactions] = useState([])

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    fetchDashboardData()
  }, [isAuthenticated, user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      if (user?.role === 'seller') {
        // Fetch seller-specific data
        const [statsRes, creditsRes] = await Promise.all([
          creditsAPI.getSellerStats(),
          creditsAPI.getMyCredits({ limit: 5 })
        ])
        
        setStats(statsRes.data.data || {})
        setRecentCredits(creditsRes.data.data || [])
      } else {
        // Fetch buyer-specific data
        const [statsRes, transactionsRes] = await Promise.all([
          transactionsAPI.getTransactionStats(),
          transactionsAPI.getTransactions({ limit: 5 })
        ])
        
        setStats(statsRes.data.data || {})
        setRecentTransactions(transactionsRes.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const isSeller = user?.role === 'seller'

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container-responsive py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex-mobile items-center justify-between">
            <div>
              <h1 className="heading-responsive font-bold text-gray-900">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-mobile text-gray-600 mt-2">
                {isSeller 
                  ? 'Manage your carbon credit listings and track your sales performance.'
                  : 'Track your carbon credit purchases and environmental impact.'
                }
              </p>
            </div>
            <div className="flex space-x-3 mt-4 sm:mt-0">
              <Button variant="outline" size="sm" className="button-mobile">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button size="sm" className="button-mobile">
                <Plus className="h-4 w-4 mr-2" />
                {isSeller ? 'List Credit' : 'Buy Credits'}
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid-mobile gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <LoadingSkeleton key={index} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid-mobile gap-6 mb-8">
              {isSeller ? (
                <>
                  <Card className="card-modern card-hover bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-green-700">Total Credits Listed</CardTitle>
                      <div className="p-2 bg-green-100 rounded-lg">
                        <Leaf className="h-4 w-4 text-green-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">{formatNumber(stats.totalCredits || 0)}</div>
                      <p className="text-xs text-green-600 flex items-center mt-1">
                        <Activity className="h-3 w-3 mr-1" />
                        {formatNumber(stats.totalListings || 0)} active listings
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-modern card-hover bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700">Credits Sold</CardTitle>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalSold || 0)}</div>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        {formatNumber(stats.totalPurchases || 0)} transactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-modern card-hover bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-purple-700">Total Revenue</CardTitle>
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <DollarSign className="h-4 w-4 text-purple-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.soldValue || 0)}</div>
                      <p className="text-xs text-purple-600 flex items-center mt-1">
                        <Target className="h-3 w-3 mr-1" />
                        {formatCurrency(stats.availableValue || 0)} available
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="card-modern card-hover bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-amber-700">Average Rating</CardTitle>
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <Star className="h-4 w-4 text-amber-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-900">
                        {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                      </div>
                      <p className="text-xs text-amber-600 flex items-center mt-1">
                        <Eye className="h-3 w-3 mr-1" />
                        {formatNumber(stats.totalViews || 0)} total views
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card className="card-modern card-hover bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-blue-700">Total Purchases</CardTitle>
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <ShoppingCart className="h-4 w-4 text-blue-600" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">{formatNumber(stats.totalTransactions || 0)}</div>
                      <p className="text-xs text-blue-600 flex items-center mt-1">
                        <Check className="h-3 w-3 mr-1" />
                        {formatNumber(stats.completedTransactions || 0)} completed
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Credits Purchased</CardTitle>
                      <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.totalCredits || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatCO2Impact(stats.totalCredits || 0)} CO₂ offset
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.totalVolume || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(stats.averageTransactionValue || 0)} avg per transaction
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
                      <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.pendingTransactions || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        Awaiting completion
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    {isSeller 
                      ? 'Manage your carbon credit listings and sales'
                      : 'Browse and purchase carbon credits'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {isSeller ? (
                    <>
                      <Link href="/dashboard/credits/create">
                        <Button className="w-full justify-start">
                          <Plus className="h-4 w-4 mr-2" />
                          List New Carbon Credits
                        </Button>
                      </Link>
                      <Link href="/dashboard/credits">
                        <Button variant="outline" className="w-full justify-start">
                          <Eye className="h-4 w-4 mr-2" />
                          Manage My Listings
                        </Button>
                      </Link>
                      <Link href="/dashboard/transactions">
                        <Button variant="outline" className="w-full justify-start">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View Sales History
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/marketplace">
                        <Button className="w-full justify-start">
                          <Leaf className="h-4 w-4 mr-2" />
                          Browse Carbon Credits
                        </Button>
                      </Link>
                      <Link href="/dashboard/transactions">
                        <Button variant="outline" className="w-full justify-start">
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          View Purchase History
                        </Button>
                      </Link>
                      <Link href="/dashboard/certificates">
                        <Button variant="outline" className="w-full justify-start">
                          <Star className="h-4 w-4 mr-2" />
                          My Certificates
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>
                    {isSeller 
                      ? 'Your latest carbon credit listings'
                      : 'Your recent carbon credit purchases'
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSeller ? (
                    recentCredits.length > 0 ? (
                      <div className="space-y-4">
                        {recentCredits.map((credit) => (
                          <div key={credit._id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{credit.title}</h4>
                              <p className="text-xs text-gray-600">
                                {credit.energyType} • {credit.projectLocation?.country}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={credit.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                                {credit.status}
                              </Badge>
                              <p className="text-xs text-gray-600 mt-1">
                                {formatNumber(credit.availableCredits)} available
                              </p>
                            </div>
                          </div>
                        ))}
                        <Link href="/dashboard/credits">
                          <Button variant="outline" size="sm" className="w-full">
                            View All Listings
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No listings yet</p>
                    )
                  ) : (
                    recentTransactions.length > 0 ? (
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div key={transaction._id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-medium text-sm">{transaction.carbonCredit?.title}</h4>
                              <p className="text-xs text-gray-600">
                                {transaction.quantity} credits • {formatDate(transaction.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge className={transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                                {transaction.status}
                              </Badge>
                              <p className="text-xs text-gray-600 mt-1">
                                {formatCurrency(transaction.totalAmount)}
                              </p>
                            </div>
                          </div>
                        ))}
                        <Link href="/dashboard/transactions">
                          <Button variant="outline" size="sm" className="w-full">
                            View All Transactions
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No transactions yet</p>
                    )
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
