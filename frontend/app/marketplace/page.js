'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSkeleton } from '@/components/ui/Loading'
import { 
  Search, 
  Filter, 
  ArrowRight, 
  Leaf, 
  MapPin, 
  Calendar,
  TrendingUp,
  Star,
  Eye,
  SlidersHorizontal,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  Sparkles,
  Zap,
  Globe,
  Shield,
  Award,
  Heart,
  Share2
} from 'lucide-react'
import { creditsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, getEnergyTypeColor } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

export default function MarketplacePage() {
  const [credits, setCredits] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    energyType: '',
    country: '',
    minPrice: '',
    maxPrice: '',
    certification: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [favorites, setFavorites] = useState(new Set())
  const { isAuthenticated } = useAuth()

  // Filter options
  const [energyTypes, setEnergyTypes] = useState([])
  const [countries, setCountries] = useState([])
  const [certifications, setCertifications] = useState([])

  useEffect(() => {
    fetchCredits()
    fetchFilterOptions()
  }, [filters, pagination.page])

  const fetchCredits = async () => {
    try {
      setLoading(true)
      const params = {
        ...filters,
        search: searchTerm,
        page: pagination.page,
        limit: pagination.limit
      }
      
      const response = await creditsAPI.getCredits(params)
      setCredits(response.data.data || [])
      setPagination(response.data.pagination || pagination)
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchFilterOptions = async () => {
    try {
      const [energyTypesRes, countriesRes, certificationsRes] = await Promise.all([
        creditsAPI.getEnergyTypes(),
        creditsAPI.getCountries(),
        creditsAPI.getCertificationStandards()
      ])
      
      setEnergyTypes(energyTypesRes.data.data || [])
      setCountries(countriesRes.data.data || [])
      setCertifications(certificationsRes.data.data || [])
    } catch (error) {
      console.error('Error fetching filter options:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    fetchCredits()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const clearFilters = () => {
    setFilters({
      energyType: '',
      country: '',
      minPrice: '',
      maxPrice: '',
      certification: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    })
    setSearchTerm('')
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-blue-600 to-indigo-600 text-white">
        <div className="container-responsive py-12 sm:py-16">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="heading-responsive font-bold mb-4">
              Carbon Credit Marketplace
            </h1>
            <p className="text-mobile-lg max-w-3xl mx-auto opacity-90">
              Discover and purchase verified carbon credits from renewable energy projects worldwide. 
              Make a real impact on climate change.
            </p>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Shield className="h-4 w-4" />
                <span className="text-sm">Verified Credits</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Globe className="h-4 w-4" />
                <span className="text-sm">Global Impact</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2">
                <Award className="h-4 w-4" />
                <span className="text-sm">Certified Projects</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-responsive py-6 sm:py-8">
        <div className="flex-mobile gap-6 sm:gap-8">
          {/* Filters Sidebar */}
          <div className="w-full lg:w-1/4">
            <Card className="card-mobile shadow-lg">
              <CardHeader className="card-mobile-padding">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-mobile-lg flex items-center">
                    <SlidersHorizontal className="h-5 w-5 mr-2 text-blue-600" />
                    Filters
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(!showFilters)}
                    className="lg:hidden touch-button"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className={`form-mobile ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search Credits
                  </label>
                  <form onSubmit={handleSearch} className="flex">
                    <Input
                      placeholder="Search credits..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-mobile rounded-r-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button type="submit" className="rounded-l-none px-4">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>
                </div>

                {/* Energy Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Type
                  </label>
                  <select
                    value={filters.energyType}
                    onChange={(e) => handleFilterChange('energyType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    {energyTypes.map((type) => (
                      <option key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <select
                    value={filters.country}
                    onChange={(e) => handleFilterChange('country', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Countries</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Certification */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certification
                  </label>
                  <select
                    value={filters.certification}
                    onChange={(e) => handleFilterChange('certification', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">All Certifications</option>
                    {certifications.map((cert) => (
                      <option key={cert} value={cert}>
                        {cert}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price Range (per credit)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Min"
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    />
                  </div>
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-')
                      handleFilterChange('sortBy', sortBy)
                      handleFilterChange('sortOrder', sortOrder)
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="pricePerCredit-asc">Price: Low to High</option>
                    <option value="pricePerCredit-desc">Price: High to Low</option>
                    <option value="viewCount-desc">Most Popular</option>
                    <option value="availableCredits-desc">Most Available</option>
                  </select>
                </div>

                {/* Clear Filters */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full"
                >
                  Clear All Filters
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4">
            {/* Results Header */}
            <div className="flex-mobile items-center justify-between mb-6">
              <div>
                <h2 className="text-mobile-xl font-semibold text-gray-900">
                  {pagination.total} Carbon Credits Found
                </h2>
                <p className="text-mobile text-gray-600">
                  Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                  {pagination.total} results
                </p>
              </div>
              <div className="flex items-center space-x-2 mt-4 sm:mt-0">
                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
                {/* Sort Dropdown */}
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-')
                    handleFilterChange('sortBy', sortBy)
                    handleFilterChange('sortOrder', sortOrder)
                  }}
                  className="input-mobile text-sm"
                >
                  <option value="createdAt-desc">Newest First</option>
                  <option value="createdAt-asc">Oldest First</option>
                  <option value="pricePerCredit-asc">Price: Low to High</option>
                  <option value="pricePerCredit-desc">Price: High to Low</option>
                  <option value="viewCount-desc">Most Popular</option>
                  <option value="availableCredits-desc">Most Available</option>
                </select>
              </div>
            </div>

            {/* Credits Grid */}
            {loading ? (
              <div className={viewMode === 'grid' ? 'grid-mobile-3 gap-6' : 'space-y-4'}>
                {[...Array(6)].map((_, index) => (
                  <LoadingSkeleton key={index} className={viewMode === 'grid' ? 'h-80' : 'h-32'} />
                ))}
              </div>
            ) : credits.length > 0 ? (
              <>
                <div className={viewMode === 'grid' ? 'grid-mobile-3 gap-6' : 'space-y-4'}>
                  {credits.map((credit) => (
                    <Card key={credit._id} className={`card-modern card-hover ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
                      <CardHeader className={`card-mobile-padding ${viewMode === 'list' ? 'flex-1' : ''}`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex flex-wrap gap-2">
                            <Badge className={`${getEnergyTypeColor(credit.energyType)} text-xs`}>
                              <Zap className="h-3 w-3 mr-1" />
                              {credit.energyType}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              {credit.certification?.standard}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-1 h-6 w-6"
                              onClick={() => {
                                const newFavorites = new Set(favorites)
                                if (newFavorites.has(credit._id)) {
                                  newFavorites.delete(credit._id)
                                } else {
                                  newFavorites.add(credit._id)
                                }
                                setFavorites(newFavorites)
                              }}
                            >
                              <Heart className={`h-3 w-3 ${favorites.has(credit._id) ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
                            </Button>
                            <Button variant="ghost" size="sm" className="p-1 h-6 w-6">
                              <Share2 className="h-3 w-3 text-gray-400" />
                            </Button>
                          </div>
                        </div>
                        <CardTitle className="text-mobile-lg line-clamp-2 mb-2">
                          {credit.title}
                        </CardTitle>
                        <CardDescription className="flex items-center text-mobile">
                          <MapPin className="h-4 w-4 mr-1 text-blue-500" />
                          {credit.projectLocation?.country}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="card-mobile-padding">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-3 rounded-lg">
                              <div className="text-xs text-green-600 font-medium mb-1">Available</div>
                              <div className="text-sm font-semibold text-green-900">
                                {formatNumber(credit.availableCredits)} credits
                              </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg">
                              <div className="text-xs text-blue-600 font-medium mb-1">Price</div>
                              <div className="text-sm font-semibold text-blue-900">
                                {formatCurrency(credit.pricePerCredit)}/credit
                              </div>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-600 font-medium mb-1">CO₂ Impact</div>
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCO2Impact(credit.availableCredits)}
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <div className="flex items-center">
                              <Eye className="h-3 w-3 mr-1" />
                              {formatNumber(credit.viewCount)} views
                            </div>
                            <div className="flex items-center">
                              <Star className="h-3 w-3 mr-1 text-yellow-500" />
                              {credit.averageRating?.toFixed(1) || 'N/A'} rating
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex space-x-2">
                            <Link href={`/marketplace/${credit._id}`} className="flex-1">
                              <Button className="w-full button-mobile">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                            </Link>
                            {isAuthenticated && (
                              <Button variant="outline" className="button-mobile">
                                <ShoppingCart className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

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
              </>
            ) : (
              <div className="text-center py-12">
                <Leaf className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No carbon credits found
                </h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
