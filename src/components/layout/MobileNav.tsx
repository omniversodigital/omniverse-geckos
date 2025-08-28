'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAccount } from 'wagmi'
import {
  Menu,
  X,
  Home,
  Gamepad2,
  ShoppingBag,
  Trophy,
  Users,
  Moon,
  Sun,
  Zap,
  Coins,
  User,
  Dice1,
  ChevronRight
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGeckoToken } from '@/blockchain/hooks/useGeckoToken'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
}

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
  },
  {
    name: 'Game',
    href: '/game',
    icon: Gamepad2,
    badge: 'NEW'
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
  },
  {
    name: 'Casino',
    href: '/casino',
    icon: Dice1,
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
  },
  {
    name: 'Guild',
    href: '/guild',
    icon: Users,
  }
]

export function MobileNav() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const { address, isConnected } = useAccount()
  const { balance, formatTokenAmount } = useGeckoToken()
  
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return null
  }

  return (
    <>
      {/* Mobile Header Bar - Fixed */}
      <nav className="lg:hidden fixed top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-1.5">
            <motion.div
              whileHover={{ rotate: 10, scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-xl"
            >
              🦎
            </motion.div>
            <span className="text-sm font-bold">
              Geckos
            </span>
          </Link>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Token Balance */}
            {isConnected && (
              <div className="flex items-center space-x-1 bg-yellow-500/10 px-2 py-1 rounded-md">
                <Coins className="h-3 w-3 text-yellow-500" />
                <span className="text-xs font-medium">
                  {formatTokenAmount(balance).split('.')[0]}
                </span>
              </div>
            )}

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-8 w-8"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(!isOpen)}
            >
              <AnimatePresence mode="wait">
                {isOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                  >
                    <Menu className="h-5 w-5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="lg:hidden h-14" />

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 z-50 w-full max-w-xs bg-background border-l shadow-xl"
            >
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Menu</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Menu Content */}
              <div className="flex flex-col h-[calc(100%-4rem)]">
                {/* Navigation Items */}
                <div className="flex-1 overflow-y-auto py-4">
                  {navigationItems.map((item, index) => {
                    const isActive = pathname === item.href
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            'flex items-center justify-between mx-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div className="flex items-center space-x-3">
                            <item.icon className="h-5 w-5" />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {item.badge && (
                              <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                                {item.badge}
                              </span>
                            )}
                            {isActive && (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </div>
                        </Link>
                      </motion.div>
                    )
                  })}
                </div>

                {/* Bottom Actions */}
                <div className="border-t p-4 space-y-3">
                  {/* Wallet Section */}
                  {isConnected ? (
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-muted-foreground">Wallet</span>
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="font-mono text-xs truncate">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-1">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium">
                            {formatTokenAmount(balance)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">$GECKO</span>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      className="w-full btn-game" 
                      onClick={() => {
                        // Trigger wallet connect
                        setIsOpen(false)
                      }}
                    >
                      <Zap className="mr-2 h-4 w-4" />
                      Connect Wallet
                    </Button>
                  )}

                  {/* Social Links */}
                  <div className="flex items-center justify-center space-x-4 pt-2">
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/>
                      </svg>
                    </Link>
                    <Link href="#" className="text-muted-foreground hover:text-foreground">
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515a.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0a12.64 12.64 0 00-.617-1.25a.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057a19.9 19.9 0 005.993 3.03a.078.078 0 00.084-.028a14.09 14.09 0 001.226-1.994a.076.076 0 00-.041-.106a13.107 13.107 0 01-1.872-.892a.077.077 0 01-.008-.128a10.2 10.2 0 00.372-.292a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127a12.299 12.299 0 01-1.873.892a.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028a19.839 19.839 0 006.002-3.03a.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}