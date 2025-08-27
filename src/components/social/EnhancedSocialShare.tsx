'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Share2, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Instagram,
  Copy, 
  Check, 
  Download,
  Image as ImageIcon,
  ExternalLink,
  TrendingUp,
  Users,
  Heart,
  MessageCircle,
  Repeat2,
  BarChart3,
  Trophy,
  Zap,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTwitterAPI } from '@/lib/twitter/TwitterAPI'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface ShareableContent {
  title: string
  description: string
  url: string
  image?: string
  hashtags?: string[]
  type: 'achievement' | 'nft' | 'game_result' | 'tournament' | 'general'
  metadata?: {
    score?: number
    rank?: number
    nftId?: string
    playerName?: string
    gameMode?: string
    timestamp?: Date
  }
}

interface SocialPlatform {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  shareUrl: (content: ShareableContent) => string
  maxLength?: number
  supportsMedia: boolean
}

interface ShareAnalytics {
  platform: string
  shares: number
  clicks: number
  engagement: number
  reach: number
}

// =============================================================================
// Social Platforms Configuration
// =============================================================================

const socialPlatforms: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter/X',
    icon: Twitter,
    color: 'hover:text-blue-400',
    maxLength: 280,
    supportsMedia: true,
    shareUrl: (content) => {
      const text = `${content.title}\n\n${content.description}\n\n${(content.hashtags || []).join(' ')}`
      const params = new URLSearchParams({
        text: text.slice(0, 240),
        url: content.url
      })
      return `https://twitter.com/intent/tweet?${params.toString()}`
    }
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'hover:text-blue-600',
    supportsMedia: true,
    shareUrl: (content) => {
      const params = new URLSearchParams({
        u: content.url,
        quote: `${content.title} - ${content.description}`
      })
      return `https://www.facebook.com/sharer/sharer.php?${params.toString()}`
    }
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'hover:text-blue-700',
    supportsMedia: true,
    shareUrl: (content) => {
      const params = new URLSearchParams({
        url: content.url,
        title: content.title,
        summary: content.description
      })
      return `https://www.linkedin.com/sharing/share-offsite/?${params.toString()}`
    }
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'hover:text-pink-500',
    supportsMedia: true,
    shareUrl: (content) => {
      // Instagram doesn't support direct URL sharing, so we'll copy to clipboard
      return ''
    }
  }
]

// =============================================================================
// Enhanced Social Share Component
// =============================================================================

export function EnhancedSocialShare({ 
  content,
  className,
  showAnalytics = false,
  showCustomization = true,
  defaultOpen = false
}: {
  content: ShareableContent
  className?: string
  showAnalytics?: boolean
  showCustomization?: boolean
  defaultOpen?: boolean
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [copied, setCopied] = useState(false)
  const [customContent, setCustomContent] = useState(content)
  const [isSharing, setIsSharing] = useState<string | null>(null)
  const [shareAnalytics, setShareAnalytics] = useState<ShareAnalytics[]>([])
  
  const { api: twitterAPI, isAvailable: twitterAvailable } = useTwitterAPI()

  // Update custom content when content prop changes
  useEffect(() => {
    setCustomContent(content)
  }, [content])

  // Mock analytics data
  useEffect(() => {
    setShareAnalytics([
      { platform: 'Twitter/X', shares: 125, clicks: 342, engagement: 4.2, reach: 15600 },
      { platform: 'Facebook', shares: 89, clicks: 231, engagement: 3.8, reach: 8900 },
      { platform: 'LinkedIn', shares: 34, clicks: 156, engagement: 5.1, reach: 4200 },
      { platform: 'Instagram', shares: 67, clicks: 198, engagement: 3.9, reach: 7100 }
    ])
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const shareToSocial = async (platform: SocialPlatform) => {
    setIsSharing(platform.id)

    try {
      if (platform.id === 'twitter' && twitterAvailable && twitterAPI) {
        // Use Twitter API for direct posting
        const tweetText = generateTweetText(customContent)
        
        const tweetData: any = {
          text: tweetText
        }

        // Add media if available
        if (customContent.image) {
          try {
            const response = await fetch(customContent.image)
            const blob = await response.blob()
            const file = new File([blob], 'share-image.png', { type: blob.type })
            const mediaId = await twitterAPI.uploadMedia(file, 'image')
            tweetData.media_ids = [mediaId]
          } catch (error) {
            console.error('Failed to upload image:', error)
          }
        }

        await twitterAPI.postTweet(tweetData)
        toast.success('Posted to Twitter/X successfully!')
      } else if (platform.id === 'instagram') {
        // For Instagram, copy content to clipboard
        const instagramText = generateInstagramText(customContent)
        await copyToClipboard(instagramText)
        toast.success('Instagram content copied! Paste it in your Instagram app.')
      } else {
        // Open share URL in new window
        const shareUrl = platform.shareUrl(customContent)
        if (shareUrl) {
          window.open(shareUrl, '_blank', 'width=600,height=400')
          toast.success(`Opened ${platform.name} sharing window`)
        }
      }

      // Update analytics (mock)
      setShareAnalytics(prev => 
        prev.map(item => 
          item.platform === platform.name 
            ? { ...item, shares: item.shares + 1 }
            : item
        )
      )
    } catch (error) {
      console.error(`Failed to share to ${platform.name}:`, error)
      toast.error(`Failed to share to ${platform.name}`)
    } finally {
      setIsSharing(null)
    }
  }

  const generateTweetText = (content: ShareableContent): string => {
    let text = ''
    
    switch (content.type) {
      case 'achievement':
        text = `🏆 Just unlocked: "${content.title}"!\n\n${content.description}`
        if (content.metadata?.score) {
          text += `\n🎯 Score: ${content.metadata.score.toLocaleString()}`
        }
        break
      
      case 'nft':
        text = `🦎 Check out my new Gecko NFT!\n\n${content.title}\n${content.description}`
        if (content.metadata?.nftId) {
          text += `\n🆔 Token ID: #${content.metadata.nftId}`
        }
        break
      
      case 'game_result':
        text = `🎮 Game Complete!\n\n${content.title}\n${content.description}`
        if (content.metadata?.score) {
          text += `\n🏆 Final Score: ${content.metadata.score.toLocaleString()}`
        }
        if (content.metadata?.rank) {
          text += `\n📈 Rank: #${content.metadata.rank}`
        }
        break
      
      case 'tournament':
        text = `⚔️ Tournament Update!\n\n${content.title}\n${content.description}`
        break
      
      default:
        text = `${content.title}\n\n${content.description}`
    }
    
    // Add hashtags
    if (content.hashtags && content.hashtags.length > 0) {
      text += `\n\n${content.hashtags.join(' ')}`
    }
    
    // Add URL
    text += `\n\n${content.url}`
    
    return text.slice(0, 270) // Leave room for Twitter URL shortening
  }

  const generateInstagramText = (content: ShareableContent): string => {
    let text = `${content.title}\n\n${content.description}\n\n`
    
    if (content.metadata?.score) {
      text += `Score: ${content.metadata.score.toLocaleString()}\n`
    }
    
    if (content.hashtags && content.hashtags.length > 0) {
      text += `\n${content.hashtags.join(' ')}`
    }
    
    text += `\n\nPlay now: ${content.url}`
    
    return text
  }

  const getContentTypeIcon = (type: ShareableContent['type']) => {
    switch (type) {
      case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />
      case 'nft': return <Sparkles className="h-4 w-4 text-purple-500" />
      case 'game_result': return <Zap className="h-4 w-4 text-blue-500" />
      case 'tournament': return <BarChart3 className="h-4 w-4 text-green-500" />
      default: return <Share2 className="h-4 w-4" />
    }
  }

  // Quick share buttons (compact view)
  const QuickShareButtons = () => (
    <div className="flex items-center space-x-2">
      {socialPlatforms.slice(0, 3).map((platform) => (
        <Button
          key={platform.id}
          variant="ghost"
          size="sm"
          onClick={() => shareToSocial(platform)}
          disabled={isSharing === platform.id}
          className={cn("transition-colors", platform.color)}
        >
          {isSharing === platform.id ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
          ) : (
            <platform.icon className="h-4 w-4" />
          )}
        </Button>
      ))}
      
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <Share2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <EnhancedShareDialog />
        </DialogContent>
      </Dialog>
    </div>
  )

  // Full share dialog content
  const EnhancedShareDialog = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          {getContentTypeIcon(content.type)}
          Share Your {content.type.replace('_', ' ').toUpperCase()}
        </DialogTitle>
      </DialogHeader>

      <Tabs defaultValue="share" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="share">Share</TabsTrigger>
          {showCustomization && <TabsTrigger value="customize">Customize</TabsTrigger>}
          {showAnalytics && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        <TabsContent value="share" className="space-y-4">
          {/* Content Preview */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Content Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                {customContent.image && (
                  <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={customContent.image} 
                      alt="Share preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm line-clamp-2">{customContent.title}</h4>
                  <p className="text-xs text-muted-foreground line-clamp-3 mt-1">
                    {customContent.description}
                  </p>
                  {customContent.hashtags && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {customContent.hashtags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Platforms */}
          <div className="grid grid-cols-2 gap-3">
            {socialPlatforms.map((platform) => (
              <motion.div key={platform.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  variant="outline"
                  onClick={() => shareToSocial(platform)}
                  disabled={isSharing === platform.id}
                  className="w-full h-auto p-4 flex items-center justify-start space-x-3"
                >
                  {isSharing === platform.id ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
                  ) : (
                    <platform.icon className="h-5 w-5" />
                  )}
                  <div className="text-left">
                    <div className="font-medium">{platform.name}</div>
                    {platform.maxLength && (
                      <div className="text-xs text-muted-foreground">
                        Max {platform.maxLength} chars
                      </div>
                    )}
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>

          {/* Copy Link */}
          <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
            <Input
              value={customContent.url}
              readOnly
              className="flex-1 text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(customContent.url)}
              className="flex-shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </TabsContent>

        {showCustomization && (
          <TabsContent value="customize" className="space-y-4">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={customContent.title}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter title..."
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea
                  value={customContent.description}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter description..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Hashtags</label>
                <Input
                  value={customContent.hashtags?.join(' ') || ''}
                  onChange={(e) => setCustomContent(prev => ({ 
                    ...prev, 
                    hashtags: e.target.value.split(' ').filter(Boolean)
                  }))}
                  placeholder="#OmniverseGeckos #Web3Gaming #NFT"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Share URL</label>
                <Input
                  value={customContent.url}
                  onChange={(e) => setCustomContent(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://..."
                />
              </div>
            </div>
          </TabsContent>
        )}

        {showAnalytics && (
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shareAnalytics.map((analytics) => (
                <Card key={analytics.platform}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">{analytics.platform}</h4>
                      <Badge variant="secondary">{analytics.engagement}% engagement</Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Share2 className="h-3 w-3" />
                          Shares
                        </span>
                        <span className="font-medium">{analytics.shares.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Clicks
                        </span>
                        <span className="font-medium">{analytics.clicks.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          Reach
                        </span>
                        <span className="font-medium">{analytics.reach.toLocaleString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Total Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {shareAnalytics.reduce((sum, item) => sum + item.shares, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Shares</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {shareAnalytics.reduce((sum, item) => sum + item.clicks, 0)}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Clicks</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {shareAnalytics.reduce((sum, item) => sum + item.reach, 0).toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground">Total Reach</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </>
  )

  // Return appropriate view based on className
  if (className?.includes('compact')) {
    return <QuickShareButtons />
  }

  return (
    <div className={cn("", className)}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Share
            {getContentTypeIcon(content.type)}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <EnhancedShareDialog />
        </DialogContent>
      </Dialog>
    </div>
  )
}

// =============================================================================
// Auto Share Component for Game Events
// =============================================================================

export function AutoSharePrompt({
  content,
  onShare,
  onDismiss,
  autoCloseDelay = 10000
}: {
  content: ShareableContent
  onShare: (platform: string) => void
  onDismiss: () => void
  autoCloseDelay?: number
}) {
  const [timeLeft, setTimeLeft] = useState(autoCloseDelay / 1000)

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          onDismiss()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [onDismiss])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 50, scale: 0.9 }}
        className="fixed bottom-4 right-4 z-50 max-w-md"
      >
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              {getContentTypeIcon(content.type)}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm mb-1">Share your achievement!</h4>
                <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                  {content.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      onClick={() => onShare('twitter')}
                      className="h-8 px-3 text-xs"
                    >
                      <Twitter className="h-3 w-3 mr-1" />
                      Share
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onDismiss}
                      className="h-8 px-3 text-xs"
                    >
                      Later
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    {timeLeft}s
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  )
}

function getContentTypeIcon(type: ShareableContent['type']) {
  switch (type) {
    case 'achievement': return <Trophy className="h-4 w-4 text-yellow-500" />
    case 'nft': return <Sparkles className="h-4 w-4 text-purple-500" />
    case 'game_result': return <Zap className="h-4 w-4 text-blue-500" />
    case 'tournament': return <BarChart3 className="h-4 w-4 text-green-500" />
    default: return <Share2 className="h-4 w-4" />
  }
}