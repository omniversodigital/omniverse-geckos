'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, 
  X, 
  Home, 
  Gamepad2, 
  ShoppingBag, 
  Users, 
  Trophy, 
  BookOpen,
  Settings,
  Bell,
  Activity,
  Zap,
  TrendingUp,
  Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { EnhancedWalletConnect } from '@/components/wallet/EnhancedWalletConnect'
import { EnhancedAIAssistant } from '@/components/ai/EnhancedAIAssistant'
import { useEnhancedWallet } from '@/blockchain/hooks/useEnhancedWallet'
import { cn } from '@/lib/utils'

// =============================================================================
// Types
// =============================================================================

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  external?: boolean
}

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: number
  read: boolean
}

// =============================================================================
// Navigation Items
// =============================================================================

const navItems: NavItem[] = [
  {
    href: '/',
    label: 'Home',
    icon: Home
  },
  {
    href: '/game',
    label: 'Play',
    icon: Gamepad2,
    badge: 'New'
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    icon: ShoppingBag
  },
  {
    href: '/guilds',
    label: 'Guilds',
    icon: Users
  },
  {
    href: '/tournaments',
    label: 'Tournaments',
    icon: Trophy,
    badge: 3 // Active tournaments
  },
  {
    href: '/learn',
    label: 'Learn',
    icon: BookOpen
  }
]

// =============================================================================
// Enhanced Navbar Component
// =============================================================================

export function EnhancedNavbar() {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [gameState, setGameState] = useState<any>(null)
  
  // Enhanced wallet hook
  const {
    isConnected,
    metrics,
    networkHealth,
    security,
    healthScore,
    hasSecurityRisks,
    isNetworkCongested
  } = useEnhancedWallet()

  // Mock notifications
  useEffect(() => {
    if (isConnected) {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Tournament Starting',
          message: 'Weekly championship begins in 1 hour!',
          type: 'info',
          timestamp: Date.now() - 300000,
          read: false
        },
        {
          id: '2', 
          title: 'Breeding Complete',
          message: 'Your new Gecko NFT is ready!',
          type: 'success',
          timestamp: Date.now() - 600000,
          read: false
        }
      ]
      
      if (hasSecurityRisks) {
        mockNotifications.unshift({
          id: 'security',
          title: 'Security Alert',
          message: 'Review your wallet security settings',
          type: 'warning',
          timestamp: Date.now(),
          read: false
        })
      }

      if (isNetworkCongested) {
        mockNotifications.unshift({
          id: 'network',
          title: 'Network Congestion',
          message: 'High gas prices detected',
          type: 'warning',
          timestamp: Date.now(),
          read: false
        })
      }
      
      setNotifications(mockNotifications)
    }
  }, [isConnected, hasSecurityRisks, isNetworkCongested])

  const unreadCount = notifications.filter(n => !n.read).length

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'warning': return <Shield className="h-4 w-4 text-yellow-500" />
      case 'error': return <Activity className="h-4 w-4 text-red-500" />
      default: return <Zap className="h-4 w-4 text-blue-500" />
    }
  }

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">🦎</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Omniverse Geckos
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.href} href={item.href} className="relative group">
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center gap-2 transition-colors",
                      isActive && "bg-primary text-primary-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                    {item.badge && (
                      <Badge 
                        variant={typeof item.badge === 'number' ? "secondary" : "outline"}
                        className="text-xs scale-75 -mr-1"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-md -z-10"
                      initial={false}
                      transition={{ type: "spring", duration: 0.6 }}
                    />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Notifications */}
            {isConnected && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold"
                      >
                        {unreadCount}
                      </motion.div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="p-3 border-b">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notifications
                      {unreadCount > 0 && (
                        <Badge variant="secondary">{unreadCount}</Badge>
                      )}
                    </h4>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((notification) => (
                        <DropdownMenuItem
                          key={notification.id}
                          className="p-3 cursor-pointer"
                          onClick={() => markAsRead(notification.id)}
                        >
                          <div className="flex items-start space-x-3 w-full">
                            {getNotificationIcon(notification.type)}
                            <div className="flex-1 min-w-0">
                              <p className={cn(
                                "text-sm font-medium",
                                !notification.read && "font-semibold"
                              )}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(notification.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-2" />
                            )}
                          </div>
                        </DropdownMenuItem>
                      ))
                    ) : (
                      <div className="p-6 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No notifications</p>
                      </div>
                    )}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Wallet Status Indicator */}
            {isConnected && (
              <div className="hidden md:flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-full">
                <div className={cn("w-2 h-2 rounded-full", {
                  'bg-green-400': healthScore > 80,
                  'bg-yellow-400': healthScore > 60,
                  'bg-red-400': healthScore <= 60
                })} />
                <span className="text-xs font-medium">
                  Health: {healthScore}%
                </span>
              </div>
            )}

            {/* Enhanced Wallet Connect */}
            <EnhancedWalletConnect compact className="hidden md:block" />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t bg-background"
            >
              <div className="container py-4 space-y-3">
                {/* Mobile Navigation */}
                <div className="space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Button
                          variant={isActive ? "default" : "ghost"}
                          size="sm"
                          className="w-full justify-start"
                        >
                          <item.icon className="h-4 w-4 mr-2" />
                          {item.label}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    )
                  })}
                </div>

                {/* Mobile Wallet */}
                <div className="pt-3 border-t">
                  <EnhancedWalletConnect compact />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Enhanced AI Assistant */}
      <EnhancedAIAssistant 
        gameState={gameState}
        playerStats={{
          winRate: 0.75,
          averageScore: 15000,
          gamesPlayed: 24,
          geckoTokens: metrics.geckoBalance,
          nftCollection: [],
          skillLevel: 'intermediate',
          preferredStrategies: ['defensive', 'economic']
        }}
        onRecommendationApply={(recommendation) => {
          console.log('Applying recommendation:', recommendation)
          // Handle recommendation application
        }}
      />
    </>
  )
}