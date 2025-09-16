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
  Download, 
  Search, 
  Filter, 
  Award,
  Calendar,
  MapPin,
  Leaf,
  Eye,
  Share2
} from 'lucide-react'
import { transactionsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

export default function CertificatesPage() {
  const [certificates, setCertificates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [yearFilter, setYearFilter] = useState('')
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
    
    if (user?.role !== 'buyer') {
      router.push('/dashboard')
      return
    }
    
    fetchCertificates()
  }, [isAuthenticated, user, pagination.page, yearFilter])

  const fetchCertificates = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        year: yearFilter,
        search: searchTerm,
        status: 'completed'
      }
      
      const response = await transactionsAPI.getTransactions(params)
      setCertificates(response.data.data || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCertificates()
  }

  const handleYearFilter = (year) => {
    setYearFilter(year)
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setSearchTerm('')
    setYearFilter('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const downloadCertificate = (transactionId) => {
    // In a real implementation, this would download the actual certificate
    alert(`Certificate download for transaction ${transactionId} would be implemented here`)
  }

  const shareCertificate = (transactionId) => {
    // In a real implementation, this would share the certificate
    alert(`Certificate sharing for transaction ${transactionId} would be implemented here`)
  }

  const generateYears = () => {
    const currentYear = new Date().getFullYear()
    const years = []
    for (let year = currentYear; year >= 2020; year--) {
      years.push(year)
    }
    return years
  }

  if (!isAuthenticated || user?.role !== 'buyer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              Only buyers can view carbon credit certificates.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-gray-600 mt-2">
                View and download your carbon credit certificates
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
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
                    placeholder="Search certificates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
              </div>

              {/* Year Filter */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-500" />
                <select
                  value={yearFilter}
                  onChange={(e) => handleYearFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">All Years</option>
                  {generateYears().map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              {/* Clear Filters */}
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Certificates Grid */}
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
        ) : certificates.length > 0 ? (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <Card key={certificate._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge className="bg-green-100 text-green-800">
                      <Award className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                    <Badge variant="outline">
                      {certificate.carbonCredit?.certification?.standard}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg line-clamp-2">
                    {certificate.carbonCredit?.title}
                  </CardTitle>
                  <CardDescription className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {certificate.carbonCredit?.projectLocation?.country}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Credits:</span>
                      <span className="font-medium">
                        {formatNumber(certificate.quantity)} credits
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">CO₂ Impact:</span>
                      <span className="font-medium text-green-600">
                        {formatCO2Impact(certificate.quantity)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium">
                        {formatDate(certificate.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-medium text-xs">
                        {certificate.transactionRef}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => downloadCertificate(certificate._id)}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => shareCertificate(certificate._id)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <Link href={`/dashboard/transactions/${certificate._id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Award className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No certificates found
              </h3>
              <p className="text-gray-600 mb-4">
                You don't have any carbon credit certificates yet. Purchase some credits to get started.
              </p>
              <Link href="/marketplace">
                <Button>
                  Browse Marketplace
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

        {/* Certificate Information */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Award className="h-5 w-5 mr-2" />
              About Carbon Credit Certificates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">What are Carbon Credit Certificates?</h4>
                <p className="text-sm text-gray-600">
                  Carbon credit certificates are official documents that verify your purchase and ownership 
                  of carbon credits. They serve as proof of your environmental impact and can be used for 
                  reporting, compliance, or marketing purposes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Certificate Features</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Official verification of carbon credit ownership</li>
                  <li>• Detailed project information and impact</li>
                  <li>• Downloadable PDF format</li>
                  <li>• Shareable for reporting purposes</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
