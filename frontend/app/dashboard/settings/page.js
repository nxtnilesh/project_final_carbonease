'use client'

import { useState, useEffect } from 'react'
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
  User, 
  Lock, 
  Bell, 
  Shield,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react'
import { authAPI } from '@/lib/api'
import { useAuth } from '@/components/providers/AuthProvider'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { user, isAuthenticated, updateUser } = useAuth()
  const router = useRouter()

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile
  } = useForm()

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
    watch: watchPassword
  } = useForm()

  const {
    register: registerNotifications,
    handleSubmit: handleSubmitNotifications,
    formState: { errors: notificationErrors },
    reset: resetNotifications
  } = useForm()

  const newPassword = watchPassword('newPassword')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login')
      return
    }

    // Initialize form with user data
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        company: user.company || '',
        bio: user.bio || ''
      })

      resetNotifications({
        emailNotifications: user.emailNotifications !== false,
        smsNotifications: user.smsNotifications || false,
        marketingEmails: user.marketingEmails || false,
        transactionUpdates: user.transactionUpdates !== false,
        newListings: user.newListings !== false
      })
    }
  }, [isAuthenticated, user, resetProfile, resetNotifications])

  const onProfileSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authAPI.updateProfile(data)
      if (response.data.success) {
        updateUser(response.data.data)
        toast.success('Profile updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  const onPasswordSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authAPI.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword
      })
      if (response.data.success) {
        resetPassword()
        toast.success('Password changed successfully!')
      }
    } catch (error) {
      console.error('Error changing password:', error)
      toast.error('Failed to change password')
    } finally {
      setIsLoading(false)
    }
  }

  const onNotificationsSubmit = async (data) => {
    setIsLoading(true)
    try {
      const response = await authAPI.updateNotificationSettings(data)
      if (response.data.success) {
        updateUser(response.data.data)
        toast.success('Notification settings updated!')
      }
    } catch (error) {
      console.error('Error updating notifications:', error)
      toast.error('Failed to update notification settings')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return
    }

    if (!confirm('This will permanently delete your account and all associated data. Are you absolutely sure?')) {
      return
    }

    setIsLoading(true)
    try {
      const response = await authAPI.deleteAccount()
      if (response.data.success) {
        toast.success('Account deleted successfully')
        router.push('/')
      }
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Failed to delete account')
    } finally {
      setIsLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'password', name: 'Password', icon: Lock },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'security', name: 'Security', icon: Shield }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
              <p className="text-gray-600 mt-2">
                Manage your account settings and preferences
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-0">
                <nav className="space-y-1">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-none ${
                          activeTab === tab.id
                            ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {tab.name}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and profile details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitProfile(onProfileSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          {...registerProfile('firstName', { required: 'First name is required' })}
                          className={profileErrors.firstName ? 'border-red-500' : ''}
                        />
                        {profileErrors.firstName && (
                          <p className="text-sm text-red-600 mt-1">{profileErrors.firstName.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          {...registerProfile('lastName', { required: 'Last name is required' })}
                          className={profileErrors.lastName ? 'border-red-500' : ''}
                        />
                        {profileErrors.lastName && (
                          <p className="text-sm text-red-600 mt-1">{profileErrors.lastName.message}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...registerProfile('email', { 
                          required: 'Email is required',
                          pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className={profileErrors.email ? 'border-red-500' : ''}
                      />
                      {profileErrors.email && (
                        <p className="text-sm text-red-600 mt-1">{profileErrors.email.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          {...registerProfile('phone')}
                        />
                      </div>

                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          {...registerProfile('company')}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio">Bio</Label>
                      <textarea
                        id="bio"
                        rows={4}
                        placeholder="Tell us about yourself..."
                        {...registerProfile('bio')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <Card>
                <CardHeader>
                  <CardTitle>Change Password</CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-6">
                    <div>
                      <Label htmlFor="currentPassword">Current Password *</Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showCurrentPassword ? 'text' : 'password'}
                          {...registerPassword('currentPassword', { required: 'Current password is required' })}
                          className={passwordErrors.currentPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="newPassword">New Password *</Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          {...registerPassword('newPassword', { 
                            required: 'New password is required',
                            minLength: {
                              value: 6,
                              message: 'Password must be at least 6 characters'
                            }
                          })}
                          className={passwordErrors.newPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="confirmPassword">Confirm New Password *</Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          {...registerPassword('confirmPassword', { 
                            required: 'Please confirm your password',
                            validate: (value) =>
                              value === newPassword || 'Passwords do not match'
                          })}
                          className={passwordErrors.confirmPassword ? 'border-red-500 pr-10' : 'pr-10'}
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-400" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                      {passwordErrors.confirmPassword && (
                        <p className="text-sm text-red-600 mt-1">{passwordErrors.confirmPassword.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Updating...' : 'Update Password'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified about activities on your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmitNotifications(onNotificationsSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Email Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via email</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotifications('emailNotifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">SMS Notifications</h4>
                          <p className="text-sm text-gray-600">Receive notifications via SMS</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotifications('smsNotifications')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Marketing Emails</h4>
                          <p className="text-sm text-gray-600">Receive promotional emails and updates</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotifications('marketingEmails')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Transaction Updates</h4>
                          <p className="text-sm text-gray-600">Get notified about transaction status changes</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            {...registerNotifications('transactionUpdates')}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                        </label>
                      </div>

                      {user?.role === 'buyer' && (
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">New Listings</h4>
                            <p className="text-sm text-gray-600">Get notified about new carbon credit listings</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              {...registerNotifications('newListings')}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save Preferences'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Security</CardTitle>
                    <CardDescription>
                      Manage your account security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-green-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-green-700">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-blue-900">Login Activity</h4>
                        <p className="text-sm text-blue-700">View recent login activity and sessions</p>
                      </div>
                      <Button variant="outline" size="sm">
                        View Activity
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-yellow-900">API Keys</h4>
                        <p className="text-sm text-yellow-700">Manage your API keys for integrations</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Manage Keys
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-red-600">Danger Zone</CardTitle>
                    <CardDescription>
                      Irreversible and destructive actions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-700">
                          Permanently delete your account and all associated data
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={deleteAccount}
                        disabled={isLoading}
                        className="border-red-300 text-red-600 hover:bg-red-50"
                      >
                        Delete Account
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
