'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send,
  MessageCircle,
  HelpCircle,
  Users,
  ArrowRight
} from 'lucide-react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      // In a real implementation, this would send the form data to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      
      toast.success('Message sent successfully! We\'ll get back to you soon.')
      reset()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Failed to send message. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const contactInfo = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "support@carbonease.com",
      action: "mailto:support@carbonease.com"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: "Call Us",
      description: "Speak with our support team during business hours",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567"
    },
    {
      icon: <MapPin className="h-6 w-6" />,
      title: "Visit Us",
      description: "Our headquarters in San Francisco",
      contact: "123 Green Street, San Francisco, CA 94105",
      action: "https://maps.google.com"
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Business Hours",
      description: "We're here to help during these hours",
      contact: "Monday - Friday: 9:00 AM - 6:00 PM PST",
      action: null
    }
  ]

  const supportTopics = [
    {
      icon: <MessageCircle className="h-5 w-5" />,
      title: "General Support",
      description: "Questions about using our platform, account issues, or general inquiries"
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: "Technical Support",
      description: "Help with technical issues, API integration, or platform bugs"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Business Inquiries",
      description: "Partnership opportunities, enterprise solutions, or business development"
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
              Get in
              <span className="gradient-text block">Touch</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              We're here to help! Reach out to us with any questions, concerns, or feedback. 
              Our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...register('firstName', { required: 'First name is required' })}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && (
                        <p className="text-sm text-red-600 mt-1">{errors.firstName.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...register('lastName', { required: 'Last name is required' })}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && (
                        <p className="text-sm text-red-600 mt-1">{errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address'
                        }
                      })}
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <select
                      id="subject"
                      {...register('subject', { required: 'Subject is required' })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.subject ? 'border-red-500' : ''
                      }`}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing Question</option>
                      <option value="partnership">Partnership Opportunity</option>
                      <option value="feedback">Feedback</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.subject && (
                      <p className="text-sm text-red-600 mt-1">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <textarea
                      id="message"
                      rows={6}
                      placeholder="Tell us how we can help you..."
                      {...register('message', { 
                        required: 'Message is required',
                        minLength: {
                          value: 10,
                          message: 'Message must be at least 10 characters'
                        }
                      })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                        errors.message ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.message && (
                      <p className="text-sm text-red-600 mt-1">{errors.message.message}</p>
                    )}
                  </div>

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? (
                      'Sending...'
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Contact Methods */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              {contactInfo.map((info, index) => (
                <Card key={index} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                        {info.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{info.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{info.description}</p>
                        {info.action ? (
                          <a
                            href={info.action}
                            className="text-green-600 hover:text-green-700 font-medium text-sm"
                          >
                            {info.contact}
                          </a>
                        ) : (
                          <p className="text-gray-900 font-medium text-sm">{info.contact}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Support Topics */}
            <Card>
              <CardHeader>
                <CardTitle>How can we help?</CardTitle>
                <CardDescription>
                  Common topics we can assist you with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {supportTopics.map((topic, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                        {topic.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{topic.title}</h4>
                        <p className="text-xs text-gray-600">{topic.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* FAQ Link */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Find quick answers to common questions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/faq">
                  <Button variant="outline" className="w-full">
                    View FAQ
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-green-600" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                We typically respond to all inquiries within 24 hours during business days. 
                For urgent matters, please call us directly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
                Support Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Our support team is available Monday through Friday, 9:00 AM to 6:00 PM PST. 
                We also monitor emails during weekends.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-purple-600" />
                Community
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Join our community forum to connect with other users, share experiences, 
                and get help from the community.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
