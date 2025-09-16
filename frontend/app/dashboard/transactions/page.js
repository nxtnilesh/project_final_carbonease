'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Star,
  Calendar,
  DollarSign,
  Leaf,
  TrendingUp,
  TrendingDown,
  MoreHorizontal
} from 'lucide-react'
import { transactionsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate, getStatusColor } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    fetchTransactions()
  }, [isAuthenticated, pagination.page, statusFilter, dateFilter])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        dateRange: dateFilter,
        search: searchTerm
      }
      
      const response = await transactionsAPI.getTransactions(params)
      setTransactions(response.data.data || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchTransactions()
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleDateFilter = (dateRange) => {
    setDateFilter(dateRange)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setDateFilter('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const exportTransactions = () => {
    // In a real implementation, this would export the transactions to CSV/PDF
    alert('Export functionality would be implemented here')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Calendar className="h-4 w-4 text-yellow-600" />
      case 'cancelled':
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <Calendar className="h-4 w-4 text-gray-600" />
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
              <p className="text-gray-600 mt-2">
                {user?.role === 'seller' 
                  ? 'Track your carbon credit sales and revenue'
                  : 'View your carbon credit purchase history'
                }
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={exportTransactions}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Link href="/dashboard">
                <Button variant="outline">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <form onSubmit={handleSearch} className="flex">
                  <Input
                    placeholder="Search transactions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Date Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={dateFilter}
                  onChange={(e) => handleDateFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-48"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction._id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <Leaf className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {transaction.carbonCredit?.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>Transaction #{transaction.transactionRef}</span>
                          <span>•</span>
                          <span>{formatDate(transaction.createdAt)}</span>
                          {user?.role === 'buyer' && (
                            <>
                              <span>•</span>
                              <span>Seller: {transaction.seller?.firstName} {transaction.seller?.lastName}</span>
                            </>
                          )}
                          {user?.role === 'seller' && (
                            <>
                              <span>•</span>
                              <span>Buyer: {transaction.buyer?.firstName} {transaction.buyer?.lastName}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatNumber(transaction.quantity)} credits
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCO2Impact(transaction.quantity)}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="font-semibold text-green-600">
                          {formatCurrency(transaction.totalAmount, transaction.currency)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatCurrency(transaction.totalAmount / transaction.quantity, transaction.currency)}/credit
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(transaction.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(transaction.status)}
                            <span>{transaction.status}</span>
                          </div>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link href={`/dashboard/transactions/${transaction._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Details */}
                  <div className="mt-4 pt-4 border-t">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Energy Type:</span>
                        <span className="ml-2 font-medium capitalize">
                          {transaction.carbonCredit?.energyType}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Location:</span>
                        <span className="ml-2 font-medium">
                          {transaction.carbonCredit?.projectLocation?.country}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Certification:</span>
                        <span className="ml-2 font-medium">
                          {transaction.carbonCredit?.certification?.standard}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No transactions found
              </h3>
              <p className="text-gray-600 mb-4">
                {user?.role === 'seller' 
                  ? "You haven't sold any carbon credits yet."
                  : "You haven't purchased any carbon credits yet."
                }
              </p>
              <Link href="/marketplace">
                <Button>
                  {user?.role === 'seller' ? 'List Carbon Credits' : 'Browse Marketplace'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              {[...Array(pagination.totalPages)].map((_, index) => {
                const page = index + 1
                if (
                  page === 1 ||
                  page === pagination.totalPages ||
                  (page >= pagination.page - 1 && page <= pagination.page + 1)
                ) {
                  return (
                    <Button
                      key={page}
                      variant={page === pagination.page ? "default" : "outline"}
                      onClick={() => handlePageChange(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  )
                } else if (
                  page === pagination.page - 2 ||
                  page === pagination.page + 2
                ) {
                  return <span key={page} className="px-2">...</span>
                }
                return null
              })}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
