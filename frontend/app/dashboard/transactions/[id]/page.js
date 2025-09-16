'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  Star,
  Calendar,
  MapPin,
  Leaf,
  DollarSign,
  User,
  MessageCircle,
  CheckCircle,
  Clock,
  XCircle
} from 'lucide-react'
import { transactionsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate, getStatusColor } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

export default function TransactionDetailPage() {
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [review, setReview] = useState({ rating: 5, comment: '' })
  const params = useParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    fetchTransaction()
  }, [isAuthenticated, params.id])

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      const response = await transactionsAPI.getTransaction(params.id)
      setTransaction(response.data.data)
    } catch (error) {
      console.error('Error fetching transaction:', error)
      toast.error('Failed to load transaction details')
    } finally {
      setLoading(false)
    }
  }

  const handleAddReview = async () => {
    if (!review.comment.trim()) {
      toast.error('Please enter a review comment')
      return
    }

    try {
      setReviewLoading(true)
      await transactionsAPI.addReview(params.id, review)
      toast.success('Review added successfully!')
      setShowReviewForm(false)
      setReview({ rating: 5, comment: '' })
      fetchTransaction() // Refresh to show the new review
    } catch (error) {
      console.error('Error adding review:', error)
      toast.error('Failed to add review')
    } finally {
      setReviewLoading(false)
    }
  }

  const downloadCertificate = () => {
    // In a real implementation, this would download the actual certificate
    alert('Certificate download would be implemented here')
  }

  const shareTransaction = () => {
    // In a real implementation, this would share the transaction
    alert('Transaction sharing would be implemented here')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-600" />
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Transaction Not Found</CardTitle>
            <CardDescription>
              The transaction you're looking for doesn't exist or you don't have permission to view it.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard/transactions">
              <Button>Back to Transactions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/dashboard/transactions">
                <Button variant="outline" className="flex items-center mb-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Transactions
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">
                Transaction Details
              </h1>
              <p className="text-gray-600 mt-2">
                Transaction ID: {transaction.transactionRef}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button variant="outline" onClick={shareTransaction}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {transaction.status === 'completed' && (
                <Button onClick={downloadCertificate}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Certificate
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Transaction Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  {getStatusIcon(transaction.status)}
                  <span className="ml-2">Transaction Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Badge className={getStatusColor(transaction.status)}>
                    {transaction.status}
                  </Badge>
                  <div className="text-sm text-gray-600">
                    Created: {formatDate(transaction.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Carbon Credit Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2" />
                  Carbon Credit Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{transaction.carbonCredit?.title}</h3>
                    <p className="text-gray-600">{transaction.carbonCredit?.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Project Information</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Energy Type:</span>
                          <span className="font-medium capitalize">{transaction.carbonCredit?.energyType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Location:</span>
                          <span className="font-medium">
                            {transaction.carbonCredit?.projectLocation?.state}, {transaction.carbonCredit?.projectLocation?.country}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Certification:</span>
                          <span className="font-medium">{transaction.carbonCredit?.certification?.standard}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Purchase Details</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Quantity:</span>
                          <span className="font-medium">{formatNumber(transaction.quantity)} credits</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Price per Credit:</span>
                          <span className="font-medium">{formatCurrency(transaction.carbonCredit?.pricePerCredit)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount:</span>
                          <span className="font-medium text-green-600">
                            {formatCurrency(transaction.totalAmount, transaction.currency)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Counterparty Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  {user?.role === 'buyer' ? 'Seller Information' : 'Buyer Information'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-green-600">
                      {user?.role === 'buyer' 
                        ? `${transaction.seller?.firstName?.[0]}${transaction.seller?.lastName?.[0]}`
                        : `${transaction.buyer?.firstName?.[0]}${transaction.buyer?.lastName?.[0]}`
                      }
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {user?.role === 'buyer' 
                        ? `${transaction.seller?.firstName} ${transaction.seller?.lastName}`
                        : `${transaction.buyer?.firstName} ${transaction.buyer?.lastName}`
                      }
                    </h4>
                    <p className="text-sm text-gray-600">
                      {user?.role === 'buyer' 
                        ? transaction.seller?.company || 'Individual Seller'
                        : transaction.buyer?.company || 'Individual Buyer'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reviews */}
            {transaction.reviews && transaction.reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Reviews ({transaction.reviews.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transaction.reviews.map((review) => (
                      <div key={review._id} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-green-600">
                                {review.buyer?.firstName?.[0]}
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

            {/* Add Review */}
            {transaction.status === 'completed' && user?.role === 'buyer' && !transaction.reviews?.some(r => r.buyer?._id === user._id) && (
              <Card>
                <CardHeader>
                  <CardTitle>Add a Review</CardTitle>
                  <CardDescription>
                    Share your experience with this carbon credit purchase
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!showReviewForm ? (
                    <Button onClick={() => setShowReviewForm(true)}>
                      <Star className="h-4 w-4 mr-2" />
                      Write a Review
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rating
                        </label>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              type="button"
                              onClick={() => setReview(prev => ({ ...prev, rating }))}
                              className="focus:outline-none"
                            >
                              <Star
                                className={`h-6 w-6 ${
                                  rating <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Comment
                        </label>
                        <textarea
                          rows={4}
                          placeholder="Share your experience..."
                          value={review.comment}
                          onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Button 
                          onClick={handleAddReview}
                          disabled={reviewLoading}
                        >
                          {reviewLoading ? 'Adding...' : 'Submit Review'}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => setShowReviewForm(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Transaction Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium text-sm">{transaction.transactionRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity:</span>
                  <span className="font-medium">{formatNumber(transaction.quantity)} credits</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">CO₂ Impact:</span>
                  <span className="font-medium text-green-600">
                    {formatCO2Impact(transaction.quantity)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total:</span>
                  <span className="text-green-600">
                    {formatCurrency(transaction.totalAmount, transaction.currency)}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-600" />
                  Environmental Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCO2Impact(transaction.quantity)}
                  </div>
                  <p className="text-sm text-gray-600">
                    CO₂ emissions offset through this purchase
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
