'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  XCircle, 
  ArrowLeft, 
  RefreshCw, 
  Leaf, 
  ShoppingCart,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '@/components/providers/AuthProvider'

export default function PaymentCancelPage() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  
  const transactionId = searchParams.get('transaction_id')

  const retryPayment = () => {
    // In a real implementation, this would redirect to retry the payment
    router.push('/marketplace')
  }

  const contactSupport = () => {
    // In a real implementation, this would open a support ticket or chat
    window.open('mailto:support@carbonease.com?subject=Payment Issue', '_blank')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cancel Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Payment Cancelled
          </h1>
          <p className="text-xl text-gray-600">
            Your payment was cancelled. No charges have been made to your account.
          </p>
        </div>

        {/* Information Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What happened?</CardTitle>
            <CardDescription>
              Your payment process was interrupted or cancelled before completion.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">No charges made</h4>
                  <p className="text-sm text-gray-600">
                    Your payment was cancelled before any money was charged to your account.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Carbon credits not purchased</h4>
                  <p className="text-sm text-gray-600">
                    The carbon credits you were trying to purchase are still available for others to buy.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">You can try again</h4>
                  <p className="text-sm text-gray-600">
                    Feel free to browse our marketplace and try purchasing again when you're ready.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Reasons */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Common reasons for cancellation</CardTitle>
            <CardDescription>
              Here are some common reasons why payments might be cancelled.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">You clicked the back button during payment</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Payment page timed out due to inactivity</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">You decided not to complete the purchase</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm text-gray-600">Technical issues with the payment processor</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button onClick={retryPayment} className="flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
          
          <Link href="/marketplace">
            <Button variant="outline" className="flex items-center">
              <Leaf className="h-4 w-4 mr-2" />
              Browse Marketplace
            </Button>
          </Link>
          
          <Link href="/dashboard">
            <Button variant="outline" className="flex items-center">
              <ShoppingCart className="h-4 w-4 mr-2" />
              My Dashboard
            </Button>
          </Link>
        </div>

        {/* Support Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need help?</CardTitle>
            <CardDescription>
              If you're experiencing issues with payments, our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Contact Support</h4>
                  <p className="text-sm text-gray-600">
                    Get help with payment issues or technical problems
                  </p>
                </div>
                <Button variant="outline" onClick={contactSupport}>
                  Contact Us
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium">Payment Methods</h4>
                  <p className="text-sm text-gray-600">
                    We accept all major credit cards and digital wallets
                  </p>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-6 bg-blue-600 rounded text-white text-xs flex items-center justify-center">
                    V
                  </div>
                  <div className="w-8 h-6 bg-red-600 rounded text-white text-xs flex items-center justify-center">
                    M
                  </div>
                  <div className="w-8 h-6 bg-yellow-600 rounded text-white text-xs flex items-center justify-center">
                    A
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
