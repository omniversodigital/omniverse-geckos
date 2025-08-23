'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Github, 
  Twitter, 
  Discord, 
  Mail, 
  ExternalLink,
  Shield,
  FileText,
  HelpCircle,
  Zap,
  Users,
  Code,
  Heart
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'
import { toast } from 'sonner'

// =============================================================================
// Footer Links Data
// =============================================================================

const footerLinks = {
  product: {
    title: 'Product',
    links: [
      { name: 'Game', href: '/game' },
      { name: 'Marketplace', href: '/marketplace' },
      { name: 'Casino', href: '/casino' },
      { name: 'Leaderboard', href: '/leaderboard' },
      { name: 'Roadmap', href: '/roadmap' }
    ]
  },
  resources: {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API Reference', href: '/api' },
      { name: 'Whitepaper', href: '/whitepaper' },
      { name: 'Tokenomics', href: '/tokenomics' },
      { name: 'Smart Contracts', href: '/contracts' }
    ]
  },
  community: {
    title: 'Community',
    links: [
      { name: 'Discord Server', href: 'https://discord.gg/omniversegeckos', external: true },
      { name: 'Twitter', href: 'https://twitter.com/omniversegeckos', external: true },
      { name: 'GitHub', href: 'https://github.com/omniversegeckos', external: true },
      { name: 'Medium Blog', href: 'https://medium.com/@omniversegeckos', external: true },
      { name: 'Reddit', href: 'https://reddit.com/r/omniversegeckos', external: true }
    ]
  },
  company: {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Team', href: '/team' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press Kit', href: '/press' },
      { name: 'Contact', href: '/contact' }
    ]
  },
  legal: {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'Disclaimer', href: '/disclaimer' },
      { name: 'Security', href: '/security' }
    ]
  }
}

const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/omniversegeckos',
    icon: Twitter,
    color: 'hover:text-blue-400'
  },
  {
    name: 'Discord',
    href: 'https://discord.gg/omniversegeckos',
    icon: Discord,
    color: 'hover:text-indigo-400'
  },
  {
    name: 'GitHub',
    href: 'https://github.com/omniversegeckos',
    icon: Github,
    color: 'hover:text-gray-400'
  }
]

// =============================================================================
// Newsletter Component
// =============================================================================

function Newsletter() {
  const [email, setEmail] = useState('')
  const [isSubscribing, setIsSubscribing] = useState(false)

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubscribing(true)

    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!')
      setEmail('')
      setIsSubscribing(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Newsletter
        </h3>
        <p className="text-sm text-muted-foreground">
          Stay updated with the latest news, updates, and exclusive content from Omniverse Geckos.
        </p>
      </div>

      <form onSubmit={handleSubscribe} className="space-y-3">
        <Input
          type="email"
          placeholder="Enter your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-muted/50"
        />
        <Button 
          type="submit" 
          className="w-full btn-game" 
          disabled={isSubscribing}
        >
          {isSubscribing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Subscribing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Subscribe
            </>
          )}
        </Button>
      </form>

      <p className="text-xs text-muted-foreground">
        By subscribing, you agree to our Privacy Policy and consent to receive updates from our team.
      </p>
    </div>
  )
}

// =============================================================================
// Stats Component
// =============================================================================

function FooterStats() {
  const stats = [
    { label: 'Active Players', value: '15.7K+', icon: Users },
    { label: 'NFTs Minted', value: '8.2K', icon: Zap },
    { label: 'Total Volume', value: '847 ETH', icon: Shield },
    { label: 'Games Played', value: '125K+', icon: Code }
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-6 border-t border-b border-border/50">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          viewport={{ once: true }}
          className="text-center space-y-2"
        >
          <stat.icon className="h-6 w-6 mx-auto text-primary" />
          <div className="text-2xl font-bold">{stat.value}</div>
          <div className="text-sm text-muted-foreground">{stat.label}</div>
        </motion.div>
      ))}
    </div>
  )
}

// =============================================================================
// Main Footer Component
// =============================================================================

export function Footer() {
  return (
    <footer className="bg-muted/20 border-t">
      <div className="container mx-auto px-4">
        {/* Stats Section */}
        <FooterStats />

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-8">
            {/* Brand & Newsletter */}
            <div className="lg:col-span-2 space-y-6">
              {/* Brand */}
              <div>
                <Link href="/" className="flex items-center space-x-2 mb-4">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className="text-3xl"
                  >
                    🦎
                  </motion.div>
                  <span className="text-2xl font-bold text-gradient">
                    Omniverse Geckos
                  </span>
                </Link>
                <p className="text-muted-foreground mb-4">
                  The ultimate Web3 gaming ecosystem where tower defense meets NFT collecting 
                  with play-to-earn mechanics. Build your army of unique Gecko NFTs and 
                  dominate the battlefield!
                </p>
                
                {/* Social Links */}
                <div className="flex space-x-4">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-muted-foreground transition-colors ${social.color}`}
                    >
                      <social.icon className="h-5 w-5" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Newsletter */}
              <Newsletter />
            </div>

            {/* Footer Links */}
            <div className="lg:col-span-4 grid grid-cols-2 md:grid-cols-5 gap-8">
              {Object.entries(footerLinks).map(([key, section]) => (
                <div key={key}>
                  <h3 className="font-semibold mb-4">{section.title}</h3>
                  <ul className="space-y-2">
                    {section.links.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          target={link.external ? '_blank' : undefined}
                          rel={link.external ? 'noopener noreferrer' : undefined}
                          className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                        >
                          {link.name}
                          {link.external && <ExternalLink className="h-3 w-3" />}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Omniverse Geckos. All rights reserved.
            </div>

            {/* Additional Info */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Secured by Blockchain</span>
              </div>
              <div className="flex items-center space-x-1">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Made with passion</span>
              </div>
            </div>

            {/* Version */}
            <div className="text-xs text-muted-foreground">
              v1.0.0 - Beta
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}