'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Leaf, 
  Globe, 
  Users, 
  Award, 
  Shield, 
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Target,
  Heart
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function AboutPage() {
  const values = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Transparency",
      description: "We believe in complete transparency in all carbon credit transactions, providing detailed project information and verification."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "Global Impact",
      description: "Our platform connects buyers and sellers worldwide, enabling global collaboration in the fight against climate change."
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Quality Assurance",
      description: "All carbon credits on our platform are verified by internationally recognized standards and certification bodies."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Community",
      description: "We foster a community of environmentally conscious individuals and organizations working together for a sustainable future."
    }
  ]

  const team = [
    {
      name: "Sarah Johnson",
      role: "CEO & Co-Founder",
      bio: "Former renewable energy executive with 15+ years in sustainability and carbon markets.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Michael Chen",
      role: "CTO & Co-Founder",
      bio: "Tech entrepreneur with expertise in blockchain and fintech solutions for environmental markets.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "Dr. Emily Rodriguez",
      role: "Head of Sustainability",
      bio: "Environmental scientist and former UN climate advisor with deep expertise in carbon accounting.",
      image: "/api/placeholder/150/150"
    },
    {
      name: "David Thompson",
      role: "Head of Operations",
      bio: "Operations leader with experience scaling marketplaces and managing complex supply chains.",
      image: "/api/placeholder/150/150"
    }
  ]

  const milestones = [
    {
      year: "2020",
      title: "Company Founded",
      description: "Carbonease was founded with a vision to democratize carbon credit trading."
    },
    {
      year: "2021",
      title: "Platform Launch",
      description: "Launched our first version of the carbon credit trading platform."
    },
    {
      year: "2022",
      title: "10,000 Users",
      description: "Reached our first 10,000 registered users across 25 countries."
    },
    {
      year: "2023",
      title: "1M Credits Traded",
      description: "Achieved a major milestone of 1 million carbon credits traded on our platform."
    },
    {
      year: "2024",
      title: "Global Expansion",
      description: "Expanded to 50+ countries with partnerships with major certification bodies."
    }
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
              About
              <span className="gradient-text block">Carbonease</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're building the world's most trusted carbon credit trading platform, 
              connecting buyers and sellers to accelerate climate action globally.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                To accelerate the transition to a carbon-neutral world by making carbon credit trading 
                accessible, transparent, and efficient for everyone.
              </p>
              <p className="text-gray-600 mb-8">
                We believe that climate action should be accessible to all. By creating a trusted platform 
                that connects carbon credit buyers and sellers worldwide, we're enabling individuals and 
                organizations to take meaningful action against climate change.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/marketplace">
                  <Button size="lg">
                    Start Trading
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-green-100 to-blue-100 rounded-2xl flex items-center justify-center">
                <div className="text-center">
                  <Leaf className="h-24 w-24 text-green-500 mx-auto mb-4" />
                  <p className="text-gray-600">Our Impact Visualization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do at Carbonease
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-center mb-4 text-green-600">
                    {value.icon}
                  </div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {value.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Together, we're making a real difference in the fight against climate change
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">1.2M+</div>
              <div className="text-gray-600">Carbon Credits Traded</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">500+</div>
              <div className="text-gray-600">Active Projects</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600 mb-2">50+</div>
              <div className="text-gray-600">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600 mb-2">200+</div>
              <div className="text-gray-600">Verified Sellers</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Our Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Scale Carbon Markets</h4>
                      <p className="text-sm text-gray-600">Make carbon credit trading accessible to everyone</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Ensure Quality</h4>
                      <p className="text-sm text-gray-600">Maintain the highest standards for all carbon credits</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Drive Innovation</h4>
                      <p className="text-sm text-gray-600">Develop new technologies for carbon market efficiency</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Build Community</h4>
                      <p className="text-sm text-gray-600">Foster a global community of climate action leaders</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Our Commitment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Climate Action</h4>
                      <p className="text-sm text-gray-600">Every transaction contributes to real climate impact</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Transparency</h4>
                      <p className="text-sm text-gray-600">Complete visibility into all transactions and impacts</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Security</h4>
                      <p className="text-sm text-gray-600">Bank-level security for all transactions and data</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                    <div>
                      <h4 className="font-medium">Support</h4>
                      <p className="text-sm text-gray-600">24/7 customer support for all users</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The passionate individuals driving Carbonease forward
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-green-600">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <CardTitle className="text-lg">{member.name}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {member.role}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {member.bio}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Key milestones in our mission to democratize carbon credit trading
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-green-200"></div>
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <div key={index} className={`flex items-center ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                  <div className={`w-1/2 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className="bg-green-100 text-green-800">
                            {milestone.year}
                          </Badge>
                          <h3 className="font-semibold text-lg">{milestone.title}</h3>
                        </div>
                        <p className="text-gray-600">{milestone.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="w-8 h-8 bg-green-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center z-10">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                  <div className="w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Join Our Mission
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Be part of the solution. Start trading carbon credits today and make a real impact on climate change.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4" />
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
