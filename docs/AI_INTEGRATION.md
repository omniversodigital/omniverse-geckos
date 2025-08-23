# 🤖 AI Integration - Omniverse Geckos

## Overview

Omniverse Geckos integrates cutting-edge AI technology to provide players with:
- **Intelligent Game Assistant**: Real-time help and strategy recommendations
- **Personalized Experience**: AI-driven content curation and difficulty adjustment
- **Smart NFT Generation**: AI-powered NFT creation and breeding predictions
- **Market Intelligence**: AI analysis of NFT market trends and opportunities

## 🚀 AI Services Architecture

### Core AI Engine (`src/ai/core/AIEngine.ts`)

The central AI engine that manages multiple AI providers:

```typescript
const aiEngine = new AIEngine({
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4',
    maxTokens: 2000,
    temperature: 0.7
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: 'claude-3-sonnet-20240229',
    maxTokens: 2000
  },
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY,
    models: {
      textGeneration: 'microsoft/DialoGPT-medium',
      imageGeneration: 'runwayml/stable-diffusion-v1-5',
      embedding: 'sentence-transformers/all-MiniLM-L6-v2'
    }
  }
})
```

### Specialized AI Services

#### 1. Game AI (`src/ai/services/GameAI.ts`)
- **Gameplay Analysis**: Real-time strategy analysis and recommendations
- **Wave Prediction**: AI-powered enemy wave outcome prediction
- **Dynamic Difficulty**: Automatic difficulty adjustment based on player performance
- **Personalized Quests**: Custom quest generation based on player behavior

#### 2. NFT AI (`src/ai/services/NFTAI.ts`)
- **NFT Generation**: AI-powered creation of unique NFT traits and metadata
- **Breeding Prediction**: Intelligent breeding outcome forecasting
- **Market Analysis**: Real-time NFT market value analysis and trends
- **Collection Curation**: Automated NFT collection theme and distribution

#### 3. Personalization AI (`src/ai/services/PersonalizationAI.ts`)
- **User Profiling**: Advanced behavioral analysis and preference learning
- **Experience Customization**: Dynamic UI and content personalization
- **Mood Adaptation**: Real-time emotional state detection and adaptation
- **Social Recommendations**: Intelligent guild and player matching

## 🎯 AI Features in Action

### AI Assistant Integration

The AI Assistant is available globally throughout the application:

```typescript
// Available on every page via layout.tsx
<AIAssistant />

// Usage in components
const { sendMessage, isTyping, chatHistory } = useAIChatAssistant()
```

### Quick Help Actions
- **Tower Strategy**: Get optimal tower placement recommendations
- **NFT Breeding**: Learn about genetics and breeding mechanics
- **Market Tips**: Receive trading advice and market insights
- **Advanced Strategy**: Master high-level gameplay techniques

### Personalized Experience

```typescript
const { personalizedExperience, generatePersonalizedExperience } = usePersonalizationAI()

// Automatically generates when user connects wallet
useEffect(() => {
  if (address && !personalizedExperience) {
    generatePersonalizedExperience({
      current_session: { /* session data */ },
      recent_history: { /* user history */ },
      contextual_factors: { /* current context */ }
    })
  }
}, [address])
```

### Smart Recommendations

```typescript
const { recommendations, generateRecommendations } = useSmartRecommendations()

// Get personalized gameplay, NFT, and social recommendations
generateRecommendations({
  currentActivity: 'homepage_browse',
  recentHistory: [],
  preferences: personalizedExperience?.ui_customization || {},
  performance: { winRate: 0.8, averageScore: 1200 }
})
```

## 🔧 Setup & Configuration

### 1. Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# OpenAI (Required for GPT-4 features)
NEXT_PUBLIC_OPENAI_API_KEY=sk-proj-your_openai_key_here
OPENAI_API_KEY=sk-proj-your_openai_key_here

# Anthropic Claude (Required for Claude features)
NEXT_PUBLIC_ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here
ANTHROPIC_API_KEY=sk-ant-your_anthropic_key_here

# Hugging Face (Optional - for open source models)
NEXT_PUBLIC_HUGGINGFACE_API_KEY=hf_your_huggingface_key_here
HUGGINGFACE_API_KEY=hf_your_huggingface_key_here

# AI Feature Flags
ENABLE_AI_ASSISTANT=true
ENABLE_AI_NFT_GENERATION=true
ENABLE_AI_PERSONALIZATION=true
ENABLE_AI_GAME_ANALYSIS=true
```

### 2. AI Provider Setup

#### OpenAI Setup
1. Create account at [platform.openai.com](https://platform.openai.com)
2. Generate API key in API settings
3. Set up billing and usage limits
4. Add key to environment variables

#### Anthropic Setup
1. Create account at [console.anthropic.com](https://console.anthropic.com)
2. Generate API key
3. Configure usage limits
4. Add key to environment variables

#### Hugging Face Setup
1. Create account at [huggingface.co](https://huggingface.co)
2. Generate access token in settings
3. Subscribe to Inference API if needed
4. Add token to environment variables

### 3. Development Usage

```typescript
// Use AI in your components
import { useAI, useGameAI, useNFTAI, usePersonalizationAI } from '@/ai/hooks/useAI'

function MyComponent() {
  const { isInitialized, capabilities } = useAI()
  const { analyzeGameplay } = useGameAI()
  const { generateNFT } = useNFTAI()
  const { personalizedExperience } = usePersonalizationAI()

  if (!isInitialized) {
    return <div>Loading AI services...</div>
  }

  // Use AI features
  const analysis = await analyzeGameplay(gameState)
  const nft = await generateNFT(params)
}
```

## 📊 AI Performance Monitoring

### Built-in Monitoring

```typescript
import { useAIPerformanceMonitor } from '@/ai/hooks/useAI'

const { metrics, checkAIHealth, getUsageStats } = useAIPerformanceMonitor()

// Monitor AI health and performance
console.log('AI Status:', metrics.healthStatus)
console.log('Response Time:', metrics.responseTime + 'ms')
console.log('Success Rate:', metrics.successRate * 100 + '%')
```

### Metrics Tracked
- **Response Time**: AI API response latency
- **Success Rate**: Percentage of successful AI requests
- **Usage Stats**: Token consumption and API call counts
- **Health Status**: Overall AI system health

## 🎮 AI in Gameplay

### Real-time Game Analysis

```typescript
// During gameplay
const gameState = {
  towers: playerTowers,
  enemies: currentEnemies,
  resources: playerResources,
  wave: currentWave
}

const analysis = await gameAI.analyzeGameplay(playerId, gameState)
// Returns: strategy recommendations, optimization tips, threat analysis
```

### AI-Powered NFT Breeding

```typescript
// Before breeding
const parent1 = { traits: {...}, rarity: 'rare', stats: {...} }
const parent2 = { traits: {...}, rarity: 'epic', stats: {...} }

const prediction = await nftAI.generateBreedingOutcome(parent1, parent2)
// Returns: predicted offspring traits, success probability, recommended timing
```

### Dynamic Personalization

```typescript
// Continuous learning from user behavior
const feedback = [
  { feature: 'difficulty', rating: 4, comment: 'just right', context: {...} },
  { feature: 'ui_complexity', rating: 2, comment: 'too cluttered', context: {...} }
]

const learningResults = await personalizationAI.learnFromUserFeedback(userId, feedback)
// Automatically updates user profile and experience preferences
```

## 🔒 Privacy & Security

### Data Protection
- **Local Processing**: Sensitive game data processed locally when possible
- **Anonymization**: User data anonymized before AI processing
- **Opt-out Options**: Users can disable AI features individually
- **Data Retention**: AI training data automatically purged per privacy policy

### API Security
- **Rate Limiting**: Built-in rate limiting for AI API calls
- **Error Handling**: Graceful degradation when AI services unavailable
- **Fallback Systems**: Manual alternatives when AI features disabled
- **Key Management**: Secure API key storage and rotation

## 📈 Future Enhancements

### Planned Features
- **Voice Assistant**: Voice-controlled AI helper for hands-free gaming
- **Computer Vision**: AI analysis of gameplay screenshots and videos
- **Multi-language**: AI translation and localization
- **Predictive Analytics**: Advanced player behavior prediction
- **Custom Models**: Fine-tuned models for game-specific tasks

### Integration Roadmap
1. **Phase 1**: Core AI features (✅ Complete)
2. **Phase 2**: Advanced personalization and analytics
3. **Phase 3**: Computer vision and voice features
4. **Phase 4**: Custom model training and deployment

## 🛠️ Troubleshooting

### Common Issues

#### AI Not Initializing
```bash
# Check environment variables
echo $NEXT_PUBLIC_OPENAI_API_KEY
echo $NEXT_PUBLIC_ANTHROPIC_API_KEY

# Verify API keys are valid
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
     https://api.openai.com/v1/models
```

#### Slow AI Responses
- Check API quotas and rate limits
- Verify network connectivity
- Monitor token usage and costs
- Consider caching frequently requested analyses

#### Features Not Working
1. Verify feature flags in environment variables
2. Check browser console for JavaScript errors
3. Ensure AI providers have sufficient credits
4. Test with fallback configurations

### Getting Help
- Check the [AI Integration Guide](./AI_INTEGRATION.md)
- Review error logs in browser developer tools
- Test individual AI services in isolation
- Contact support with specific error messages

---

🦎 **Omniverse Geckos** - Where Gaming Meets AI Intelligence