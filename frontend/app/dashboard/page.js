'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  Calendar
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            {isSeller 
              ? 'Manage your carbon credit listings and track your sales performance.'
              : 'Track your carbon credit purchases and environmental impact.'
            }
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isSeller ? (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Credits Listed</CardTitle>
                      <Leaf className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.totalCredits || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(stats.totalListings || 0)} active listings
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Credits Sold</CardTitle>
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.totalSold || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(stats.totalPurchases || 0)} transactions
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatCurrency(stats.soldValue || 0)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(stats.availableValue || 0)} available
                      </p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                      <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A'}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(stats.totalViews || 0)} total views
                      </p>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                      <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.totalTransactions || 0)}</div>
                      <p className="text-xs text-muted-foreground">
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
