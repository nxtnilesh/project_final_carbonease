'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Download, 
  ArrowRight, 
  Leaf, 
  Calendar,
  MapPin,
  CreditCard
} from 'lucide-react'
import { paymentsAPI, transactionsAPI } from '@/lib/api'
import { formatCurrency, formatNumber, formatCO2Impact, formatDate } from '@/lib/utils'
import { useAuth } from '@/components/providers/AuthProvider'

export default function PaymentSuccessPage() {
  const [loading, setLoading] = useState(true)
  const [transaction, setTransaction] = useState(null)
  const [paymentStatus, setPaymentStatus] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    if (!sessionId) {
      router.push('/dashboard')
      return
    }
    
    fetchPaymentDetails()
  }, [sessionId])

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, you would fetch the transaction details
      // based on the session_id from your backend
      // For now, we'll simulate the data
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock transaction data
      const mockTransaction = {
        _id: 'mock-transaction-id',
        transactionRef: 'TXN-12345678',
        quantity: 100,
        totalAmount: 2500,
        currency: 'USD',
        status: 'completed',
        payment: {
          status: 'completed',
          paidAt: new Date().toISOString()
        },
        carbonCredit: {
          _id: 'mock-credit-id',
          title: 'Solar Farm Project - California',
          energyType: 'solar',
          projectLocation: {
            country: 'United States',
            state: 'California'
          },
          certification: {
            standard: 'VCS',
            certifier: 'Verra',
            certificateNumber: 'VCS-2024-001'
          }
        },
        seller: {
          firstName: 'John',
          lastName: 'Smith',
          company: 'Green Energy Corp'
        },
        createdAt: new Date().toISOString()
      }
      
      setTransaction(mockTransaction)
      setPaymentStatus('completed')
    } catch (error) {
      console.error('Error fetching payment details:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadCertificate = () => {
    // In a real implementation, this would download the actual certificate
    alert('Certificate download would be implemented here')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your payment...</p>
        </div>
      </div>
    )
  }

  if (!transaction) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Payment Error</CardTitle>
            <CardDescription>
              We couldn't find your payment details. Please contact support if you continue to have issues.
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Successful!
          </h1>
          <p className="text-xl text-gray-600">
            Thank you for your purchase. Your carbon credits have been successfully acquired.
          </p>
        </div>

        {/* Transaction Details */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Transaction ID: {transaction.transactionRef}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Carbon Credit Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Project:</span>
                      <span className="font-medium">{transaction.carbonCredit.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Energy Type:</span>
                      <Badge className="bg-blue-100 text-blue-800">
                        {transaction.carbonCredit.energyType}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">
                        {transaction.carbonCredit.projectLocation.state}, {transaction.carbonCredit.projectLocation.country}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Certification:</span>
                      <span className="font-medium">{transaction.carbonCredit.certification.standard}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Purchase Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Quantity:</span>
                      <span className="font-medium">{formatNumber(transaction.quantity)} credits</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Amount:</span>
                      <span className="font-medium text-green-600">
                        {formatCurrency(transaction.totalAmount, transaction.currency)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">CO₂ Impact:</span>
                      <span className="font-medium text-green-600">
                        {formatCO2Impact(transaction.quantity)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Purchase Date:</span>
                      <span className="font-medium">
                        {formatDate(transaction.payment.paidAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Environmental Impact */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="h-5 w-5 mr-2 text-green-600" />
              Your Environmental Impact
            </CardTitle>
            <CardDescription>
              Congratulations! You've made a positive impact on the environment.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {formatNumber(transaction.quantity)}
                </div>
                <div className="text-sm text-gray-600">Carbon Credits</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {formatCO2Impact(transaction.quantity)}
                </div>
                <div className="text-sm text-gray-600">CO₂ Offset</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {transaction.carbonCredit.energyType}
                </div>
                <div className="text-sm text-gray-600">Energy Type</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>
              Here's what you can do with your carbon credits.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-green-600">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Download Your Certificate</h4>
                  <p className="text-sm text-gray-600">
                    Get your official carbon credit certificate to verify your environmental impact.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-green-600">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Track Your Impact</h4>
                  <p className="text-sm text-gray-600">
                    Monitor your carbon footprint reduction in your dashboard.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-green-600">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Share Your Achievement</h4>
                  <p className="text-sm text-gray-600">
                    Share your environmental impact with your network and inspire others.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={downloadCertificate} className="flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download Certificate
          </Button>
          
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center">
              Go to Dashboard
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          
          <Link href="/marketplace">
            <Button variant="outline" className="flex items-center">
              Browse More Credits
              <Leaf className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Thank You Message */}
        <div className="text-center mt-12">
          <p className="text-lg text-gray-600 mb-4">
            Thank you for choosing Carbonease and making a positive impact on our planet!
          </p>
          <p className="text-sm text-gray-500">
            If you have any questions about your purchase, please don't hesitate to contact our support team.
          </p>
        </div>
      </div>
    </div>
  )
}
