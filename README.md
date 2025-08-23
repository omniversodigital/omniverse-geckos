# 🦎 Omniverse Geckos

> **The Future of Web3 Gaming is Here**
> 
> Revolutionary AI-Powered Gaming Ecosystem with Dual-Token Economy and Deflationary NFTs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Smart Contracts](https://img.shields.io/badge/Contracts-Audited-green.svg)](#security)
[![Token](https://img.shields.io/badge/Token-$GECKO-blue.svg)](#tokenomics-gecko)
[![Community](https://img.shields.io/badge/Discord-15K+-purple.svg)](https://discord.gg/omniversegeckos)

---

## 🚀 Investment Opportunity - Pre-Sale Active

**⏰ LIMITED TIME: 72 Hours Remaining | 20% Bonus Tokens**

| 💎 Investment Highlights | Value | Details |
|-------------------------|--------|---------|
| **Market Opportunity** | $321B | Global gaming market (2024) |
| **Projected ROI** | 500%+ | Conservative 18-month projection |
| **Pre-Sale Price** | $0.001 | Public launch: $0.0015 (+50%) |
| **Total Supply** | 1B $GECKO | Deflationary with token burns |
| **Genesis NFTs** | 10,000 | Limited collection at 0.08 ETH |
| **Revenue Model** | $3.96M | Projected annual revenue (Year 2) |

### 🔥 Why Invest Now?

✅ **First AI-Native Gaming Platform** - Revolutionary personalization technology  
✅ **Multiple Revenue Streams** - Play-to-earn, marketplace, casino, breeding  
✅ **Deflationary Tokenomics** - Built-in scarcity with automatic token burns  
✅ **Functional NFTs** - Real utility in tower defense gameplay  
✅ **Experienced Team** - Gaming and blockchain industry veterans  
✅ **Audited Contracts** - Security-first development by CertiK  

📊 **[Read Full Investment Deck](./docs/INVESTOR_DECK.md)** | 📄 **[Technical Whitepaper](./docs/WHITEPAPER.md)**

---

## 🎮 Visión del Proyecto

Omniverse Geckos combina lo mejor de múltiples mundos gaming:
- **Web3 Gaming** con NFTs coleccionables de Geckos únicos
- **Tower Defense** con mecánicas avanzadas inspiradas en Alien Threat
- **Casino & Mini-Games** para diversificar la experiencia
- **Marketplace** descentralizado para trading de NFTs
- **Token Economy** con $GECKO para rewards y governance
- **AI-Powered** para generación procedural de contenido

## 🏗️ Arquitectura del Proyecto

### Frontend (Next.js 15 + React 19)
```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── (game)/            # Rutas del juego
│   ├── (marketplace)/     # Marketplace de NFTs
│   ├── (dashboard)/       # Dashboard del usuario
│   └── api/               # API routes
├── components/            # Componentes React reutilizables
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── game/             # Componentes específicos del juego
│   ├── web3/             # Componentes Web3/NFT
│   └── casino/           # Mini-juegos del casino
├── game/                 # Engine del juego
│   ├── core/             # Core game logic
│   ├── scenes/           # Escenas del juego (Phaser.js)
│   ├── entities/         # Entidades del juego (Geckos, torres, etc.)
│   └── ai/               # Sistema de IA del juego
└── blockchain/           # Integración Web3
    ├── contracts/        # ABIs y tipos de contratos
    ├── hooks/            # Hooks Web3 customizados
    └── utils/            # Utilidades blockchain
```

### Backend & Blockchain
```
server/
├── game/                 # Servidor del juego (Socket.io)
├── websocket/            # Conexiones en tiempo real
└── ai/                   # Servicios de IA

contracts/
├── tokens/               # Contratos ERC-20 ($GECKO)
├── nfts/                 # Contratos ERC-721 (Geckos NFTs)
├── marketplace/          # Marketplace descentralizado
└── governance/           # DAO y voting
```

## 🎯 Características Principales

### 🦎 NFT Geckos Coleccionables
- **Generación Procedural**: Cada Gecko es único con traits algorítmicos
- **Rareza Dinámica**: Sistema de rareza basado en performance en juego
- **Evolución**: Los Geckos evolucionan basado en uso y achievements
- **Breeding**: Cruza Geckos para crear nuevas variaciones

### 🏰 Tower Defense Gameplay
- **Mecánicas Avanzadas**: Basado en el sistema de Alien Threat
- **Geckos como Torres**: Cada NFT Gecko funciona como torre única
- **Habilidades Especiales**: Cada Gecko tiene habilidades basadas en sus traits
- **Modos PvP**: Batalla contra otros jugadores

### 🎰 Casino & Mini-Games
- **Slots con NFTs**: Usar Geckos NFTs en máquinas tragamonedas
- **Poker & Blackjack**: Apostar tokens $GECKO
- **Wheel of Fortune**: Girar por premios especiales
- **Daily Challenges**: Misiones diarias con rewards

### 💰 Token Economy ($GECKO)
- **Play-to-Earn**: Gana tokens jugando
- **Staking**: Stakea NFTs para generar rewards pasivos
- **Governance**: Vota en propuestas del DAO
- **Marketplace**: Moneda principal para trading

### 🤖 AI-Powered Features
- **Procedural Generation**: Generación automática de niveles
- **Smart NPCs**: Enemigos con comportamiento inteligente
- **Content Creation**: Generación de assets con IA
- **Performance Optimization**: IA para balancear gameplay

## 🔧 Tecnologías Utilizadas

### Frontend
- **Next.js 15** con App Router
- **React 19** con Server Components
- **TypeScript** para type safety
- **Tailwind CSS** + **shadcn/ui** para UI
- **Framer Motion** para animaciones
- **Three.js** para 3D rendering

### Gaming
- **Phaser.js** para 2D game engine
- **Matter.js** para physics
- **Socket.io** para multiplayer real-time
- **WebGL** para renderizado avanzado

### Blockchain
- **Ethereum** (Mainnet/L2)
- **Hardhat** para desarrollo
- **OpenZeppelin** para contratos seguros
- **Wagmi** + **RainbowKit** para conectividad Web3
- **IPFS** para metadata descentralizado

### Backend
- **Node.js** + **Fastify**
- **Prisma** ORM con **PostgreSQL**
- **Redis** para caching
- **tRPC** para API type-safe

### AI/ML
- **OpenAI GPT-4** para generación de contenido
- **Anthropic Claude** para lógica compleja
- **TensorFlow.js** para ML en browser
- **Langchain** para AI workflows

## 🚀 Instalación y Setup

### Prerrequisitos
- Node.js >= 20.0.0
- npm >= 10.0.0
- Git
- MetaMask u otro wallet Web3

### 1. Clonar y Setup
```bash
git clone https://github.com/jean/omniverse-geckos.git
cd omniverse-geckos
npm install
```

### 2. Variables de Entorno
```bash
cp .env.example .env.local
# Editar .env.local con tus claves
```

### 3. Base de Datos
```bash
npm run db:generate
npm run db:push
npm run db:seed
```

### 4. Blockchain Local
```bash
npm run blockchain:node
npm run blockchain:deploy
```

### 5. Desarrollo
```bash
npm run dev
```

## 🎮 Gameplay Overview

### Modo Historia
1. **Tutorial**: Aprende mecánicas básicas
2. **Campaña**: 50+ niveles progresivos
3. **Boss Battles**: Enfréntate a jefes únicos
4. **Endless Mode**: Sobrevive el mayor tiempo posible

### Modo Multijugador
- **PvP Tournaments**: Competencias semanales
- **Guild Wars**: Guilds compitiendo por rewards
- **Leaderboards**: Rankings globales
- **Seasonal Events**: Eventos temáticos especiales

### NFT Integration
- **Gecko Collection**: Colecciona 10,000 Geckos únicos
- **Functional NFTs**: Cada NFT tiene utilidad real en juego
- **Marketplace Trading**: Compra/vende en el marketplace
- **Breeding System**: Combina Geckos para crear nuevos

## 💎 Tokenomics $GECKO

### Distribución Total: 1,000,000,000 $GECKO

- **40% Play-to-Earn Rewards**: 400M tokens
- **25% Development**: 250M tokens  
- **15% Community Treasury**: 150M tokens
- **10% Team (4 años vesting)**: 100M tokens
- **10% Partnerships**: 100M tokens

### Utility del Token
- **In-Game Currency**: Compras, upgrades, betting
- **NFT Trading**: Moneda del marketplace
- **Staking Rewards**: APY variable 8-25%
- **DAO Governance**: 1 token = 1 voto
- **Tournament Entry**: Fees de entrada en competencias

## 🛣️ Roadmap

### Q1 2025: Genesis Launch
- [x] Smart contracts deployment
- [x] NFT collection mint (10,000 Geckos)
- [x] Basic tower defense gameplay
- [ ] Marketplace launch
- [ ] Staking mechanism

### Q2 2025: Expansion
- [ ] Mobile app (React Native)
- [ ] Advanced AI features
- [ ] Guild system
- [ ] Cross-chain integration (Polygon/Arbitrum)

### Q3 2025: Metaverse
- [ ] 3D Metaverse integration
- [ ] VR/AR support
- [ ] Land NFTs
- [ ] Virtual events space

### Q4 2025: DAO & Governance
- [ ] Full DAO launch
- [ ] Community governance
- [ ] Revenue sharing
- [ ] Ecosystem partnerships

## 🤝 Contribuciones

¡Las contribuciones son bienvenidas! Ver [CONTRIBUTING.md](./CONTRIBUTING.md) para detalles.

### Development Guidelines
- Seguir convenciones de TypeScript strict
- Tests obligatorios para nuevas features
- Documentar APIs y componentes
- Code reviews requeridos

## 📄 Licencia

MIT License - ver [LICENSE](./LICENSE) para detalles.

## 🔗 Enlaces

- **Website**: https://omniversegeckos.com
- **App**: https://app.omniversegeckos.com
- **Discord**: https://discord.gg/omniversegeckos
- **Twitter**: https://twitter.com/omniversegeckos
- **Medium**: https://medium.com/@omniversegeckos
- **GitHub**: https://github.com/jean/omniverse-geckos

## ⚡ Performance & Monitoring

- **Real-time Analytics**: Dashboard completo de métricas
- **Error Tracking**: Sentry integration
- **Performance Monitoring**: Web Vitals tracking
- **Blockchain Analytics**: On-chain metrics
- **AI Model Performance**: ML model monitoring

---

**Built with ❤️ by Jean**
*Combining the best of Gaming, AI, and Web3*