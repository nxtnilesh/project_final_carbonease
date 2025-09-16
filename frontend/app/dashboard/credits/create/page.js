'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  X,
  Plus,
  Leaf,
  MapPin,
  Calendar,
  DollarSign,
  Award
} from 'lucide-react'
import { creditsAPI } from '@/lib/api'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

export default function CreateCreditPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState([])
  const [documents, setDocuments] = useState([])
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue
  } = useForm({
    defaultValues: {
      status: 'draft'
    }
  })

  const onSubmit = async (data) => {
    if (!isAuthenticated || user?.role !== 'seller') {
      toast.error('Only sellers can create carbon credits')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      
      // Append all form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if (key === 'projectLocation' || key === 'certification') {
            formData.append(key, JSON.stringify(data[key]))
          } else {
            formData.append(key, data[key])
          }
        }
      })

      // Append images
      images.forEach((image, index) => {
        formData.append(`images`, image)
      })

      // Append documents
      documents.forEach((doc, index) => {
        formData.append(`documents`, doc)
      })

      const response = await creditsAPI.createCredit(formData)
      
      if (response.data.success) {
        toast.success('Carbon credit created successfully!')
        router.push('/dashboard/credits')
      }
    } catch (error) {
      console.error('Error creating credit:', error)
      toast.error('Failed to create carbon credit')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    setImages(prev => [...prev, ...files])
  }

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files)
    setDocuments(prev => [...prev, ...files])
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index))
  }

  if (!isAuthenticated || user?.role !== 'seller') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Access Denied</CardTitle>
            <CardDescription>
              Only sellers can create carbon credit listings.
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create Carbon Credit</h1>
              <p className="text-gray-600 mt-2">
                List your carbon credits for sale on the marketplace
              </p>
            </div>
            <Link href="/dashboard/credits">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Credits
              </Button>
            </Link>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Leaf className="h-5 w-5 mr-2" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Provide basic details about your carbon credit project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="title">Project Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Solar Farm Project - California"
                  {...register('title', { required: 'Project title is required' })}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Project Description *</Label>
                <textarea
                  id="description"
                  rows={4}
                  placeholder="Describe your renewable energy project, its impact, and benefits..."
                  {...register('description', { required: 'Description is required' })}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                    errors.description ? 'border-red-500' : ''
                  }`}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="energyType">Energy Type *</Label>
                  <select
                    id="energyType"
                    {...register('energyType', { required: 'Energy type is required' })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.energyType ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select energy type</option>
                    <option value="solar">Solar</option>
                    <option value="wind">Wind</option>
                    <option value="hydro">Hydro</option>
                    <option value="geothermal">Geothermal</option>
                    <option value="biomass">Biomass</option>
                    <option value="nuclear">Nuclear</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.energyType && (
                    <p className="text-sm text-red-600 mt-1">{errors.energyType.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="projectSize">Project Size</Label>
                  <Input
                    id="projectSize"
                    placeholder="e.g., 50 MW, 100 acres"
                    {...register('projectSize')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Location Information
              </CardTitle>
              <CardDescription>
                Specify the location of your renewable energy project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="country">Country *</Label>
                  <Input
                    id="country"
                    placeholder="e.g., United States"
                    {...register('projectLocation.country', { required: 'Country is required' })}
                    className={errors.projectLocation?.country ? 'border-red-500' : ''}
                  />
                  {errors.projectLocation?.country && (
                    <p className="text-sm text-red-600 mt-1">{errors.projectLocation.country.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="e.g., California"
                    {...register('projectLocation.state')}
                  />
                </div>

                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="e.g., Los Angeles"
                    {...register('projectLocation.city')}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="coordinates">Coordinates (Optional)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Latitude"
                    {...register('projectLocation.latitude')}
                  />
                  <Input
                    placeholder="Longitude"
                    {...register('projectLocation.longitude')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Certification Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Award className="h-5 w-5 mr-2" />
                Certification Information
              </CardTitle>
              <CardDescription>
                Provide certification details for your carbon credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="standard">Certification Standard *</Label>
                  <select
                    id="standard"
                    {...register('certification.standard', { required: 'Certification standard is required' })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                      errors.certification?.standard ? 'border-red-500' : ''
                    }`}
                  >
                    <option value="">Select standard</option>
                    <option value="VCS">VCS (Verified Carbon Standard)</option>
                    <option value="Gold Standard">Gold Standard</option>
                    <option value="CAR">CAR (Climate Action Reserve)</option>
                    <option value="ACR">ACR (American Carbon Registry)</option>
                    <option value="CDM">CDM (Clean Development Mechanism)</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.certification?.standard && (
                    <p className="text-sm text-red-600 mt-1">{errors.certification.standard.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="certifier">Certifying Body *</Label>
                  <Input
                    id="certifier"
                    placeholder="e.g., Verra, Gold Standard Foundation"
                    {...register('certification.certifier', { required: 'Certifying body is required' })}
                    className={errors.certification?.certifier ? 'border-red-500' : ''}
                  />
                  {errors.certification?.certifier && (
                    <p className="text-sm text-red-600 mt-1">{errors.certification.certifier.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="certificateNumber">Certificate Number</Label>
                  <Input
                    id="certificateNumber"
                    placeholder="e.g., VCS-2024-001"
                    {...register('certification.certificateNumber')}
                  />
                </div>

                <div>
                  <Label htmlFor="vintageYear">Vintage Year</Label>
                  <Input
                    id="vintageYear"
                    type="number"
                    placeholder="e.g., 2024"
                    {...register('vintageYear')}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing and Availability */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Pricing and Availability
              </CardTitle>
              <CardDescription>
                Set the price and availability for your carbon credits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="availableCredits">Available Credits *</Label>
                  <Input
                    id="availableCredits"
                    type="number"
                    placeholder="e.g., 1000"
                    {...register('availableCredits', { 
                      required: 'Available credits is required',
                      min: { value: 1, message: 'Must be at least 1 credit' }
                    })}
                    className={errors.availableCredits ? 'border-red-500' : ''}
                  />
                  {errors.availableCredits && (
                    <p className="text-sm text-red-600 mt-1">{errors.availableCredits.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="pricePerCredit">Price per Credit (USD) *</Label>
                  <Input
                    id="pricePerCredit"
                    type="number"
                    step="0.01"
                    placeholder="e.g., 25.00"
                    {...register('pricePerCredit', { 
                      required: 'Price per credit is required',
                      min: { value: 0.01, message: 'Price must be greater than 0' }
                    })}
                    className={errors.pricePerCredit ? 'border-red-500' : ''}
                  />
                  {errors.pricePerCredit && (
                    <p className="text-sm text-red-600 mt-1">{errors.pricePerCredit.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="projectStartDate">Project Start Date</Label>
                  <Input
                    id="projectStartDate"
                    type="date"
                    {...register('projectStartDate')}
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <select
                    id="status"
                    {...register('status')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Media Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="h-5 w-5 mr-2" />
                Media and Documents
              </CardTitle>
              <CardDescription>
                Upload images and documents to showcase your project
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Images */}
              <div>
                <Label>Project Images</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload images of your project (JPG, PNG, GIF)
                  </p>
                </div>
                
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Documents */}
              <div>
                <Label>Project Documents</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleDocumentUpload}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Upload project documents (PDF, DOC, DOCX)
                  </p>
                </div>
                
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">PDF</span>
                          </div>
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeDocument(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-4">
            <Link href="/dashboard/credits">
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex items-center"
            >
              {isLoading ? (
                'Creating...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Carbon Credit
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
