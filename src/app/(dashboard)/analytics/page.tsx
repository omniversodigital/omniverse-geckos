import { Metadata } from 'next'
import { MetricsDashboard } from '@/components/analytics/MetricsDashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Activity,
  Globe,
  Shield,
  Zap
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Analytics Dashboard | Omniverse Geckos',
  description: 'Real-time analytics and investment metrics for Omniverse Geckos',
}

export default function AnalyticsPage() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time metrics and investment performance tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <span className="relative flex h-2 w-2 mr-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Data
          </Badge>
          <Badge variant="secondary" className="px-3 py-1">
            Last updated: Just now
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-green-500/20 bg-gradient-to-br from-green-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Market Cap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$8.5M</div>
            <p className="text-xs text-green-500 mt-1">+125% this month</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45.2K</div>
            <p className="text-xs text-blue-500 mt-1">+2,341 this week</p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Daily Volume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$285K</div>
            <p className="text-xs text-purple-500 mt-1">+18% vs yesterday</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-transparent">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              NFTs Trading
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
            <p className="text-xs text-yellow-500 mt-1">Floor: 0.12 ETH</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-2 md:grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="investment">Investment</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <MetricsDashboard />
        </TabsContent>

        <TabsContent value="investment" className="space-y-4">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Investment Funnel</CardTitle>
                <CardDescription>Conversion metrics from visitor to investor</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Website Visitors</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                      <span className="text-sm font-bold">125,420</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Whitepaper Downloads</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }} />
                      </div>
                      <span className="text-sm font-bold">81,523</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Wallet Connections</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '40%' }} />
                      </div>
                      <span className="text-sm font-bold">50,168</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Token Purchases</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }} />
                      </div>
                      <span className="text-sm font-bold">18,813</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">NFT Minters</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-muted rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }} />
                      </div>
                      <span className="text-sm font-bold">10,025</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Token Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Pre-Sale (25%)</span>
                      <span className="font-bold">250M $GECKO</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Play-to-Earn (30%)</span>
                      <span className="font-bold">300M $GECKO</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Team & Advisors (20%)</span>
                      <span className="font-bold">200M $GECKO</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Development (15%)</span>
                      <span className="font-bold">150M $GECKO</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Initial Burn (10%)</span>
                      <span className="font-bold text-red-500">100M $GECKO</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Streams</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>NFT Marketplace Fees</span>
                      <span className="font-bold text-green-500">$125K/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Casino Gaming Revenue</span>
                      <span className="font-bold text-green-500">$80K/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>P2E Token Distribution</span>
                      <span className="font-bold text-green-500">$50K/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Breeding & Utilities</span>
                      <span className="font-bold text-green-500">$45K/mo</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Partnerships & Licensing</span>
                      <span className="font-bold text-green-500">$30K/mo</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Geography</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      United States
                    </span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Japan
                    </span>
                    <span className="font-bold">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      South Korea
                    </span>
                    <span className="font-bold">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Germany
                    </span>
                    <span className="font-bold">8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Others
                    </span>
                    <span className="font-bold">27%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Acquisition Channels</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Organic Search</span>
                    <span className="font-bold">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Social Media</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Referral Program</span>
                    <span className="font-bold">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Paid Ads</span>
                    <span className="font-bold">10%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Direct</span>
                    <span className="font-bold">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Real-time performance monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>API Response Time</span>
                    <span className="font-bold text-green-500">98ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Database Query Time</span>
                    <span className="font-bold text-green-500">12ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Cache Hit Rate</span>
                    <span className="font-bold text-green-500">94%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CDN Coverage</span>
                    <span className="font-bold text-green-500">99.8%</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Server Uptime</span>
                    <span className="font-bold text-green-500">99.99%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Error Rate</span>
                    <span className="font-bold text-green-500">0.02%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Active Connections</span>
                    <span className="font-bold">1,234</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Request Queue</span>
                    <span className="font-bold text-green-500">0</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-green-500" />
                Security Overview
              </CardTitle>
              <CardDescription>System security status and monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Smart Contract Audits</span>
                    <Badge variant="default" className="bg-green-500">Passed</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SSL Certificate</span>
                    <Badge variant="default" className="bg-green-500">Valid</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">2FA Enabled Users</span>
                    <span className="font-bold">78%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Last Security Scan</span>
                    <span className="text-sm text-muted-foreground">2 hours ago</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Failed Login Attempts</span>
                    <span className="font-bold">12 (24h)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Blocked IPs</span>
                    <span className="font-bold">3</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">DDoS Protection</span>
                    <Badge variant="default" className="bg-green-500">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Firewall Status</span>
                    <Badge variant="default" className="bg-green-500">Enabled</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}