'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  LogOut, 
  Settings, 
  Users, 
  Bell, 
  Shield,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Loader2,
  RefreshCw,
  Volume2,
  VolumeX
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { DiscordAPI, DiscordUser, DiscordGuild, type DiscordConfig } from '@/lib/discord/DiscordAPI'

const discordConfig: DiscordConfig = {
  clientId: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID || '',
  clientSecret: process.env.DISCORD_CLIENT_SECRET || '',
  redirectUri: process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI || `${typeof window !== 'undefined' ? window.location.origin : ''}/discord/callback`,
  botToken: process.env.DISCORD_BOT_TOKEN || '',
  scopes: ['identify', 'guilds', 'guilds.members.read']
}

interface DiscordAuthProps {
  onAuthChange?: (authenticated: boolean, user?: DiscordUser) => void
}

interface NotificationSettings {
  gameEvents: boolean
  nftMints: boolean
  tournaments: boolean
  achievements: boolean
  soundEnabled: boolean
  guildId?: string
  channelId?: string
}

const defaultNotificationSettings: NotificationSettings = {
  gameEvents: true,
  nftMints: true,
  tournaments: true,
  achievements: true,
  soundEnabled: true
}

export function DiscordAuth({ onAuthChange }: DiscordAuthProps) {
  const [discordAPI] = useState(() => new DiscordAPI(discordConfig))
  const [user, setUser] = useState<DiscordUser | null>(null)
  const [guilds, setGuilds] = useState<DiscordGuild[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
    defaultNotificationSettings
  )

  const loadNotificationSettings = useCallback(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('discord_notification_settings')
      if (saved) {
        try {
          setNotificationSettings({ ...defaultNotificationSettings, ...JSON.parse(saved) })
        } catch (error) {
          console.error('Failed to parse notification settings:', error)
        }
      }
    }
  }, [])

  const saveNotificationSettings = useCallback((settings: NotificationSettings) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('discord_notification_settings', JSON.stringify(settings))
      setNotificationSettings(settings)
    }
  }, [])

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true)
    
    try {
      if (discordAPI.isAuthenticated()) {
        const currentUser = await discordAPI.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
          const userGuilds = await discordAPI.getUserGuilds()
          setGuilds(userGuilds)
          onAuthChange?.(true, currentUser)
        } else {
          setUser(null)
          setGuilds([])
          onAuthChange?.(false)
        }
      } else {
        setUser(null)
        setGuilds([])
        onAuthChange?.(false)
      }
    } catch (error) {
      console.error('Failed to check Discord auth status:', error)
      setUser(null)
      setGuilds([])
      onAuthChange?.(false)
    } finally {
      setIsLoading(false)
    }
  }, [discordAPI, onAuthChange])

  useEffect(() => {
    checkAuthStatus()
    loadNotificationSettings()

    const handleAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      const error = urlParams.get('error')

      if (error) {
        toast.error(`Discord authentication error: ${error}`)
        return
      }

      if (code) {
        setIsConnecting(true)
        const success = await discordAPI.exchangeCodeForToken(code)
        if (success) {
          await checkAuthStatus()
          window.history.replaceState({}, document.title, window.location.pathname)
        }
        setIsConnecting(false)
      }
    }

    if (typeof window !== 'undefined') {
      handleAuthCallback()
    }
  }, [checkAuthStatus, discordAPI, loadNotificationSettings])

  const handleConnect = () => {
    const authUrl = discordAPI.getAuthUrl()
    window.location.href = authUrl
  }

  const handleDisconnect = () => {
    discordAPI.logout()
    setUser(null)
    setGuilds([])
    onAuthChange?.(false)
    toast.success('Disconnected from Discord')
  }

  const handleRefresh = async () => {
    await checkAuthStatus()
    toast.success('Discord connection refreshed')
  }

  const updateNotificationSetting = (key: keyof NotificationSettings, value: any) => {
    const newSettings = { ...notificationSettings, [key]: value }
    saveNotificationSettings(newSettings)
  }

  const getAvatarUrl = (user: DiscordUser) => {
    if (!user.avatar) return null
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=128`
  }

  const formatDiscriminator = (discriminator: string) => {
    return discriminator === '0' ? '' : `#${discriminator}`
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Loading Discord connection...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!user) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-blue-500" />
            Connect to Discord
          </CardTitle>
          <CardDescription>
            Connect your Discord account to receive game notifications and participate in the community.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Game achievements and milestones</li>
                <li>• NFT minting and marketplace activity</li>
                <li>• Tournament announcements</li>
                <li>• Community events and updates</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Community Features
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Join guild discussions</li>
                <li>• Participate in events</li>
                <li>• Connect with other players</li>
                <li>• Access exclusive channels</li>
              </ul>
            </div>
          </div>

          <Separator />

          <Button 
            onClick={handleConnect} 
            disabled={isConnecting}
            className="w-full"
            size="lg"
          >
            {isConnecting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <MessageCircle className="mr-2 h-4 w-4" />
                Connect Discord Account
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By connecting, you agree to our Privacy Policy and Discord's Terms of Service.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
            Discord Connected
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={getAvatarUrl(user) || undefined} />
                <AvatarFallback>
                  {user.username.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {user.username}{formatDiscriminator(user.discriminator)}
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                  {user.verified && (
                    <Badge variant="default" className="text-xs">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                title="Refresh connection"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDisconnect}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Disconnect
              </Button>
            </div>
          </div>

          {/* Guilds Summary */}
          {guilds.length > 0 && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Shared Servers</span>
                <Badge variant="outline">{guilds.length}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                {guilds.slice(0, 5).map((guild) => (
                  <div
                    key={guild.id}
                    className="flex items-center space-x-1 bg-muted px-2 py-1 rounded text-xs"
                  >
                    {guild.icon && (
                      <img
                        src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=32`}
                        alt={guild.name}
                        className="w-4 h-4 rounded"
                      />
                    )}
                    <span className="truncate max-w-[100px]">{guild.name}</span>
                    {guild.owner && (
                      <Badge variant="secondary" className="text-xs px-1">
                        Owner
                      </Badge>
                    )}
                  </div>
                ))}
                {guilds.length > 5 && (
                  <div className="bg-muted px-2 py-1 rounded text-xs">
                    +{guilds.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure which Discord notifications you'd like to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Notification Types */}
                <div className="space-y-4">
                  <h4 className="font-medium">Notification Types</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="gameEvents" className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Game Events
                      </Label>
                      <Switch
                        id="gameEvents"
                        checked={notificationSettings.gameEvents}
                        onCheckedChange={(checked) => 
                          updateNotificationSetting('gameEvents', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="nftMints" className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        NFT Activity
                      </Label>
                      <Switch
                        id="nftMints"
                        checked={notificationSettings.nftMints}
                        onCheckedChange={(checked) => 
                          updateNotificationSetting('nftMints', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="tournaments" className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Tournaments
                      </Label>
                      <Switch
                        id="tournaments"
                        checked={notificationSettings.tournaments}
                        onCheckedChange={(checked) => 
                          updateNotificationSetting('tournaments', checked)
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                      <Label htmlFor="achievements" className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Achievements
                      </Label>
                      <Switch
                        id="achievements"
                        checked={notificationSettings.achievements}
                        onCheckedChange={(checked) => 
                          updateNotificationSetting('achievements', checked)
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Sound Settings */}
                <div className="space-y-4">
                  <h4 className="font-medium">Sound Settings</h4>
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="soundEnabled" className="flex items-center gap-2">
                      {notificationSettings.soundEnabled ? (
                        <Volume2 className="h-4 w-4" />
                      ) : (
                        <VolumeX className="h-4 w-4" />
                      )}
                      Notification Sounds
                    </Label>
                    <Switch
                      id="soundEnabled"
                      checked={notificationSettings.soundEnabled}
                      onCheckedChange={(checked) => 
                        updateNotificationSetting('soundEnabled', checked)
                      }
                    />
                  </div>
                </div>

                <Separator />

                {/* Quick Actions */}
                <div className="space-y-4">
                  <h4 className="font-medium">Quick Actions</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const enabled = { ...defaultNotificationSettings, soundEnabled: true }
                        saveNotificationSettings(enabled)
                        toast.success('All notifications enabled')
                      }}
                    >
                      Enable All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const disabled = { ...defaultNotificationSettings, 
                          gameEvents: false, 
                          nftMints: false, 
                          tournaments: false, 
                          achievements: false,
                          soundEnabled: false 
                        }
                        saveNotificationSettings(disabled)
                        toast.success('All notifications disabled')
                      }}
                    >
                      Disable All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        saveNotificationSettings(defaultNotificationSettings)
                        toast.success('Settings reset to defaults')
                      }}
                    >
                      Reset to Default
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* External Links */}
                <div className="space-y-4">
                  <h4 className="font-medium">Community Links</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://discord.gg/omniversegeckos', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Join Official Server
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open('https://support.discord.com', '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Discord Help
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}