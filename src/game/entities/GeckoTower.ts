import Phaser from 'phaser'
import { GameConfig, GeckoType } from '../core/GameConfig'
import { Enemy } from './Enemy'

export interface GeckoNFTData {
  id: string
  tokenId: number
  name: string
  type: GeckoType
  rarity: string
  level: number
  experience: number
  traits: {
    damage: number
    range: number
    fireRate: number
    special: string[]
  }
  image: string
  metadata: any
}

export class GeckoTower extends Phaser.GameObjects.Container {
  private config: typeof GameConfig.GECKO_TOWERS[GeckoType]
  private nftData: GeckoNFTData
  private range: number
  private damage: number
  private fireRate: number
  private lastFired: number = 0
  private targets: Enemy[] = []
  private rangeCircle: Phaser.GameObjects.Graphics
  private towerSprite: Phaser.GameObjects.Sprite
  private levelText: Phaser.GameObjects.Text
  private upgradeLevel: number = 1
  private kills: number = 0

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    nftData: GeckoNFTData
  ) {
    super(scene, x, y)

    this.nftData = nftData
    this.config = GameConfig.GECKO_TOWERS[nftData.type]
    
    // Apply NFT bonuses to base stats
    this.damage = this.config.damage + (nftData.traits.damage || 0)
    this.range = this.config.range + (nftData.traits.range || 0)
    this.fireRate = this.config.fireRate - (nftData.traits.fireRate || 0)

    this.createTower()
    this.createRangeIndicator()
    this.setupInteractions()

    scene.add.existing(this)
    scene.physics.add.existing(this)
  }

  private createTower(): void {
    // Main tower sprite (will be replaced with actual NFT art)
    this.towerSprite = this.scene.add.sprite(0, 0, 'gecko-placeholder')
    this.towerSprite.setTint(this.config.color)
    this.towerSprite.setScale(0.8)
    this.add(this.towerSprite)

    // Level indicator
    this.levelText = this.scene.add.text(
      15, -15, 
      `${this.upgradeLevel}`, 
      {
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      }
    )
    this.add(this.levelText)

    // Rarity glow effect
    if (this.nftData.rarity !== 'COMMON') {
      const rarityConfig = GameConfig.RARITY[this.nftData.rarity as keyof typeof GameConfig.RARITY]
      const glowEffect = this.scene.add.graphics()
      glowEffect.lineStyle(3, rarityConfig.color, 0.8)
      glowEffect.strokeCircle(0, 0, 25)
      this.add(glowEffect)
    }
  }

  private createRangeIndicator(): void {
    this.rangeCircle = this.scene.add.graphics()
    this.rangeCircle.lineStyle(2, 0x00ff00, 0.3)
    this.rangeCircle.strokeCircle(0, 0, this.range)
    this.rangeCircle.setVisible(false)
    this.add(this.rangeCircle)
  }

  private setupInteractions(): void {
    this.setInteractive(new Phaser.Geom.Circle(0, 0, 20), Phaser.Geom.Circle.Contains)
    
    this.on('pointerover', () => {
      this.showRange()
      this.showTooltip()
    })
    
    this.on('pointerout', () => {
      this.hideRange()
      this.hideTooltip()
    })

    this.on('pointerdown', () => {
      this.openUpgradeMenu()
    })
  }

  update(time: number, enemies: Enemy[]): void {
    this.findTargets(enemies)
    
    if (this.canFire(time) && this.targets.length > 0) {
      this.fire(time)
    }

    this.updateVisuals()
  }

  private findTargets(enemies: Enemy[]): void {
    this.targets = enemies.filter(enemy => {
      if (!enemy.active) return false
      
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y,
        enemy.x, enemy.y
      )
      
      return distance <= this.range
    }).sort((a, b) => {
      // Prioritize by distance to goal, then by health
      const distanceA = a.getDistanceToGoal()
      const distanceB = b.getDistanceToGoal()
      
      if (distanceA !== distanceB) {
        return distanceA - distanceB
      }
      
      return a.getHealth() - b.getHealth()
    })
  }

  private canFire(time: number): boolean {
    return time - this.lastFired >= this.fireRate
  }

  private fire(time: number): void {
    this.lastFired = time
    const target = this.targets[0]

    if (!target || !target.active) return

    // Create projectile
    this.createProjectile(target)
    
    // Apply special effects based on gecko type
    this.applySpecialEffects(target)
    
    // Play fire animation and sound
    this.towerSprite.setScale(0.9)
    this.scene.tweens.add({
      targets: this.towerSprite,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 100,
      yoyo: true,
    })
  }

  private createProjectile(target: Enemy): void {
    const projectile = this.scene.add.graphics()
    projectile.fillStyle(this.config.color)
    projectile.fillCircle(0, 0, 3)
    projectile.x = this.x
    projectile.y = this.y

    // Calculate projectile trajectory
    const angle = Phaser.Math.Angle.Between(this.x, this.y, target.x, target.y)
    const speed = 300

    this.scene.tweens.add({
      targets: projectile,
      x: target.x,
      y: target.y,
      duration: Phaser.Math.Distance.Between(this.x, this.y, target.x, target.y) / speed * 1000,
      onComplete: () => {
        this.hitTarget(target)
        projectile.destroy()
      },
    })
  }

  private hitTarget(target: Enemy): void {
    const finalDamage = this.calculateDamage()
    target.takeDamage(finalDamage)
    
    // Create damage text
    this.showDamageText(target, finalDamage)
    
    // Create hit effect
    this.createHitEffect(target)
    
    if (target.getHealth() <= 0) {
      this.onEnemyKilled(target)
    }
  }

  private calculateDamage(): number {
    const baseDamage = this.damage * this.upgradeLevel
    const levelBonus = this.nftData.level * 0.1
    const rarityMultiplier = GameConfig.RARITY[this.nftData.rarity as keyof typeof GameConfig.RARITY].multiplier
    
    return Math.floor(baseDamage * (1 + levelBonus) * rarityMultiplier)
  }

  private applySpecialEffects(target: Enemy): void {
    switch (this.config.element) {
      case 'fire':
        target.applyBurnEffect(this.damage * 0.2, 3000)
        break
      case 'ice':
        target.applySlowEffect(0.5, 2000)
        break
      case 'electric':
        this.chainLightning(target)
        break
      case 'poison':
        target.applyPoisonEffect(this.damage * 0.1, 5000)
        break
      case 'cosmic':
        this.areaOfEffect(target)
        break
    }
  }

  private chainLightning(primaryTarget: Enemy): void {
    const nearbyEnemies = this.targets.slice(1, 4) // Max 3 additional targets
    
    nearbyEnemies.forEach((enemy, index) => {
      setTimeout(() => {
        enemy.takeDamage(this.damage * 0.5)
        this.createLightningEffect(primaryTarget, enemy)
      }, index * 100)
    })
  }

  private areaOfEffect(target: Enemy): void {
    const aoeRadius = 50
    const nearbyEnemies = this.scene.children.list
      .filter(child => child instanceof Enemy)
      .filter(enemy => {
        const distance = Phaser.Math.Distance.Between(
          target.x, target.y, enemy.x, enemy.y
        )
        return distance <= aoeRadius && enemy !== target
      }) as Enemy[]

    nearbyEnemies.forEach(enemy => {
      enemy.takeDamage(this.damage * 0.7)
    })

    // Create AOE visual effect
    const aoeEffect = this.scene.add.graphics()
    aoeEffect.fillStyle(0xff69b4, 0.3)
    aoeEffect.fillCircle(target.x, target.y, aoeRadius)
    
    this.scene.tweens.add({
      targets: aoeEffect,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 500,
      onComplete: () => aoeEffect.destroy(),
    })
  }

  private onEnemyKilled(enemy: Enemy): void {
    this.kills++
    this.gainExperience(enemy.getReward())
    
    // Chance for special loot based on gecko rarity
    const lootChance = GameConfig.RARITY[this.nftData.rarity as keyof typeof GameConfig.RARITY].dropChance
    if (Math.random() < lootChance) {
      this.dropSpecialLoot(enemy)
    }
  }

  private gainExperience(amount: number): void {
    this.nftData.experience += amount
    
    const expToNextLevel = this.nftData.level * 100
    if (this.nftData.experience >= expToNextLevel) {
      this.levelUp()
    }
  }

  private levelUp(): void {
    this.nftData.level++
    this.nftData.experience = 0
    
    // Increase stats
    this.damage = Math.floor(this.damage * 1.1)
    this.range = Math.floor(this.range * 1.05)
    
    // Visual feedback
    this.createLevelUpEffect()
    this.updateLevelText()
  }

  private upgrade(): void {
    if (this.upgradeLevel >= 5) return // Max upgrade level
    
    const upgradeCost = this.config.cost * this.upgradeLevel
    // Check if player has enough coins - integrate with game state
    
    this.upgradeLevel++
    this.damage = Math.floor(this.damage * 1.25)
    this.range = Math.floor(this.range * 1.1)
    this.fireRate = Math.floor(this.fireRate * 0.9)
    
    this.updateLevelText()
    this.createUpgradeEffect()
  }

  // UI and Visual Methods
  private showRange(): void {
    this.rangeCircle.setVisible(true)
  }

  private hideRange(): void {
    this.rangeCircle.setVisible(false)
  }

  private showTooltip(): void {
    // Implement tooltip showing NFT stats, damage, range, etc.
  }

  private hideTooltip(): void {
    // Hide tooltip
  }

  private openUpgradeMenu(): void {
    // Open upgrade interface for this tower
  }

  private showDamageText(target: Enemy, damage: number): void {
    const damageText = this.scene.add.text(
      target.x, target.y - 20,
      damage.toString(),
      {
        fontSize: '14px',
        color: '#ffff00',
        stroke: '#000000',
        strokeThickness: 2,
      }
    )

    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 1000,
      onComplete: () => damageText.destroy(),
    })
  }

  private createHitEffect(target: Enemy): void {
    const hitEffect = this.scene.add.graphics()
    hitEffect.fillStyle(0xffffff, 0.8)
    hitEffect.fillCircle(target.x, target.y, 5)
    
    this.scene.tweens.add({
      targets: hitEffect,
      scaleX: 3,
      scaleY: 3,
      alpha: 0,
      duration: 200,
      onComplete: () => hitEffect.destroy(),
    })
  }

  private createLightningEffect(from: Enemy, to: Enemy): void {
    const lightning = this.scene.add.graphics()
    lightning.lineStyle(2, 0xffff00, 1)
    lightning.lineBetween(from.x, from.y, to.x, to.y)
    
    setTimeout(() => lightning.destroy(), 100)
  }

  private createLevelUpEffect(): void {
    const levelUpEffect = this.scene.add.graphics()
    levelUpEffect.fillStyle(0x00ff00, 0.6)
    levelUpEffect.fillCircle(0, 0, 30)
    this.add(levelUpEffect)
    
    this.scene.tweens.add({
      targets: levelUpEffect,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 1000,
      onComplete: () => levelUpEffect.destroy(),
    })
  }

  private createUpgradeEffect(): void {
    const upgradeEffect = this.scene.add.graphics()
    upgradeEffect.fillStyle(0x0080ff, 0.6)
    upgradeEffect.fillCircle(0, 0, 35)
    this.add(upgradeEffect)
    
    this.scene.tweens.add({
      targets: upgradeEffect,
      scaleX: 2.5,
      scaleY: 2.5,
      alpha: 0,
      duration: 1500,
      onComplete: () => upgradeEffect.destroy(),
    })
  }

  private updateLevelText(): void {
    this.levelText.setText(this.upgradeLevel.toString())
  }

  private dropSpecialLoot(enemy: Enemy): void {
    // Create special loot drop (tokens, power-ups, etc.)
  }

  private updateVisuals(): void {
    // Update any animated visuals, particle effects, etc.
  }

  // Public getters for game integration
  getDamage(): number { return this.damage }
  getRange(): number { return this.range }
  getKills(): number { return this.kills }
  getLevel(): number { return this.nftData.level }
  getNFTData(): GeckoNFTData { return this.nftData }
  getUpgradeLevel(): number { return this.upgradeLevel }
  
  // Public methods for external control
  sellTower(): void {
    // Implement sell logic - return portion of investment
    this.destroy()
  }
  
  forceFire(): void {
    if (this.targets.length > 0) {
      this.fire(Date.now())
    }
  }
}