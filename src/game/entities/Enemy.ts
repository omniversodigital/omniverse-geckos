import Phaser from 'phaser'
import { GameConfig, EnemyType } from '../core/GameConfig'

export interface StatusEffect {
  type: 'burn' | 'slow' | 'poison' | 'freeze'
  duration: number
  intensity: number
  tickDamage?: number
  startTime: number
}

export class Enemy extends Phaser.GameObjects.Container {
  private config: typeof GameConfig.ENEMIES[EnemyType]
  private enemyType: EnemyType
  private maxHealth: number
  private currentHealth: number
  private baseSpeed: number
  private currentSpeed: number
  private reward: number
  private path: Phaser.Curves.Path
  private pathProgress: number = 0
  private sprite: Phaser.GameObjects.Sprite
  private healthBar: Phaser.GameObjects.Graphics
  private statusEffects: StatusEffect[] = []
  private wave: number
  private distanceToGoal: number = 0

  constructor(
    scene: Phaser.Scene,
    enemyType: EnemyType,
    wave: number,
    path: Phaser.Curves.Path
  ) {
    super(scene, 0, 0)

    this.enemyType = enemyType
    this.config = GameConfig.ENEMIES[enemyType]
    this.wave = wave
    this.path = path
    
    // Scale stats based on wave
    this.maxHealth = GameConfig.GameUtils.calculateEnemyHealth(this.config.health, wave)
    this.currentHealth = this.maxHealth
    this.baseSpeed = this.config.speed
    this.currentSpeed = this.baseSpeed
    this.reward = this.config.reward + Math.floor(wave * 2)

    this.createEnemy()
    this.createHealthBar()
    
    // Set initial position
    const startPoint = this.path.getStartPoint()
    this.setPosition(startPoint.x, startPoint.y)

    scene.add.existing(this)
    scene.physics.add.existing(this)
    
    // Enable physics body
    const body = this.body as Phaser.Physics.Arcade.Body
    if (body) {
      body.setCircle(16)
    }
  }

  private createEnemy(): void {
    // Main enemy sprite
    this.sprite = this.scene.add.sprite(0, 0, 'enemy-placeholder')
    this.sprite.setTint(this.config.color)
    
    // Scale based on enemy type
    const scale = this.enemyType === 'BOSS' ? 1.5 : 
                  this.enemyType === 'HEAVY' ? 1.2 : 1.0
    this.sprite.setScale(scale)
    
    this.add(this.sprite)

    // Special visual effects for certain types
    if (this.config.canFly) {
      this.addFlyingEffect()
    }
    
    if (this.config.isBoss) {
      this.addBossEffect()
    }
  }

  private createHealthBar(): void {
    this.healthBar = this.scene.add.graphics()
    this.updateHealthBar()
    this.add(this.healthBar)
  }

  private addFlyingEffect(): void {
    // Add floating animation for flying enemies
    this.scene.tweens.add({
      targets: this.sprite,
      y: -5,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    })
    
    // Add shadow
    const shadow = this.scene.add.ellipse(0, 10, 20, 8, 0x000000, 0.3)
    this.add(shadow)
  }

  private addBossEffect(): void {
    // Add pulsing glow effect for bosses
    const glowEffect = this.scene.add.graphics()
    glowEffect.lineStyle(3, this.config.color, 0.8)
    glowEffect.strokeCircle(0, 0, 30)
    this.add(glowEffect)
    
    this.scene.tweens.add({
      targets: glowEffect,
      alpha: 0.3,
      duration: 1000,
      yoyo: true,
      repeat: -1,
    })
    
    // Screen shake when boss appears
    this.scene.cameras.main.shake(300, 0.02)
  }

  update(time: number, delta: number): void {
    this.moveAlongPath(delta)
    this.updateStatusEffects(time, delta)
    this.updateHealthBar()
    this.updateDistanceToGoal()
  }

  private moveAlongPath(delta: number): void {
    if (!this.path || !this.active) return

    // Calculate movement based on current speed
    const moveDistance = (this.currentSpeed * delta) / 1000
    const pathLength = this.path.getLength()
    
    this.pathProgress += moveDistance / pathLength
    
    // Check if reached the end
    if (this.pathProgress >= 1) {
      this.reachGoal()
      return
    }
    
    // Get new position on path
    const point = this.path.getPoint(this.pathProgress)
    this.setPosition(point.x, point.y)
    
    // Rotate sprite to face movement direction
    const nextPoint = this.path.getPoint(Math.min(1, this.pathProgress + 0.01))
    const angle = Phaser.Math.Angle.Between(point.x, point.y, nextPoint.x, nextPoint.y)
    this.sprite.setRotation(angle)
  }

  private updateStatusEffects(time: number, delta: number): void {
    this.statusEffects = this.statusEffects.filter(effect => {
      const elapsed = time - effect.startTime
      
      if (elapsed >= effect.duration) {
        this.removeStatusEffect(effect)
        return false
      }
      
      // Apply effect
      this.applyStatusEffectTick(effect, delta)
      return true
    })
    
    // Update current speed based on active effects
    this.calculateCurrentSpeed()
  }

  private applyStatusEffectTick(effect: StatusEffect, delta: number): void {
    switch (effect.type) {
      case 'burn':
      case 'poison':
        if (effect.tickDamage) {
          // Apply damage every second
          const damagePerMs = effect.tickDamage / 1000
          this.takeDamage(damagePerMs * delta, false)
        }
        break
    }
  }

  private removeStatusEffect(effect: StatusEffect): void {
    // Remove visual effects when status effect ends
    if (effect.type === 'freeze') {
      this.sprite.clearTint()
    }
  }

  private calculateCurrentSpeed(): void {
    let speedMultiplier = 1.0
    
    this.statusEffects.forEach(effect => {
      switch (effect.type) {
        case 'slow':
          speedMultiplier *= (1 - effect.intensity)
          break
        case 'freeze':
          speedMultiplier = 0
          break
      }
    })
    
    this.currentSpeed = this.baseSpeed * speedMultiplier
  }

  private updateHealthBar(): void {
    this.healthBar.clear()
    
    // Background
    this.healthBar.fillStyle(0x000000, 0.5)
    this.healthBar.fillRect(-20, -25, 40, 6)
    
    // Health bar
    const healthPercentage = this.currentHealth / this.maxHealth
    const healthColor = healthPercentage > 0.6 ? 0x00ff00 :
                       healthPercentage > 0.3 ? 0xffff00 : 0xff0000
    
    this.healthBar.fillStyle(healthColor)
    this.healthBar.fillRect(-19, -24, 38 * healthPercentage, 4)
    
    // Boss health bar (larger and more prominent)
    if (this.config.isBoss) {
      this.healthBar.clear()
      this.healthBar.fillStyle(0x000000, 0.7)
      this.healthBar.fillRect(-40, -30, 80, 8)
      
      this.healthBar.fillStyle(0xff00ff)
      this.healthBar.fillRect(-38, -28, 76 * healthPercentage, 4)
    }
  }

  private updateDistanceToGoal(): void {
    this.distanceToGoal = (1 - this.pathProgress) * this.path.getLength()
  }

  private reachGoal(): void {
    // Enemy reached the end - player loses life
    this.scene.events.emit('enemy-reached-goal', this)
    this.destroy()
  }

  // Public methods for combat
  takeDamage(amount: number, showEffect: boolean = true): void {
    this.currentHealth -= amount
    
    if (showEffect) {
      this.createDamageEffect()
    }
    
    if (this.currentHealth <= 0) {
      this.die()
    }
  }

  private createDamageEffect(): void {
    // Flash red when taking damage
    this.sprite.setTint(0xff0000)
    
    this.scene.tweens.add({
      targets: this.sprite,
      duration: 100,
      onComplete: () => {
        this.sprite.setTint(this.config.color)
      },
    })
  }

  private die(): void {
    // Create death effect
    this.createDeathEffect()
    
    // Award coins to player
    this.scene.events.emit('enemy-killed', {
      enemy: this,
      reward: this.reward,
    })
    
    this.destroy()
  }

  private createDeathEffect(): void {
    const deathEffect = this.scene.add.graphics()
    deathEffect.fillStyle(this.config.color, 0.8)
    deathEffect.fillCircle(this.x, this.y, 10)
    
    this.scene.tweens.add({
      targets: deathEffect,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 500,
      onComplete: () => deathEffect.destroy(),
    })
    
    // Particle effect
    const particles = this.scene.add.particles(this.x, this.y, 'particle', {
      speed: { min: 50, max: 100 },
      lifespan: 300,
      quantity: 10,
      tint: this.config.color,
    })
    
    this.scene.time.delayedCall(300, () => particles.destroy())
  }

  // Status effect methods
  applyBurnEffect(damage: number, duration: number): void {
    this.addStatusEffect({
      type: 'burn',
      duration,
      intensity: 1,
      tickDamage: damage,
      startTime: Date.now(),
    })
    
    // Visual effect
    this.createBurnEffect()
  }

  applySlowEffect(intensity: number, duration: number): void {
    this.addStatusEffect({
      type: 'slow',
      duration,
      intensity,
      startTime: Date.now(),
    })
    
    // Visual effect
    this.sprite.setTint(0x87ceeb)
  }

  applyPoisonEffect(damage: number, duration: number): void {
    this.addStatusEffect({
      type: 'poison',
      duration,
      intensity: 1,
      tickDamage: damage,
      startTime: Date.now(),
    })
    
    // Visual effect
    this.createPoisonEffect()
  }

  applyFreezeEffect(duration: number): void {
    this.addStatusEffect({
      type: 'freeze',
      duration,
      intensity: 1,
      startTime: Date.now(),
    })
    
    // Visual effect
    this.sprite.setTint(0x00ffff)
  }

  private addStatusEffect(effect: StatusEffect): void {
    // Remove existing effects of the same type
    this.statusEffects = this.statusEffects.filter(e => e.type !== effect.type)
    this.statusEffects.push(effect)
  }

  private createBurnEffect(): void {
    const fireParticles = this.scene.add.particles(0, 0, 'particle', {
      speed: { min: 10, max: 30 },
      lifespan: 200,
      quantity: 2,
      tint: 0xff4500,
      scale: { start: 0.3, end: 0 },
    })
    
    this.add(fireParticles)
    
    // Remove after burn duration
    this.scene.time.delayedCall(3000, () => {
      fireParticles.destroy()
    })
  }

  private createPoisonEffect(): void {
    const poisonEffect = this.scene.add.graphics()
    poisonEffect.fillStyle(0x9acd32, 0.5)
    poisonEffect.fillCircle(0, -20, 8)
    this.add(poisonEffect)
    
    // Pulsing effect
    this.scene.tweens.add({
      targets: poisonEffect,
      alpha: 0.2,
      duration: 500,
      yoyo: true,
      repeat: 10,
      onComplete: () => poisonEffect.destroy(),
    })
  }

  // Getters for game logic
  getHealth(): number { return this.currentHealth }
  getMaxHealth(): number { return this.maxHealth }
  getReward(): number { return this.reward }
  getSpeed(): number { return this.currentSpeed }
  getDistanceToGoal(): number { return this.distanceToGoal }
  getEnemyType(): EnemyType { return this.enemyType }
  getWave(): number { return this.wave }
  getPathProgress(): number { return this.pathProgress }
  
  // Utility methods
  isAlive(): boolean { return this.currentHealth > 0 }
  isBoss(): boolean { return this.config.isBoss || false }
  canFly(): boolean { return this.config.canFly || false }
  
  // For AI and difficulty scaling
  getHealthPercentage(): number { return this.currentHealth / this.maxHealth }
  hasStatusEffect(type: StatusEffect['type']): boolean {
    return this.statusEffects.some(effect => effect.type === type)
  }
}