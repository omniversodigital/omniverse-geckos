'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAnalytics } from '@/components/analytics/AnalyticsProvider'
import { toast } from 'sonner'

// Form validation schema
const earlyAccessSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  userType: z.enum(['investor', 'gamer', 'developer', 'influencer', 'other']),
  interests: z.array(z.string()).min(1, 'Please select at least one interest'),
  walletAddress: z.string().optional(),
  socialHandle: z.string().optional(),
  message: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  subscribeNewsletter: z.boolean().default(true)
})

type EarlyAccessFormData = z.infer<typeof earlyAccessSchema>

const interestOptions = [
  { id: 'gaming', label: '🎮 Gaming', description: 'Play-to-earn games' },
  { id: 'nfts', label: '🖼️ NFTs', description: 'Collect unique assets' },
  { id: 'defi', label: '💰 DeFi', description: 'Yield farming & staking' },
  { id: 'investment', label: '📈 Investment', description: 'Token investment' },
  { id: 'development', label: '⚡ Development', description: 'Build on platform' },
  { id: 'community', label: '🤝 Community', description: 'Join the ecosystem' }
]

const userTypeOptions = [
  { value: 'investor', label: '💰 Investor', emoji: '💰' },
  { value: 'gamer', label: '🎮 Gamer', emoji: '🎮' },
  { value: 'developer', label: '⚡ Developer', emoji: '⚡' },
  { value: 'influencer', label: '🎯 Influencer', emoji: '🎯' },
  { value: 'other', label: '🤔 Other', emoji: '🤔' }
]

interface EarlyAccessFormProps {
  onSuccess?: () => void
  className?: string
}

export function EarlyAccessForm({ onSuccess, className }: EarlyAccessFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { trackEvent } = useAnalytics()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<EarlyAccessFormData>({
    resolver: zodResolver(earlyAccessSchema),
    defaultValues: {
      interests: [],
      subscribeNewsletter: true,
      agreeToTerms: false
    }
  })

  const selectedInterests = watch('interests') || []
  const selectedUserType = watch('userType')

  const toggleInterest = (interestId: string) => {
    const current = selectedInterests
    const updated = current.includes(interestId)
      ? current.filter(id => id !== interestId)
      : [...current, interestId]
    setValue('interests', updated, { shouldValidate: true })
  }

  const onSubmit = async (data: EarlyAccessFormData) => {
    setIsSubmitting(true)
    
    try {
      // Track form submission attempt
      trackEvent('early_access_form_submit', {
        user_type: data.userType,
        interests: data.interests,
        has_wallet: !!data.walletAddress,
        has_social: !!data.socialHandle
      })

      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setIsSuccess(true)
        
        // Track successful submission
        trackEvent('early_access_signup_success', {
          user_type: data.userType,
          interests: data.interests,
          conversion_source: 'early_access_form'
        })

        toast.success('🎉 Welcome to Omniverse Geckos!', {
          description: 'You\'re now on the early access list. Check your email for next steps!'
        })

        onSuccess?.()
      } else {
        throw new Error(result.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Early access signup error:', error)
      
      // Track error
      trackEvent('early_access_form_error', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })

      toast.error('Oops! Something went wrong', {
        description: 'Please try again or contact support if the problem persists.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className={`max-w-md mx-auto text-center p-8 ${className}`}>
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">You're In!</h3>
          <p className="text-gray-600">
            Welcome to the Omniverse Geckos early access community! 
            Check your email for next steps and exclusive updates.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium">
              🔗 Join our community while you wait:
            </p>
            <div className="flex justify-center space-x-4 mt-2">
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">Discord</a>
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">Twitter</a>
              <a href="#" className="text-blue-600 hover:text-blue-800 text-sm">Telegram</a>
            </div>
          </div>
          
          <Button 
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="w-full"
          >
            Sign Up Another Person
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Join Early Access 🦎
        </h2>
        <p className="text-gray-600">
          Be among the first to experience the future of Web3 gaming
        </p>
      </div>

      {/* Personal Information */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter your full name"
            {...register('fullName')}
            className={errors.fullName ? 'border-red-500' : ''}
          />
          {errors.fullName && (
            <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address *
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email address"
            {...register('email')}
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>
      </div>

      {/* User Type Selection */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-3">
          I am a... *
        </Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {userTypeOptions.map((option) => (
            <label
              key={option.value}
              className={`relative flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedUserType === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="radio"
                value={option.value}
                {...register('userType')}
                className="sr-only"
              />
              <span className="text-center">
                <div className="text-lg mb-1">{option.emoji}</div>
                <div className="text-xs font-medium">
                  {option.label.replace(option.emoji + ' ', '')}
                </div>
              </span>
            </label>
          ))}
        </div>
        {errors.userType && (
          <p className="text-red-500 text-sm mt-1">{errors.userType.message}</p>
        )}
      </div>

      {/* Interests */}
      <div>
        <Label className="block text-sm font-medium text-gray-700 mb-3">
          I'm interested in... * (select all that apply)
        </Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {interestOptions.map((interest) => (
            <label
              key={interest.id}
              className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedInterests.includes(interest.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedInterests.includes(interest.id)}
                onChange={() => toggleInterest(interest.id)}
                className="sr-only"
              />
              <div>
                <div className="font-medium text-sm mb-1">{interest.label}</div>
                <div className="text-xs text-gray-600">{interest.description}</div>
              </div>
            </label>
          ))}
        </div>
        {errors.interests && (
          <p className="text-red-500 text-sm mt-1">{errors.interests.message}</p>
        )}
      </div>

      {/* Optional Fields */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="walletAddress" className="block text-sm font-medium text-gray-700 mb-1">
            Wallet Address (optional)
          </Label>
          <Input
            id="walletAddress"
            type="text"
            placeholder="0x... (we'll never ask for your private keys)"
            {...register('walletAddress')}
          />
        </div>

        <div>
          <Label htmlFor="socialHandle" className="block text-sm font-medium text-gray-700 mb-1">
            Social Handle (optional)
          </Label>
          <Input
            id="socialHandle"
            type="text"
            placeholder="@username (Twitter, Discord, etc.)"
            {...register('socialHandle')}
          />
        </div>

        <div>
          <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Tell us about yourself (optional)
          </Label>
          <Textarea
            id="message"
            placeholder="What excites you most about Omniverse Geckos? Any questions or feedback?"
            rows={3}
            {...register('message')}
          />
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('subscribeNewsletter')}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Subscribe to our newsletter for updates, exclusive content, and early access announcements
          </span>
        </label>

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('agreeToTerms')}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I agree to the{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
              Privacy Policy
            </a>{' '}
            *
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-sm mt-1">{errors.agreeToTerms.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!isValid || isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Joining Waitlist...
          </>
        ) : (
          '🚀 Join Early Access'
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>🔒 Your information is secure and will never be shared</p>
        <p>📧 You can unsubscribe at any time</p>
        <div className="flex justify-center items-center space-x-4 pt-2">
          <Badge variant="secondary" className="text-xs">
            🦎 Early Access
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🎮 Limited Spots
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🎁 Exclusive Benefits
          </Badge>
        </div>
      </div>
    </form>
  )
}