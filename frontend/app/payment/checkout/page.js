'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { 
  ArrowLeft, 
  CreditCard, 
  Lock, 
  CheckCircle,
  Leaf,
  MapPin,
  Calendar,
  DollarSign
} from 'lucide-react'
import { paymentsAPI, transactionsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

export default function CheckoutPage() {
  const [transaction, setTransaction] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  
  const transactionId = searchParams.get('transaction_id')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }
    
    if (user?.role !== 'buyer') {
      router.push('/dashboard')
      return
    }
    
    if (!transactionId) {
      router.push('/marketplace')
      return
    }
    
    fetchTransaction()
  }, [isAuthenticated, user, transactionId])

  const fetchTransaction = async () => {
    try {
      setLoading(true)
      const response = await transactionsAPI.getTransaction(transactionId)
      setTransaction(response.data.data)
    } catch (error) {
      console.error('Error fetching transaction:', error)
      toast.error('Failed to load transaction details')
      router.push('/marketplace')
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async () => {
    try {
      setProcessing(true)
      const response = await paymentsAPI.createCheckoutSession(transactionId)
      
      if (response.data.success) {
        // Redirect to Stripe checkout
        window.location.href = response.data.data.url
      }
    } catch (error) {
      console.error('Error creating checkout session:', error)
      toast.error('Failed to process payment')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading transaction details...</p>
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
              The transaction you're trying to pay for doesn't exist or has expired.
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href={`/marketplace/${transaction.carbonCredit?._id}`}>
            <Button variant="outline" className="flex items-center mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Credit Details
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="text-gray-600 mt-2">
            Review your order and proceed to secure payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-2 space-y-6">
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
                          <Badge className="bg-blue-100 text-blue-800">
                            {transaction.carbonCredit?.energyType}
                          </Badge>
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
                          <span className="text-gray-600">CO₂ Impact:</span>
                          <span className="font-medium text-green-600">
                            {formatCO2Impact(transaction.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-medium text-green-600">
                      {transaction.seller?.firstName?.[0]}{transaction.seller?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium">
                      {transaction.seller?.firstName} {transaction.seller?.lastName}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {transaction.seller?.company || 'Individual Seller'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Secure Payment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">SSL encrypted connection</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">PCI DSS compliant payment processing</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-sm">Your payment information is never stored</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Summary */}
          <div className="space-y-6">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium">{formatNumber(transaction.quantity)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price per credit:</span>
                    <span className="font-medium">{formatCurrency(transaction.carbonCredit?.pricePerCredit)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(transaction.totalAmount, transaction.currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Processing fee:</span>
                    <span className="font-medium">$0.00</span>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      {formatCurrency(transaction.totalAmount, transaction.currency)}
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full"
                    size="lg"
                  >
                    {processing ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 mr-2" />
                        Pay with Stripe
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    By completing this purchase, you agree to our{' '}
                    <Link href="/terms" className="text-green-600 hover:underline">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-green-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Environmental Impact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Leaf className="h-5 w-5 mr-2 text-green-600" />
                  Your Impact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {formatCO2Impact(transaction.quantity)}
                  </div>
                  <p className="text-sm text-gray-600">
                    CO₂ emissions you'll help offset
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
