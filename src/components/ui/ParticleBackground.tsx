'use client'

import { useEffect, useRef, useState } from 'react'
import { useTheme } from 'next-themes'

// =============================================================================
// Types
// =============================================================================

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  color: string
  life: number
  maxLife: number
}

interface ParticleBackgroundProps {
  particleCount?: number
  particleSpeed?: number
  particleSize?: number
  colors?: string[]
  interactive?: boolean
}

// =============================================================================
// Particle Background Component
// =============================================================================

export function ParticleBackground({
  particleCount = 50,
  particleSpeed = 0.5,
  particleSize = 2,
  colors = ['#22c55e', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'],
  interactive = true
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const particlesRef = useRef<Particle[]>([])
  const mouseRef = useRef({ x: 0, y: 0 })
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasSize()
    window.addEventListener('resize', setCanvasSize)

    // Initialize particles
    const initParticles = () => {
      particlesRef.current = []
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle())
      }
    }

    // Create a single particle
    const createParticle = (): Particle => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * particleSpeed,
        vy: (Math.random() - 0.5) * particleSpeed,
        size: Math.random() * particleSize + 1,
        opacity: Math.random() * 0.5 + 0.1,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 0,
        maxLife: Math.random() * 200 + 100
      }
    }

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      
      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = e.clientX - rect.left
      mouseRef.current.y = e.clientY - rect.top
    }

    // Animation loop
    const animate = () => {
      ctx.fillStyle = theme === 'dark' 
        ? 'rgba(2, 6, 23, 0.1)' 
        : 'rgba(255, 255, 255, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particlesRef.current.forEach((particle, index) => {
        // Update particle position
        particle.x += particle.vx
        particle.y += particle.vy
        particle.life++

        // Mouse interaction
        if (interactive) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 100) {
            const force = (100 - distance) / 100
            particle.vx += (dx / distance) * force * 0.01
            particle.vy += (dy / distance) * force * 0.01
          }
        }

        // Boundary collision
        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -1
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -1
        }

        // Fade effect based on life
        const lifeFactor = 1 - (particle.life / particle.maxLife)
        particle.opacity = lifeFactor * 0.5 + 0.1

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color.replace(')', `, ${particle.opacity})`)
          .replace('rgb', 'rgba')
          .replace('#', 'rgba(')
        
        // Convert hex to rgba if needed
        if (particle.color.startsWith('#')) {
          const hex = particle.color.replace('#', '')
          const r = parseInt(hex.substr(0, 2), 16)
          const g = parseInt(hex.substr(2, 2), 16)
          const b = parseInt(hex.substr(4, 2), 16)
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${particle.opacity})`
        } else {
          ctx.fillStyle = particle.color.includes('rgba') 
            ? particle.color 
            : particle.color.replace('rgb', 'rgba').replace(')', `, ${particle.opacity})`)
        }
        
        ctx.fill()

        // Add glow effect
        ctx.shadowColor = particle.color
        ctx.shadowBlur = particle.size * 2
        ctx.fill()
        ctx.shadowBlur = 0

        // Reset particle if it's too old
        if (particle.life >= particle.maxLife) {
          particlesRef.current[index] = createParticle()
        }
      })

      // Draw connections between nearby particles
      if (interactive) {
        particlesRef.current.forEach((particle, i) => {
          particlesRef.current.slice(i + 1).forEach((otherParticle) => {
            const dx = particle.x - otherParticle.x
            const dy = particle.y - otherParticle.y
            const distance = Math.sqrt(dx * dx + dy * dy)

            if (distance < 80) {
              ctx.beginPath()
              ctx.moveTo(particle.x, particle.y)
              ctx.lineTo(otherParticle.x, otherParticle.y)
              ctx.strokeStyle = theme === 'dark' 
                ? `rgba(255, 255, 255, ${0.1 * (1 - distance / 80)})` 
                : `rgba(0, 0, 0, ${0.05 * (1 - distance / 80)})`
              ctx.lineWidth = 0.5
              ctx.stroke()
            }
          })
        })
      }

      animationRef.current = requestAnimationFrame(animate)
    }

    // Initialize and start animation
    initParticles()
    animate()

    // Event listeners
    canvas.addEventListener('mousemove', handleMouseMove)

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      window.removeEventListener('resize', setCanvasSize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mounted, theme, particleCount, particleSpeed, particleSize, colors, interactive])

  if (!mounted) {
    return null
  }

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
      style={{
        background: theme === 'dark' 
          ? 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.05) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at top, rgba(16, 185, 129, 0.02) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(139, 92, 246, 0.02) 0%, transparent 50%)'
      }}
    />
  )
}

// =============================================================================
// Alternative Simple Particle Background
// =============================================================================

export function SimpleParticleBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1]">
      <div className="particles-container">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              backgroundColor: [
                '#22c55e',
                '#3b82f6', 
                '#8b5cf6',
                '#f59e0b',
                '#ef4444'
              ][Math.floor(Math.random() * 5)]
            }}
          />
        ))}
      </div>
    </div>
  )
}

// =============================================================================
// Gaming-themed Particle Background
// =============================================================================

export function GamingParticleBackground() {
  const symbols = ['🦎', '⚡', '🔥', '❄️', '☠️', '🌟', '💎', '👑']
  
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl opacity-20 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${6 + Math.random() * 4}s`,
          }}
        >
          {symbols[Math.floor(Math.random() * symbols.length)]}
        </div>
      ))}
    </div>
  )
}