'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Leaf, Shield, Globe, TrendingUp, Users, Award, Zap } from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { creditsAPI } from '@/lib/api'
import { formatCurrency, formatCO2Impact } from '@/lib/utils'

export default function HomePage() {
  const [featuredCredits, setFeaturedCredits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedCredits = async () => {
      try {
        const response = await creditsAPI.getCredits({ limit: 6, sortBy: 'viewCount', sortOrder: 'desc' })
        setFeaturedCredits(response.data.data || [])
      } catch (error) {
        console.error('Error fetching featured credits:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedCredits()
  }, [])

  const features = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Verified Credits",
      description: "All carbon credits are verified by internationally recognized standards like VCS, Gold Standard, and CAR."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Projects",
      description: "Access carbon credits from renewable energy projects worldwide, from wind farms to solar installations."
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Market Transparency",
      description: "Real-time pricing, detailed project information, and transparent transaction history."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community Driven",
      description: "Join a community of environmentally conscious individuals and organizations making a real impact."
    }
  ]

  const stats = [
    { label: "Carbon Credits Traded", value: "1.2M+", icon: <Leaf className="h-5 w-5" /> },
    { label: "Active Projects", value: "500+", icon: <Globe className="h-5 w-5" /> },
    { label: "Verified Sellers", value: "200+", icon: <Users className="h-5 w-5" /> },
    { label: "Countries", value: "50+", icon: <Award className="h-5 w-5" /> }
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Trade Carbon Credits with
              <span className="gradient-text block">Confidence</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Join the world's leading carbon credit trading platform. Buy and sell verified carbon credits 
              from renewable energy projects worldwide, making a real impact on climate change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/marketplace">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore Marketplace
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Start Trading
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2 text-green-600">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Carbonease?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We provide a secure, transparent, and efficient platform for carbon credit trading 
              with the highest standards of verification and quality.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4 text-green-600">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Credits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Carbon Credits
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Discover high-quality carbon credits from verified renewable energy projects around the world.
            </p>
          </div>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredCredits.map((credit) => (
                <Card key={credit._id} className="card-hover">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className={getEnergyTypeColor(credit.energyType)}>
                        {credit.energyType}
                      </Badge>
                      <Badge variant="outline">
                        {credit.certification?.standard}
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
                        <span className="text-gray-600">Available Credits:</span>
                        <span className="font-medium">{formatNumber(credit.availableCredits)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Price per Credit:</span>
                        <span className="font-medium">{formatCurrency(credit.pricePerCredit)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">CO₂ Impact:</span>
                        <span className="font-medium text-green-600">
                          {formatCO2Impact(credit.availableCredits)}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <Link href={`/marketplace/${credit._id}`}>
                        <Button className="w-full">
                          View Details
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/marketplace">
              <Button variant="outline" size="lg">
                View All Credits
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Join thousands of individuals and organizations already trading carbon credits 
            to reduce their environmental impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Today
                <Zap className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-green-600">
                Browse Credits
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Helper function for energy type colors
function getEnergyTypeColor(energyType) {
  const colors = {
    wind: 'bg-blue-100 text-blue-800',
    solar: 'bg-yellow-100 text-yellow-800',
    hydro: 'bg-cyan-100 text-cyan-800',
    geothermal: 'bg-orange-100 text-orange-800',
    biomass: 'bg-green-100 text-green-800',
    nuclear: 'bg-purple-100 text-purple-800',
    other: 'bg-gray-100 text-gray-800',
  }
  return colors[energyType] || colors.other
}
