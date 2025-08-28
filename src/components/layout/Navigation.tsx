'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  Menu,
  X,
  Home,
  Gamepad2,
  ShoppingBag,
  Trophy,
  Users,
  Settings,
  Moon,
  Sun,
  Zap,
  Coins,
  User,
  LogOut,
  BarChart3,
  Dice1
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useGeckoToken } from '@/blockchain/hooks/useGeckoToken'

// =============================================================================
// Types
// =============================================================================

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  description?: string
}

// =============================================================================
// Navigation Data
// =============================================================================

const navigationItems: NavigationItem[] = [
  {
    name: 'Home',
    href: '/',
    icon: Home,
    description: 'Main dashboard and overview'
  },
  {
    name: 'Game',
    href: '/game',
    icon: Gamepad2,
    description: 'Play the tower defense game'
  },
  {
    name: 'Marketplace',
    href: '/marketplace',
    icon: ShoppingBag,
    description: 'Buy and sell NFTs'
  },
  {
    name: 'Casino',
    href: '/casino',
    icon: Dice1,
    description: 'Mini-games and gambling'
  },
  {
    name: 'Leaderboard',
    href: '/leaderboard',
    icon: Trophy,
    description: 'Top players and rankings'
  },
  {
    name: 'Guild',
    href: '/guild',
    icon: Users,
    description: 'Join or manage guilds'
  }
]

// =============================================================================
// Main Navigation Component
// =============================================================================

export function Navigation() {
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

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <motion.div
            whileHover={{ rotate: 10, scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-2xl"
          >
            🦎
          </motion.div>
          <span className="text-xl font-bold text-gradient">
            Omniverse Geckos
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-lg -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Token Balance (if connected) */}
          {isConnected && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden sm:flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-lg"
            >
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">
                {formatTokenAmount(balance)}
              </span>
              <span className="text-xs text-muted-foreground">$GECKO</span>
            </motion.div>
          )}

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-9 w-9"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          {/* Connect Wallet Button */}
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted: connectMounted,
            }) => {
              const ready = connectMounted
              const connected = ready && account && chain

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <Button onClick={openConnectModal} className="btn-game">
                          <Zap className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      )
                    }

                    if (chain.unsupported) {
                      return (
                        <Button onClick={openChainModal} variant="destructive">
                          Wrong network
                        </Button>
                      )
                    }

                    return (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          className="hidden sm:flex items-center space-x-2"
                        >
                          <User className="h-4 w-4" />
                          <span>
                            {account.displayName}
                            {account.displayBalance
                              ? ` (${account.displayBalance})`
                              : ''}
                          </span>
                        </Button>
                        <Button
                          onClick={openAccountModal}
                          variant="outline"
                          size="sm"
                          className="sm:hidden"
                        >
                          <User className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                  })()}
                </div>
              )
            }}
          </ConnectButton.Custom>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="sm:hidden border-t bg-background/95 backdrop-blur"
          >
            <div className="container px-4 py-4 space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <div>
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </Link>
                )
              })}

              {/* Mobile Token Balance */}
              {isConnected && (
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg mt-4">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5 text-yellow-500" />
                    <span className="font-medium">$GECKO Balance</span>
                  </div>
                  <span className="text-lg font-bold text-green-500">
                    {formatTokenAmount(balance)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}