'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  ArrowLeft, 
  Leaf, 
  MapPin, 
  Calendar,
  TrendingUp,
  Star,
  Eye,
  Download,
  Share2,
  ShoppingCart,
  Shield,
  Globe,
  Award,
  Users,
  MessageCircle
} from 'lucide-react'
import { creditsAPI, transactionsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate, getEnergyTypeColor } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

export default function MarketplaceDetailPage() {
  const [credit, setCredit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [reviews, setReviews] = useState([])
  const [relatedCredits, setRelatedCredits] = useState([])
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (params.id) {
      fetchCreditDetails()
    }
  }, [params.id])

  const fetchCreditDetails = async () => {
    try {
      setLoading(true)
      const response = await creditsAPI.getCredit(params.id)
      setCredit(response.data.data)
      
      // Fetch related credits
      const relatedResponse = await creditsAPI.getCredits({
        energyType: response.data.data.energyType,
        limit: 4,
        exclude: params.id
      })
      setRelatedCredits(relatedResponse.data.data || [])
      
      // Fetch reviews
      const reviewsResponse = await transactionsAPI.getCreditReviews(params.id)
      setReviews(reviewsResponse.data.data || [])
    } catch (error) {
      console.error('Error fetching credit details:', error)
      toast.error('Failed to load credit details')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user?.role !== 'buyer') {
      toast.error('Only buyers can purchase carbon credits')
      return
    }

    if (quantity > credit.availableCredits) {
      toast.error('Not enough credits available')
      return
    }

    try {
      setPurchaseLoading(true)
      const response = await transactionsAPI.createTransaction({
        carbonCreditId: credit._id,
        quantity: quantity,
        totalAmount: quantity * credit.pricePerCredit
      })
      
      if (response.data.success) {
        // Redirect to payment
        router.push(`/payment/checkout?transaction_id=${response.data.data._id}`)
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
      toast.error('Failed to create transaction')
    } finally {
      setPurchaseLoading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: credit.title,
          text: `Check out this carbon credit: ${credit.title}`,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!credit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Credit Not Found</CardTitle>
            <CardDescription>
              The carbon credit you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/marketplace">
              <Button>Browse Marketplace</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/marketplace">
            <Button variant="outline" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Marketplace
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Badge className={getEnergyTypeColor(credit.energyType)}>
                    {credit.energyType}
                  </Badge>
                  <Badge variant="outline">
                    {credit.certification?.standard}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {credit.title}
              </h1>
              
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {credit.projectLocation?.state}, {credit.projectLocation?.country}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Listed {formatDate(credit.createdAt)}
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {formatNumber(credit.viewCount)} views
                </div>
              </div>
            </div>

            {/* Project Image */}
            <Card>
              <CardContent className="p-0">
                <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Leaf className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-600">Project Image</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {credit.description || 'This renewable energy project contributes to reducing carbon emissions through clean energy generation. The project has been verified and certified according to international standards.'}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Project Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Energy Type:</span>
                        <span className="font-medium capitalize">{credit.energyType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">
                          {credit.projectLocation?.state}, {credit.projectLocation?.country}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Project Size:</span>
                        <span className="font-medium">{credit.projectSize || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Start Date:</span>
                        <span className="font-medium">
                          {credit.projectStartDate ? formatDate(credit.projectStartDate) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Certification</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Standard:</span>
                        <span className="font-medium">{credit.certification?.standard}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Certifier:</span>
                        <span className="font-medium">{credit.certification?.certifier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Certificate #:</span>
                        <span className="font-medium">{credit.certification?.certificateNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vintage Year:</span>
                        <span className="font-medium">{credit.vintageYear || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Reviews ({reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {review.buyer?.firstName?.charAt(0)}
                              </span>
                            </div>
                            <span className="font-medium">{review.buyer?.firstName} {review.buyer?.lastName}</span>
                          </div>
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-gray-600">{review.comment}</p>
                        <p className="text-sm text-gray-500 mt-2">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Related Credits */}
            {relatedCredits.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Carbon Credits</CardTitle>
                  <CardDescription>
                    Other credits from similar projects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedCredits.map((relatedCredit) => (
                      <Link key={relatedCredit._id} href={`/marketplace/${relatedCredit._id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <Badge className={getEnergyTypeColor(relatedCredit.energyType)}>
                                {relatedCredit.energyType}
                              </Badge>
                              <span className="text-sm font-medium text-green-600">
                                {formatCurrency(relatedCredit.pricePerCredit)}/credit
                              </span>
                            </div>
                            <h4 className="font-medium text-sm mb-1 line-clamp-2">
                              {relatedCredit.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {relatedCredit.projectLocation?.country} • {formatNumber(relatedCredit.availableCredits)} available
                            </p>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Purchase Sidebar */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Purchase Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price */}
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {formatCurrency(credit.pricePerCredit)}
                  </div>
                  <div className="text-sm text-gray-600">per credit</div>
                </div>

                {/* Available Credits */}
                <div className="text-center">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(credit.availableCredits)}
                  </div>
                  <div className="text-sm text-gray-600">credits available</div>
                </div>

                {/* Quantity Selector */}
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={credit.availableCredits}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(credit.availableCredits, parseInt(e.target.value) || 1)))}
                    className="mt-1"
                  />
                </div>

                {/* Total */}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-medium">Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatCurrency(quantity * credit.pricePerCredit)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    {formatCO2Impact(quantity)} CO₂ offset
                  </div>
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  disabled={purchaseLoading || quantity > credit.availableCredits}
                  className="w-full"
                  size="lg"
                >
                  {purchaseLoading ? (
                    'Processing...'
                  ) : !isAuthenticated ? (
                    'Sign In to Purchase'
                  ) : user?.role !== 'buyer' ? (
                    'Buyers Only'
                  ) : (
                    'Purchase Credits'
                  )}
                </Button>

                {/* Trust Indicators */}
                <div className="space-y-3 pt-4 border-t">
                  <div className="flex items-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mr-2 text-green-600" />
                    Verified by {credit.certification?.certifier}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Globe className="h-4 w-4 mr-2 text-green-600" />
                    International standards
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-2 text-green-600" />
                    {credit.certification?.standard} certified
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Seller Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-green-600">
                      {credit.seller?.firstName?.charAt(0)}{credit.seller?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {credit.seller?.firstName} {credit.seller?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {credit.seller?.company || 'Individual Seller'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Member since:</span>
                    <span className="font-medium">
                      {credit.seller?.createdAt ? formatDate(credit.seller.createdAt) : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits sold:</span>
                    <span className="font-medium">
                      {formatNumber(credit.seller?.totalCreditsSold || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                      <span className="font-medium">
                        {credit.seller?.averageRating?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
