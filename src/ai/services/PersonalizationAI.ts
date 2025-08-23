import { AIEngine } from '../core/AIEngine'

// =============================================================================
// Types
// =============================================================================

export interface UserProfile {
  id: string
  demographics: {
    age_range?: string
    gaming_experience?: 'Beginner' | 'Intermediate' | 'Expert' | 'Pro'
    preferred_genres?: string[]
    platform_preference?: 'Mobile' | 'Desktop' | 'Both'
    spending_behavior?: 'Conservative' | 'Moderate' | 'High' | 'Whale'
  }
  preferences: {
    visual_style?: 'Realistic' | 'Cartoon' | 'Anime' | 'Abstract'
    gameplay_pace?: 'Slow' | 'Medium' | 'Fast' | 'Varied'
    difficulty_preference?: 'Easy' | 'Normal' | 'Hard' | 'Adaptive'
    social_features?: 'Solo' | 'Cooperative' | 'Competitive' | 'Mixed'
    notification_frequency?: 'Minimal' | 'Normal' | 'Frequent'
  }
  behavioral_data: {
    session_duration: number[]
    active_hours: number[]
    feature_usage: Record<string, number>
    purchase_history: Array<{
      item: string
      price: number
      timestamp: number
      satisfaction: number
    }>
    social_interactions: {
      guild_participation: number
      chat_frequency: number
      trading_activity: number
    }
  }
  psychographic_profile: {
    motivation_drivers: Array<'Achievement' | 'Social' | 'Exploration' | 'Collection' | 'Competition' | 'Creativity'>
    personality_traits: Array<'Competitive' | 'Cooperative' | 'Analytical' | 'Impulsive' | 'Patient' | 'Risk-taking'>
    play_style_archetype: 'Achiever' | 'Explorer' | 'Socializer' | 'Killer' | 'Creator'
  }
}

export interface PersonalizationContext {
  current_session: {
    duration: number
    actions_taken: Array<{ action: string; timestamp: number; context: any }>
    mood_indicators: Array<'Frustrated' | 'Engaged' | 'Bored' | 'Excited' | 'Neutral'>
    performance_metrics: {
      success_rate: number
      efficiency_score: number
      engagement_level: number
    }
  }
  recent_history: {
    last_7_days: {
      sessions: number
      achievements: string[]
      purchases: any[]
      social_activity: number
    }
    trends: {
      engagement_trend: 'Increasing' | 'Stable' | 'Decreasing'
      skill_progression: 'Improving' | 'Plateaued' | 'Declining'
      spending_trend: 'Increasing' | 'Stable' | 'Decreasing'
    }
  }
  contextual_factors: {
    time_of_day: string
    day_of_week: string
    seasonal_factors: string[]
    device_type: string
    connection_quality: string
  }
}

export interface PersonalizedExperience {
  ui_customization: {
    theme: string
    layout_style: string
    information_density: 'Minimal' | 'Standard' | 'Detailed'
    accessibility_features: string[]
  }
  content_recommendations: {
    featured_nfts: Array<{
      id: string
      reason: string
      priority: number
    }>
    suggested_activities: Array<{
      activity: string
      description: string
      estimated_time: string
      reward_preview: string
    }>
    personalized_quests: Array<{
      title: string
      description: string
      difficulty: string
      rewards: Record<string, number>
    }>
  }
  gameplay_adjustments: {
    difficulty_scaling: number
    tutorial_pacing: 'Fast' | 'Normal' | 'Slow'
    hint_frequency: 'Minimal' | 'Helpful' | 'Detailed'
    automation_level: number
  }
  communication: {
    message_tone: 'Professional' | 'Casual' | 'Friendly' | 'Enthusiastic'
    notification_timing: string[]
    content_complexity: 'Simple' | 'Standard' | 'Advanced'
    preferred_channels: string[]
  }
}

// =============================================================================
// Personalization AI Service
// =============================================================================

export class PersonalizationAI {
  private aiEngine: AIEngine
  private userProfiles: Map<string, UserProfile> = new Map()
  private experienceCache: Map<string, PersonalizedExperience> = new Map()
  private learningData: Map<string, any[]> = new Map()

  constructor(aiEngine: AIEngine) {
    this.aiEngine = aiEngine
  }

  // =============================================================================
  // Profile Analysis and Building
  // =============================================================================

  async analyzeUserBehavior(userId: string, behaviorData: any[]): Promise<Partial<UserProfile>> {
    const analysisPrompt = `
Analyze user behavior data and extract psychological insights for personalization:

User ID: ${userId}
Behavior Data: ${JSON.stringify(behaviorData, null, 2)}

Analyze patterns in:
- Gaming session patterns and preferences
- Decision-making tendencies
- Social interaction preferences
- Spending behaviors and motivations
- Learning and adaptation patterns
- Frustration and engagement indicators

Extract psychological insights about:
1. Core motivation drivers (Achievement, Social, Exploration, etc.)
2. Personality traits affecting gameplay
3. Play style archetype classification
4. Preferences for game mechanics and features
5. Optimal engagement strategies

Provide comprehensive user profile updates in JSON format:
{
  "demographics": {...},
  "preferences": {...},
  "behavioral_data": {...},
  "psychographic_profile": {
    "motivation_drivers": ["Achievement", "Collection"],
    "personality_traits": ["Analytical", "Patient"],
    "play_style_archetype": "Explorer"
  }
}
`

    const response = await this.aiEngine.generateText(analysisPrompt)
    try {
      const profileUpdates = JSON.parse(response.content)
      this.updateUserProfile(userId, profileUpdates)
      return profileUpdates
    } catch {
      return this.generateFallbackProfileUpdate(behaviorData)
    }
  }

  async generatePersonalizedExperience(
    userId: string, 
    context: PersonalizationContext
  ): Promise<PersonalizedExperience> {
    const userProfile = this.getUserProfile(userId)
    
    const personalizationPrompt = `
Generate a completely personalized experience for this user in Omniverse Geckos:

User Profile: ${JSON.stringify(userProfile, null, 2)}
Current Context: ${JSON.stringify(context, null, 2)}

Create personalized experience that:
1. Matches their psychological profile and motivations
2. Adapts to their current mood and performance
3. Considers contextual factors (time, device, etc.)
4. Optimizes for engagement and satisfaction
5. Respects their preferences and boundaries

Generate comprehensive personalization in JSON format:
{
  "ui_customization": {
    "theme": "chosen_based_on_preferences",
    "layout_style": "optimized_for_user",
    "information_density": "based_on_experience_level",
    "accessibility_features": ["relevant_features"]
  },
  "content_recommendations": {
    "featured_nfts": [{"id": "nft_id", "reason": "why_this_appeals", "priority": 8}],
    "suggested_activities": [{"activity": "activity_name", "description": "why_now", "estimated_time": "duration", "reward_preview": "what_they_get"}],
    "personalized_quests": [{"title": "quest_name", "description": "engaging_description", "difficulty": "appropriate_level", "rewards": {"tokens": 100}}]
  },
  "gameplay_adjustments": {
    "difficulty_scaling": 1.2,
    "tutorial_pacing": "based_on_learning_style",
    "hint_frequency": "based_on_experience",
    "automation_level": 0.3
  },
  "communication": {
    "message_tone": "matches_personality",
    "notification_timing": ["when_user_is_receptive"],
    "content_complexity": "matches_expertise",
    "preferred_channels": ["in_game", "email"]
  }
}
`

    const response = await this.aiEngine.generateText(personalizationPrompt)
    try {
      const experience = JSON.parse(response.content)
      this.experienceCache.set(userId, experience)
      return experience
    } catch {
      return this.generateFallbackExperience(userProfile)
    }
  }

  // =============================================================================
  // Dynamic Content Personalization
  // =============================================================================

  async personalizeMarketplaceContent(userId: string, availableNFTs: any[]): Promise<{
    curated_selection: Array<{
      nft: any
      personalization_score: number
      appeal_reasons: string[]
      suggested_use: string
    }>
    browsing_layout: {
      sort_order: string
      filter_suggestions: string[]
      highlight_features: string[]
    }
    pricing_insights: {
      budget_recommendations: string
      value_opportunities: string[]
      investment_advice: string
    }
  }> {
    const userProfile = this.getUserProfile(userId)
    
    const curationPrompt = `
Personalize the NFT marketplace experience for this user:

User Profile: ${JSON.stringify(userProfile)}
Available NFTs: ${JSON.stringify(availableNFTs.slice(0, 20))} // Sample

Curate marketplace content considering:
- User's spending behavior and budget patterns
- Preferred gameplay styles and strategies  
- Collection goals and motivations
- Visual and thematic preferences
- Investment vs. utility priorities

Provide personalized marketplace experience in JSON format.
`

    const response = await this.aiEngine.generateText(curationPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackMarketplaceCuration(userProfile, availableNFTs)
    }
  }

  async generatePersonalizedTutorial(userId: string, tutorialType: string): Promise<{
    learning_path: Array<{
      step: number
      title: string
      content: string
      interaction_type: string
      success_criteria: string
      hints: string[]
    }>
    pacing_strategy: {
      step_duration: number[]
      break_suggestions: string[]
      review_points: number[]
    }
    motivation_elements: {
      progress_visualization: string
      reward_schedule: Array<{ step: number; reward: string }>
      encouragement_messages: string[]
    }
  }> {
    const userProfile = this.getUserProfile(userId)
    
    const tutorialPrompt = `
Create a personalized tutorial for "${tutorialType}" tailored to this user:

User Profile: ${JSON.stringify(userProfile)}

Design tutorial considering:
- Learning style and pace preferences
- Motivation drivers and personality
- Gaming experience level
- Attention span and engagement patterns
- Preferred feedback mechanisms

Create comprehensive personalized tutorial structure in JSON format.
`

    const response = await this.aiEngine.generateText(tutorialPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackTutorial(tutorialType, userProfile)
    }
  }

  // =============================================================================
  // Behavioral Adaptation
  // =============================================================================

  async adaptToUserMood(userId: string, moodIndicators: string[]): Promise<{
    immediate_adjustments: {
      ui_changes: string[]
      content_modifications: string[]
      interaction_adaptations: string[]
    }
    recommended_activities: Array<{
      activity: string
      mood_benefit: string
      difficulty: string
    }>
    communication_adjustments: {
      tone_changes: string
      message_frequency: string
      support_level: string
    }
  }> {
    const userProfile = this.getUserProfile(userId)
    
    const moodAdaptationPrompt = `
Adapt the game experience to the user's current emotional state:

User Profile: ${JSON.stringify(userProfile)}
Current Mood Indicators: ${JSON.stringify(moodIndicators)}

For each mood state, provide appropriate adaptations:
- Frustrated: Reduce difficulty, offer assistance, change pacing
- Excited: Capitalize on engagement, offer challenges, social features
- Bored: Introduce variety, new content, surprise elements
- Engaged: Maintain flow, offer progressive challenges
- Neutral: Gentle guidance toward preferred activities

Provide mood-based adaptations in JSON format.
`

    const response = await this.aiEngine.generateText(moodAdaptationPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackMoodAdaptation(moodIndicators)
    }
  }

  async optimizeNotificationTiming(userId: string): Promise<{
    optimal_times: Array<{
      time: string
      day_of_week: string
      notification_type: string
      predicted_engagement: number
    }>
    personalization_factors: {
      activity_patterns: string[]
      response_history: string
      timezone_considerations: string
    }
    content_preferences: {
      preferred_topics: string[]
      message_length: string
      urgency_tolerance: string
    }
  }> {
    const userProfile = this.getUserProfile(userId)
    
    const notificationPrompt = `
Optimize notification timing and content for maximum engagement:

User Profile: ${JSON.stringify(userProfile)}

Analyze:
- Historical engagement patterns
- Preferred communication times
- Response rates to different content types
- Device usage patterns
- Lifestyle indicators

Create optimal notification strategy in JSON format.
`

    const response = await this.aiEngine.generateText(notificationPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackNotificationStrategy()
    }
  }

  // =============================================================================
  // Social Personalization
  // =============================================================================

  async recommendSocialConnections(userId: string, potentialConnections: any[]): Promise<{
    recommended_guilds: Array<{
      guild_id: string
      compatibility_score: number
      reasons: string[]
      introduction_strategy: string
    }>
    player_matches: Array<{
      player_id: string
      similarity_score: number
      common_interests: string[]
      suggested_interaction: string
    }>
    social_activities: Array<{
      activity: string
      group_size: string
      estimated_enjoyment: number
    }>
  }> {
    const userProfile = this.getUserProfile(userId)
    
    const socialPrompt = `
Recommend social connections and activities for this user:

User Profile: ${JSON.stringify(userProfile)}
Potential Connections: ${JSON.stringify(potentialConnections.slice(0, 10))}

Consider:
- Social preference levels and interaction styles
- Compatible play styles and schedules
- Shared interests and goals
- Communication preferences
- Leadership vs. follower tendencies

Provide social recommendations in JSON format.
`

    const response = await this.aiEngine.generateText(socialPrompt)
    try {
      return JSON.parse(response.content)
    } catch {
      return this.generateFallbackSocialRecommendations()
    }
  }

  // =============================================================================
  // Learning and Adaptation
  // =============================================================================

  async learnFromUserFeedback(
    userId: string, 
    feedback: Array<{
      feature: string
      rating: number
      comment: string
      context: any
    }>
  ): Promise<{
    profile_updates: Partial<UserProfile>
    experience_adjustments: Partial<PersonalizedExperience>
    learning_insights: string[]
  }> {
    const feedbackPrompt = `
Learn from user feedback to improve personalization:

User Feedback: ${JSON.stringify(feedback)}

Extract insights about:
- Preference accuracy of current personalization
- Unexpected user behaviors or preferences
- Areas for improvement in recommendations
- Successful personalization strategies
- User satisfaction patterns

Provide learning-based updates in JSON format.
`

    const response = await this.aiEngine.generateText(feedbackPrompt)
    try {
      const learningResults = JSON.parse(response.content)
      
      // Apply learning to user profile
      if (learningResults.profile_updates) {
        this.updateUserProfile(userId, learningResults.profile_updates)
      }
      
      return learningResults
    } catch {
      return {
        profile_updates: {},
        experience_adjustments: {},
        learning_insights: ['Feedback processing completed']
      }
    }
  }

  // =============================================================================
  // Utility Methods
  // =============================================================================

  private getUserProfile(userId: string): UserProfile {
    return this.userProfiles.get(userId) || this.createDefaultProfile(userId)
  }

  private updateUserProfile(userId: string, updates: Partial<UserProfile>): void {
    const existing = this.getUserProfile(userId)
    const updated = this.mergeProfiles(existing, updates)
    this.userProfiles.set(userId, updated)
  }

  private createDefaultProfile(userId: string): UserProfile {
    return {
      id: userId,
      demographics: {
        gaming_experience: 'Intermediate',
        platform_preference: 'Both'
      },
      preferences: {
        difficulty_preference: 'Normal',
        gameplay_pace: 'Medium',
        notification_frequency: 'Normal'
      },
      behavioral_data: {
        session_duration: [],
        active_hours: [],
        feature_usage: {},
        purchase_history: [],
        social_interactions: {
          guild_participation: 0,
          chat_frequency: 0,
          trading_activity: 0
        }
      },
      psychographic_profile: {
        motivation_drivers: ['Achievement', 'Exploration'],
        personality_traits: ['Balanced'],
        play_style_archetype: 'Explorer'
      }
    }
  }

  private mergeProfiles(existing: UserProfile, updates: Partial<UserProfile>): UserProfile {
    return {
      ...existing,
      ...updates,
      demographics: { ...existing.demographics, ...updates.demographics },
      preferences: { ...existing.preferences, ...updates.preferences },
      behavioral_data: { ...existing.behavioral_data, ...updates.behavioral_data },
      psychographic_profile: { ...existing.psychographic_profile, ...updates.psychographic_profile }
    }
  }

  private generateFallbackProfileUpdate(behaviorData: any[]): Partial<UserProfile> {
    return {
      behavioral_data: {
        session_duration: behaviorData.map(d => d.duration || 30),
        active_hours: [19, 20, 21], // Evening hours
        feature_usage: { game: 0.8, marketplace: 0.3, social: 0.5 },
        purchase_history: [],
        social_interactions: {
          guild_participation: 0.2,
          chat_frequency: 0.1,
          trading_activity: 0.3
        }
      }
    }
  }

  private generateFallbackExperience(userProfile: UserProfile): PersonalizedExperience {
    return {
      ui_customization: {
        theme: 'Dark Gaming',
        layout_style: 'Standard',
        information_density: 'Standard',
        accessibility_features: []
      },
      content_recommendations: {
        featured_nfts: [],
        suggested_activities: [
          {
            activity: 'Play Campaign',
            description: 'Continue your adventure',
            estimated_time: '30 minutes',
            reward_preview: 'Tokens and XP'
          }
        ],
        personalized_quests: []
      },
      gameplay_adjustments: {
        difficulty_scaling: 1.0,
        tutorial_pacing: 'Normal',
        hint_frequency: 'Helpful',
        automation_level: 0.2
      },
      communication: {
        message_tone: 'Friendly',
        notification_timing: ['evening'],
        content_complexity: 'Standard',
        preferred_channels: ['in_game']
      }
    }
  }

  private generateFallbackMarketplaceCuration(userProfile: UserProfile, nfts: any[]): any {
    return {
      curated_selection: nfts.slice(0, 5).map(nft => ({
        nft,
        personalization_score: 0.7,
        appeal_reasons: ['Popular choice', 'Good value'],
        suggested_use: 'Gameplay enhancement'
      })),
      browsing_layout: {
        sort_order: 'popularity',
        filter_suggestions: ['rarity', 'price'],
        highlight_features: ['stats', 'abilities']
      },
      pricing_insights: {
        budget_recommendations: 'Consider items under 1 ETH',
        value_opportunities: ['Undervalued rare items'],
        investment_advice: 'Focus on utility over speculation'
      }
    }
  }

  private generateFallbackTutorial(tutorialType: string, userProfile: UserProfile): any {
    return {
      learning_path: [
        {
          step: 1,
          title: `Introduction to ${tutorialType}`,
          content: 'Welcome to this tutorial',
          interaction_type: 'click',
          success_criteria: 'Complete introduction',
          hints: ['Take your time', 'Ask for help if needed']
        }
      ],
      pacing_strategy: {
        step_duration: [60, 90, 120],
        break_suggestions: ['Take breaks between steps'],
        review_points: [3, 6, 9]
      },
      motivation_elements: {
        progress_visualization: 'Progress bar',
        reward_schedule: [{ step: 3, reward: 'Achievement badge' }],
        encouragement_messages: ['Great job!', 'Keep going!']
      }
    }
  }

  private generateFallbackMoodAdaptation(moodIndicators: string[]): any {
    return {
      immediate_adjustments: {
        ui_changes: ['Reduce visual complexity'],
        content_modifications: ['Show easier content'],
        interaction_adaptations: ['Increase hint frequency']
      },
      recommended_activities: [
        {
          activity: 'Relaxed gameplay mode',
          mood_benefit: 'Reduces stress',
          difficulty: 'Easy'
        }
      ],
      communication_adjustments: {
        tone_changes: 'More supportive',
        message_frequency: 'Reduced',
        support_level: 'Increased'
      }
    }
  }

  private generateFallbackNotificationStrategy(): any {
    return {
      optimal_times: [
        {
          time: '19:00',
          day_of_week: 'weekday',
          notification_type: 'game_reminder',
          predicted_engagement: 0.7
        }
      ],
      personalization_factors: {
        activity_patterns: ['Evening gaming'],
        response_history: 'Moderate engagement',
        timezone_considerations: 'Local time preferred'
      },
      content_preferences: {
        preferred_topics: ['game_updates', 'rewards'],
        message_length: 'short',
        urgency_tolerance: 'low'
      }
    }
  }

  private generateFallbackSocialRecommendations(): any {
    return {
      recommended_guilds: [],
      player_matches: [],
      social_activities: [
        {
          activity: 'Guild chat',
          group_size: 'small',
          estimated_enjoyment: 0.6
        }
      ]
    }
  }
}