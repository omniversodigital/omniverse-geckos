'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Twitter, 
  UserCheck, 
  UserX, 
  Shield, 
  Key, 
  ExternalLink,
  RefreshCw,
  Settings,
  Bell,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Users,
  TrendingUp,
  MessageCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog'
import { useTwitterAPI, type TwitterUser } from '@/lib/twitter/TwitterAPI'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface TwitterAuthState {
  isAuthenticated: boolean
  user: TwitterUser | null
  isLoading: boolean
  error: string | null
  permissions: {
    read: boolean
    write: boolean
    direct_messages: boolean
  }
}

interface AutoPostSettings {
  achievements: boolean
  nftMints: boolean
  tournaments: boolean
  highScores: boolean
  levelUps: boolean
}

// =============================================================================
// Twitter Authentication Component
// =============================================================================

export function TwitterAuth({ 
  onAuthChange,
  showSettings = true,
  compact = false
}: {
  onAuthChange?: (authenticated: boolean, user: TwitterUser | null) => void
  showSettings?: boolean
  compact?: boolean
}) {
  const [authState, setAuthState] = useState<TwitterAuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null,
    permissions: {
      read: false,
      write: false,
      direct_messages: false
    }
  })

  const [autoPostSettings, setAutoPostSettings] = useState<AutoPostSettings>({
    achievements: true,
    nftMints: true,
    tournaments: false,
    highScores: true,
    levelUps: false
  })

  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const { api: twitterAPI, isAvailable: twitterAvailable } = useTwitterAPI()

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  // Notify parent component of auth changes
  useEffect(() => {
    onAuthChange?.(authState.isAuthenticated, authState.user)
  }, [authState.isAuthenticated, authState.user, onAuthChange])

  const checkAuthStatus = async () => {
    if (!twitterAvailable || !twitterAPI) return

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      // Check if we have stored credentials
      const storedAuth = localStorage.getItem('twitter_auth')
      if (!storedAuth) {
        setAuthState(prev => ({ ...prev, isLoading: false }))
        return
      }

      // Verify credentials with Twitter API
      const user = await twitterAPI.verifyCredentials()
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: true,
        user,
        isLoading: false,
        permissions: {
          read: true,
          write: true,
          direct_messages: false // This would require additional permissions
        }
      }))

      toast.success(`Welcome back, ${user.name}!`)
    } catch (error) {
      console.error('Auth verification failed:', error)
      
      // Clear invalid credentials
      localStorage.removeItem('twitter_auth')
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: 'Authentication expired. Please sign in again.'
      }))
    }
  }

  const initiateAuth = async () => {
    if (!twitterAvailable || !twitterAPI) {
      toast.error('Twitter integration not available')
      return
    }

    setAuthState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const { auth_url, oauth_token } = await twitterAPI.authenticateUser()
      
      // Store oauth_token for callback
      localStorage.setItem('twitter_oauth_token', oauth_token)
      
      // Open Twitter auth in popup
      const popup = window.open(
        auth_url,
        'twitter_auth',
        'width=600,height=600,scrollbars=yes,resizable=yes'
      )

      // Listen for popup close or callback
      const checkClosed = setInterval(() => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          // Check if auth was successful
          setTimeout(() => {
            checkAuthStatus()
          }, 1000)
        }
      }, 1000)

    } catch (error) {
      console.error('Twitter auth failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }))
      toast.error('Failed to initiate Twitter authentication')
    }
  }

  const disconnect = async () => {
    try {
      // Clear stored credentials
      localStorage.removeItem('twitter_auth')
      localStorage.removeItem('twitter_oauth_token')
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null,
        permissions: {
          read: false,
          write: false,
          direct_messages: false
        }
      })

      toast.success('Disconnected from Twitter/X')
    } catch (error) {
      console.error('Disconnect failed:', error)
      toast.error('Failed to disconnect')
    }
  }

  const testConnection = async () => {
    if (!authState.isAuthenticated || !twitterAPI) return

    setAuthState(prev => ({ ...prev, isLoading: true }))

    try {
      // Test by posting a simple tweet
      const testTweet = await twitterAPI.postTweet({
        text: `🦎 Testing Twitter connection from Omniverse Geckos! #OmniverseGeckos #Web3Gaming`
      })

      toast.success('Connection test successful! Tweet posted.')
      
      // Optionally delete the test tweet after a few seconds
      setTimeout(async () => {
        try {
          await twitterAPI.deleteTweet(testTweet.id)
        } catch (error) {
          console.error('Failed to delete test tweet:', error)
        }
      }, 10000)

    } catch (error) {
      console.error('Connection test failed:', error)
      toast.error('Connection test failed')
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }))
    }
  }

  const updateAutoPostSetting = (setting: keyof AutoPostSettings, enabled: boolean) => {
    setAutoPostSettings(prev => ({
      ...prev,
      [setting]: enabled
    }))

    // Save to localStorage
    localStorage.setItem('twitter_autopost_settings', JSON.stringify({
      ...autoPostSettings,
      [setting]: enabled
    }))

    toast.success(`Auto-posting for ${setting} ${enabled ? 'enabled' : 'disabled'}`)
  }

  // Load auto-post settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('twitter_autopost_settings')
    if (saved) {
      try {
        setAutoPostSettings(JSON.parse(saved))
      } catch (error) {
        console.error('Failed to parse auto-post settings:', error)
      }
    }
  }, [])

  // Compact view for mobile/sidebar
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {authState.isAuthenticated && authState.user ? (
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={authState.user.profile_image_url} />
              <AvatarFallback>
                <Twitter className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground">
              @{authState.user.username}
            </span>
            {showSettings && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <Settings className="h-3 w-3" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <TwitterSettingsContent />
                </DialogContent>
              </Dialog>
            )}
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={initiateAuth}
            disabled={authState.isLoading}
            className="h-8 text-xs"
          >
            {authState.isLoading ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <Twitter className="h-3 w-3 mr-1" />
            )}
            Connect
          </Button>
        )}
      </div>
    )
  }

  // Full Twitter Auth Component
  const TwitterSettingsContent = () => (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Twitter className="h-5 w-5 text-blue-400" />
          Twitter/X Integration Settings
        </DialogTitle>
        <DialogDescription>
          Manage your Twitter/X connection and auto-posting preferences
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6">
        {/* Account Status */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <UserCheck className="h-4 w-4" />
            Account Status
          </h4>
          
          {authState.user && (
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={authState.user.profile_image_url} />
                <AvatarFallback>
                  <Twitter className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{authState.user.name}</span>
                  {authState.user.verified && (
                    <Badge variant="secondary" className="text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{authState.user.username}</p>
                <div className="flex items-center space-x-4 text-xs text-muted-foreground mt-1">
                  <span>{authState.user.public_metrics.followers_count.toLocaleString()} followers</span>
                  <span>{authState.user.public_metrics.following_count.toLocaleString()} following</span>
                </div>
              </div>
            </div>
          )}

          {/* Permissions */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Permissions</p>
            <div className="grid grid-cols-3 gap-2">
              <div className="flex items-center space-x-2 text-xs">
                {authState.permissions.read ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Read</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                {authState.permissions.write ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-red-500" />
                )}
                <span>Write</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                {authState.permissions.direct_messages ? (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                ) : (
                  <AlertCircle className="h-3 w-3 text-muted-foreground" />
                )}
                <span>DMs</span>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Auto-Post Settings */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Auto-Post Settings
          </h4>
          
          <div className="space-y-3">
            {Object.entries({
              achievements: { label: 'Achievements', icon: '🏆' },
              nftMints: { label: 'NFT Mints', icon: '🦎' },
              tournaments: { label: 'Tournament Updates', icon: '⚔️' },
              highScores: { label: 'High Scores', icon: '🎯' },
              levelUps: { label: 'Level Ups', icon: '📈' }
            }).map(([key, config]) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">{config.icon}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <Switch
                  checked={autoPostSettings[key as keyof AutoPostSettings]}
                  onCheckedChange={(enabled) => 
                    updateAutoPostSetting(key as keyof AutoPostSettings, enabled)
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex flex-col space-y-3">
          <Button
            variant="outline"
            onClick={testConnection}
            disabled={authState.isLoading || !authState.isAuthenticated}
            className="w-full"
          >
            {authState.isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )}
            Test Connection
          </Button>
          
          <Button
            variant="destructive"
            onClick={disconnect}
            disabled={authState.isLoading}
            className="w-full"
          >
            <UserX className="h-4 w-4 mr-2" />
            Disconnect Account
          </Button>
        </div>
      </div>
    </>
  )

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-blue-400" />
            Twitter/X Integration
          </div>
          {authState.isAuthenticated && (
            <Badge variant="secondary" className="text-xs">
              <CheckCircle className="h-3 w-3 mr-1" />
              Connected
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Error Display */}
        {authState.error && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authState.error}</AlertDescription>
          </Alert>
        )}

        {/* Not Connected State */}
        {!authState.isAuthenticated && (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
              <Twitter className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Connect Your Twitter/X Account</h3>
              <p className="text-sm text-muted-foreground">
                Share your gaming achievements and NFTs automatically to your Twitter/X feed
              </p>
            </div>
            <Button 
              onClick={initiateAuth} 
              disabled={authState.isLoading}
              className="w-full"
            >
              {authState.isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Twitter className="h-4 w-4 mr-2" />
              )}
              Connect Twitter/X Account
            </Button>
          </div>
        )}

        {/* Connected State */}
        {authState.isAuthenticated && authState.user && (
          <div className="space-y-4">
            {/* User Info */}
            <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
              <Avatar>
                <AvatarImage src={authState.user.profile_image_url} />
                <AvatarFallback>
                  <Twitter className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{authState.user.name}</span>
                  {authState.user.verified && (
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">@{authState.user.username}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <div className="text-lg font-bold">{authState.user.public_metrics.followers_count.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Followers</div>
              </div>
              <div>
                <div className="text-lg font-bold">{authState.user.public_metrics.tweet_count.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Tweets</div>
              </div>
              <div>
                <div className="text-lg font-bold">{authState.user.public_metrics.following_count.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">Following</div>
              </div>
            </div>

            {/* Actions */}
            {showSettings && (
              <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <TwitterSettingsContent />
                </DialogContent>
              </Dialog>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// =============================================================================
// Twitter Connect Button (Standalone)
// =============================================================================

export function TwitterConnectButton({ 
  onConnect,
  className,
  variant = "default"
}: {
  onConnect?: (user: TwitterUser) => void
  className?: string
  variant?: "default" | "outline" | "ghost"
}) {
  const [isConnecting, setIsConnecting] = useState(false)
  const { api: twitterAPI, isAvailable } = useTwitterAPI()

  const handleConnect = async () => {
    if (!isAvailable || !twitterAPI) {
      toast.error('Twitter integration not available')
      return
    }

    setIsConnecting(true)

    try {
      const { auth_url } = await twitterAPI.authenticateUser()
      
      const popup = window.open(auth_url, 'twitter_auth', 'width=600,height=600')
      
      const checkClosed = setInterval(async () => {
        if (popup?.closed) {
          clearInterval(checkClosed)
          
          // Verify authentication
          try {
            const user = await twitterAPI.verifyCredentials()
            onConnect?.(user)
            toast.success(`Connected to Twitter as ${user.name}`)
          } catch (error) {
            console.error('Verification failed:', error)
          }
        }
      }, 1000)

    } catch (error) {
      console.error('Twitter connect failed:', error)
      toast.error('Failed to connect to Twitter')
    } finally {
      setIsConnecting(false)
    }
  }

  return (
    <Button 
      variant={variant}
      onClick={handleConnect}
      disabled={isConnecting}
      className={cn("flex items-center gap-2", className)}
    >
      {isConnecting ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Twitter className="h-4 w-4" />
      )}
      Connect Twitter/X
    </Button>
  )
}