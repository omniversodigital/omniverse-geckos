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
const investorContactSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  company: z.string().min(2, 'Company name must be at least 2 characters'),
  position: z.string().min(2, 'Position must be at least 2 characters'),
  investmentRange: z.enum([
    '10k-50k',
    '50k-100k', 
    '100k-500k',
    '500k-1m',
    '1m-5m',
    '5m+'
  ]),
  investmentType: z.array(z.string()).min(1, 'Please select at least one investment type'),
  timeline: z.enum(['immediate', '1-3months', '3-6months', '6-12months', 'exploring']),
  experience: z.enum(['first-time', 'some-experience', 'experienced', 'expert']),
  interests: z.array(z.string()).min(1, 'Please select areas of interest'),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  website: z.string().url().optional().or(z.literal('')),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  requestMeeting: z.boolean().default(false),
  subscribeUpdates: z.boolean().default(true),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
})

type InvestorContactFormData = z.infer<typeof investorContactSchema>

const investmentRangeOptions = [
  { value: '10k-50k', label: '$10K - $50K', badge: 'Angel' },
  { value: '50k-100k', label: '$50K - $100K', badge: 'Series Seed' },
  { value: '100k-500k', label: '$100K - $500K', badge: 'Series A' },
  { value: '500k-1m', label: '$500K - $1M', badge: 'Growth' },
  { value: '1m-5m', label: '$1M - $5M', badge: 'Scale' },
  { value: '5m+', label: '$5M+', badge: 'Institution' }
]

const investmentTypeOptions = [
  { id: 'equity', label: '🏢 Equity Investment', description: 'Traditional equity stake' },
  { id: 'token', label: '🪙 Token Investment', description: 'Native token allocation' },
  { id: 'nft', label: '🖼️ NFT Investment', description: 'Strategic NFT purchases' },
  { id: 'partnership', label: '🤝 Strategic Partnership', description: 'Business collaboration' },
  { id: 'advisory', label: '🧭 Advisory Role', description: 'Advisor + investment' },
  { id: 'licensing', label: '📜 Licensing Deal', description: 'IP or tech licensing' }
]

const timelineOptions = [
  { value: 'immediate', label: '🚀 Ready Now', emoji: '🚀' },
  { value: '1-3months', label: '📅 1-3 Months', emoji: '📅' },
  { value: '3-6months', label: '⏳ 3-6 Months', emoji: '⏳' },
  { value: '6-12months', label: '📆 6-12 Months', emoji: '📆' },
  { value: 'exploring', label: '🔍 Just Exploring', emoji: '🔍' }
]

const experienceOptions = [
  { value: 'first-time', label: '🌱 First-time Web3 Investor' },
  { value: 'some-experience', label: '📚 Some Web3 Experience' },
  { value: 'experienced', label: '⭐ Experienced Web3 Investor' },
  { value: 'expert', label: '🏆 Web3 Investment Expert' }
]

const interestOptions = [
  { id: 'gaming', label: '🎮 Gaming Technology' },
  { id: 'nft', label: '🖼️ NFT Marketplace' },
  { id: 'defi', label: '💰 DeFi Integration' },
  { id: 'ai', label: '🤖 AI Technology' },
  { id: 'infrastructure', label: '🛠️ Web3 Infrastructure' },
  { id: 'community', label: '👥 Community Building' }
]

interface InvestorContactFormProps {
  onSuccess?: () => void
  className?: string
}

export function InvestorContactForm({ onSuccess, className }: InvestorContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { trackEvent } = useAnalytics()
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid }
  } = useForm<InvestorContactFormData>({
    resolver: zodResolver(investorContactSchema),
    defaultValues: {
      investmentType: [],
      interests: [],
      requestMeeting: false,
      subscribeUpdates: true,
      agreeToTerms: false
    }
  })

  const selectedInvestmentType = watch('investmentType') || []
  const selectedInterests = watch('interests') || []
  const selectedInvestmentRange = watch('investmentRange')
  const selectedTimeline = watch('timeline')

  const toggleInvestmentType = (typeId: string) => {
    const current = selectedInvestmentType
    const updated = current.includes(typeId)
      ? current.filter(id => id !== typeId)
      : [...current, typeId]
    setValue('investmentType', updated, { shouldValidate: true })
  }

  const toggleInterest = (interestId: string) => {
    const current = selectedInterests
    const updated = current.includes(interestId)
      ? current.filter(id => id !== interestId)
      : [...current, interestId]
    setValue('interests', updated, { shouldValidate: true })
  }

  const onSubmit = async (data: InvestorContactFormData) => {
    setIsSubmitting(true)
    
    try {
      // Track form submission attempt
      trackEvent('investor_contact_form_submit', {
        investment_range: data.investmentRange,
        investment_type: data.investmentType,
        timeline: data.timeline,
        experience: data.experience,
        interests: data.interests,
        request_meeting: data.requestMeeting
      })

      const response = await fetch('/api/investor-contact', {
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
        trackEvent('investor_contact_success', {
          investment_range: data.investmentRange,
          investment_type: data.investmentType,
          timeline: data.timeline,
          conversion_source: 'investor_contact_form'
        })

        toast.success('🎉 Thank you for your interest!', {
          description: 'We\'ll get back to you within 24 hours with detailed information.'
        })

        onSuccess?.()
      } else {
        throw new Error(result.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Investor contact error:', error)
      
      // Track error
      trackEvent('investor_contact_form_error', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      })

      toast.error('Oops! Something went wrong', {
        description: 'Please try again or contact us directly at investors@omniversegeckos.com'
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
            <span className="text-2xl">🤝</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">
            We've received your investment inquiry and will get back to you within 24 hours 
            with detailed information and next steps.
          </p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">
              📧 Check your email for:
            </p>
            <ul className="text-sm text-blue-700 text-left list-disc list-inside space-y-1">
              <li>Investment deck and whitepaper</li>
              <li>Financial projections</li>
              <li>Token economics details</li>
              <li>Meeting scheduling link</li>
            </ul>
          </div>
          
          <div className="flex justify-center space-x-4">
            <a 
              href="/docs/investor-deck" 
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              View Investor Deck
            </a>
            <a 
              href="/docs/whitepaper" 
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Read Whitepaper
            </a>
          </div>
          
          <Button 
            onClick={() => setIsSuccess(false)}
            variant="outline"
            className="w-full mt-4"
          >
            Submit Another Inquiry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Investment Inquiry 💰
        </h2>
        <p className="text-gray-600">
          Join leading investors in shaping the future of Web3 gaming
        </p>
      </div>

      {/* Personal & Company Information */}
      <div className="grid md:grid-cols-2 gap-6">
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

        <div>
          <Label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company/Fund *
          </Label>
          <Input
            id="company"
            type="text"
            placeholder="Your company or investment fund"
            {...register('company')}
            className={errors.company ? 'border-red-500' : ''}
          />
          {errors.company && (
            <p className="text-red-500 text-sm mt-1">{errors.company.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
            Position/Title *
          </Label>
          <Input
            id="position"
            type="text"
            placeholder="Your role or title"
            {...register('position')}
            className={errors.position ? 'border-red-500' : ''}
          />
          {errors.position && (
            <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
          )}
        </div>
      </div>

      {/* Investment Details */}
      <div className="space-y-6">
        {/* Investment Range */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            Investment Range *
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {investmentRangeOptions.map((option) => (
              <label
                key={option.value}
                className={`relative flex flex-col items-center justify-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedInvestmentRange === option.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  {...register('investmentRange')}
                  className="sr-only"
                />
                <div className="text-center">
                  <div className="font-medium text-sm mb-1">{option.label}</div>
                  <Badge variant="secondary" className="text-xs">
                    {option.badge}
                  </Badge>
                </div>
              </label>
            ))}
          </div>
          {errors.investmentRange && (
            <p className="text-red-500 text-sm mt-1">{errors.investmentRange.message}</p>
          )}
        </div>

        {/* Investment Type */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            Investment Type * (select all that apply)
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {investmentTypeOptions.map((type) => (
              <label
                key={type.id}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedInvestmentType.includes(type.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedInvestmentType.includes(type.id)}
                  onChange={() => toggleInvestmentType(type.id)}
                  className="sr-only"
                />
                <div>
                  <div className="font-medium text-sm mb-1">{type.label}</div>
                  <div className="text-xs text-gray-600">{type.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.investmentType && (
            <p className="text-red-500 text-sm mt-1">{errors.investmentType.message}</p>
          )}
        </div>

        {/* Timeline & Experience */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Investment Timeline *
            </Label>
            <div className="space-y-2">
              {timelineOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTimeline === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register('timeline')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.timeline && (
              <p className="text-red-500 text-sm mt-1">{errors.timeline.message}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-3">
              Web3 Investment Experience *
            </Label>
            <div className="space-y-2">
              {experienceOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    watch('experience') === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register('experience')}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{option.label}</span>
                </label>
              ))}
            </div>
            {errors.experience && (
              <p className="text-red-500 text-sm mt-1">{errors.experience.message}</p>
            )}
          </div>
        </div>

        {/* Areas of Interest */}
        <div>
          <Label className="block text-sm font-medium text-gray-700 mb-3">
            Areas of Interest * (select all that apply)
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {interestOptions.map((interest) => (
              <label
                key={interest.id}
                className={`flex items-center justify-center p-3 border rounded-lg cursor-pointer transition-colors ${
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
                <span className="text-sm font-medium text-center">{interest.label}</span>
              </label>
            ))}
          </div>
          {errors.interests && (
            <p className="text-red-500 text-sm mt-1">{errors.interests.message}</p>
          )}
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-1">
              LinkedIn URL (optional)
            </Label>
            <Input
              id="linkedinUrl"
              type="url"
              placeholder="https://linkedin.com/in/yourprofile"
              {...register('linkedinUrl')}
            />
          </div>

          <div>
            <Label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
              Company Website (optional)
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://yourcompany.com"
              {...register('website')}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Message *
          </Label>
          <Textarea
            id="message"
            placeholder="Tell us about your investment focus, portfolio, and specific interest in Omniverse Geckos. What questions can we answer for you?"
            rows={4}
            {...register('message')}
            className={errors.message ? 'border-red-500' : ''}
          />
          {errors.message && (
            <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
          )}
        </div>
      </div>

      {/* Checkboxes */}
      <div className="space-y-3">
        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('requestMeeting')}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            I'd like to schedule a meeting to discuss this opportunity in detail
          </span>
        </label>

        <label className="flex items-start space-x-3">
          <input
            type="checkbox"
            {...register('subscribeUpdates')}
            className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">
            Send me updates on funding rounds, milestones, and exclusive investor updates
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
            Submitting Inquiry...
          </>
        ) : (
          '💼 Submit Investment Inquiry'
        )}
      </Button>

      {/* Trust Indicators */}
      <div className="text-center text-xs text-gray-500 space-y-1">
        <p>🔒 All information is confidential and secure</p>
        <p>⚡ We respond to all inquiries within 24 hours</p>
        <div className="flex justify-center items-center space-x-4 pt-2">
          <Badge variant="secondary" className="text-xs">
            💰 Series A Raising
          </Badge>
          <Badge variant="secondary" className="text-xs">
            🚀 $2M Target
          </Badge>
          <Badge variant="secondary" className="text-xs">
            📈 High Growth
          </Badge>
        </div>
      </div>
    </form>
  )
}