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
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  Leaf
} from 'lucide-react'
import { creditsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate, getStatusColor, getEnergyTypeColor } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

export default function CreditsPage() {
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [energyTypeFilter, setEnergyTypeFilter] = useState('')
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
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
    
    if (user?.role !== 'seller') {
      router.push('/dashboard')
      return
    }
    
    fetchCredits()
  }, [isAuthenticated, user, pagination.page, statusFilter, energyTypeFilter])

  const fetchCredits = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        energyType: energyTypeFilter,
        search: searchTerm
      }
      
      const response = await creditsAPI.getMyCredits(params)
      setCredits(response.data.data || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCredits()
  }

  const handleStatusFilter = (status) => {
    setStatusFilter(status)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleEnergyTypeFilter = (energyType) => {
    setEnergyTypeFilter(energyType)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setStatusFilter('')
    setEnergyTypeFilter('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const handleDeleteCredit = async (creditId) => {
    if (!confirm('Are you sure you want to delete this carbon credit? This action cannot be undone.')) {
      return
    }

    try {
      await creditsAPI.deleteCredit(creditId)
      toast.success('Carbon credit deleted successfully')
      fetchCredits()
    } catch (error) {
      console.error('Error deleting credit:', error)
      toast.error('Failed to delete carbon credit')
    }
  }

  const handleStatusChange = async (creditId, newStatus) => {
    try {
      await creditsAPI.updateCredit(creditId, { status: newStatus })
      toast.success('Status updated successfully')
      fetchCredits()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Failed to update status')
    }
  }

  if (!isAuthenticated || user?.role !== 'seller') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Carbon Credits</h1>
              <p className="text-gray-600 mt-2">
                Manage your carbon credit listings and track their performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/dashboard/credits/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  List New Credits
                </Button>
              </Link>
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
                    placeholder="Search your credits..."
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
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="sold-out">Sold Out</option>
                  <option value="suspended">Suspended</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Energy Type Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={energyTypeFilter}
                  onChange={(e) => handleEnergyTypeFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Energy Types</option>
                  <option value="solar">Solar</option>
                  <option value="wind">Wind</option>
                  <option value="hydro">Hydro</option>
                  <option value="geothermal">Geothermal</option>
                  <option value="biomass">Biomass</option>
                  <option value="nuclear">Nuclear</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Credits Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : credits.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {credits.map((credit) => (
              <Card key={credit._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className={getEnergyTypeColor(credit.energyType)}>
                      {credit.energyType}
                    </Badge>
                    <Badge className={getStatusColor(credit.status)}>
                      {credit.status}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {credit.title}
                  </CardTitle>
                  <CardDescription>
                    {credit.projectLocation?.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Available:</span>
                      <span className="font-medium">
                        {formatNumber(credit.availableCredits)} credits
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(credit.pricePerCredit)}/credit
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Value:</span>
                      <span className="font-medium">
                        {formatCurrency(credit.availableCredits * credit.pricePerCredit)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Views:</span>
                      <span className="font-medium">{formatNumber(credit.viewCount)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <div className="flex items-center">
                        <span className="font-medium mr-1">
                          {credit.averageRating?.toFixed(1) || 'N/A'}
                        </span>
                        <span className="text-gray-500">
                          ({formatNumber(credit.reviewCount || 0)} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Link href={`/marketplace/${credit._id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/dashboard/credits/${credit._id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteCredit(credit._id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(credit._id, 
                            credit.status === 'active' ? 'suspended' : 'active'
                          )}
                        >
                          {credit.status === 'active' ? 'Suspend' : 'Activate'}
                        </Button>
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
                No carbon credits found
              </h3>
              <p className="text-gray-600 mb-4">
                You haven't listed any carbon credits yet. Start by creating your first listing.
              </p>
              <Link href="/dashboard/credits/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  List Your First Credit
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
