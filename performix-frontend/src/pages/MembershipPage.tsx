import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Calendar } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import axios from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

interface Membership {
  id: string
  type: string
  start_date: string
  end_date: string
  is_active: boolean
}

const membershipPlans = [
  {
    type: 'daily',
    name: 'Daily Pass',
    price: '$15',
    duration: '1 Day',
    description: 'Perfect for trying us out',
    features: [
      'Access to all classes for 1 day',
      'Full gym facilities',
      'Locker room access',
      'Basic support'
    ],
    color: 'from-blue-500 to-cyan-500',
    icon: Zap,
    popular: false
  },
  {
    type: 'weekly',
    name: 'Weekly Warrior',
    price: '$75',
    duration: '7 Days',
    description: 'Great for short-term goals',
    features: [
      'Access to all classes for 1 week',
      'Full gym facilities',
      'Locker room access',
      'Priority booking',
      'Nutrition consultation'
    ],
    color: 'from-purple-500 to-pink-500',
    icon: Calendar,
    popular: true
  },
  {
    type: 'monthly',
    name: 'Monthly Champion',
    price: '$199',
    duration: '30 Days',
    description: 'Best value for serious athletes',
    features: [
      'Access to all classes for 1 month',
      'Full gym facilities',
      'Locker room access',
      'Priority booking',
      'Personal training session',
      'Nutrition consultation',
      'Progress tracking',
      'Premium support'
    ],
    color: 'from-orange-500 to-red-500',
    icon: Crown,
    popular: false
  }
]

export const MembershipPage = () => {
  const [currentMembership, setCurrentMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseLoading, setPurchaseLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCurrentMembership()
  }, [])

  const fetchCurrentMembership = async () => {
    try {
      const response = await axios.get(`${API_URL}/memberships/current`)
      setCurrentMembership(response.data)
    } catch (error) {
      setCurrentMembership(null)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchaseMembership = async (type: string) => {
    setPurchaseLoading(type)
    try {
      await axios.post(`${API_URL}/memberships`, { type })
      toast({
        title: "Membership Activated!",
        description: `Your ${type} membership is now active`,
      })
      fetchCurrentMembership()
    } catch (error: any) {
      toast({
        title: "Purchase Failed",
        description: error.response?.data?.detail || "Failed to purchase membership",
        variant: "destructive",
      })
    } finally {
      setPurchaseLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-300"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-white mb-4">Choose Your Membership</h1>
        <p className="text-xl text-white/80 mb-8">
          Unlock your potential with our flexible membership options
        </p>

        {currentMembership && (
          <div className="max-w-md mx-auto mb-8">
            <Card className="bg-green-500/20 backdrop-blur-md border-green-400/30">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-6 w-6 text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold">Current Membership</span>
                </div>
                <h3 className="text-white text-lg font-semibold capitalize mb-1">
                  {currentMembership.type} Plan
                </h3>
                <p className="text-white/70 text-sm">
                  Expires: {new Date(currentMembership.end_date).toLocaleDateString()}
                </p>
                <div className="mt-4">
                  <div className="w-full bg-gray-700/50 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
                      style={{
                        width: `${Math.max(0, Math.min(100, 
                          (1 - (new Date(currentMembership.end_date).getTime() - Date.now()) / 
                          (new Date(currentMembership.end_date).getTime() - new Date(currentMembership.start_date).getTime())) * 100
                        ))}%`
                      }}
                    />
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    {Math.ceil((new Date(currentMembership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {membershipPlans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = currentMembership?.type === plan.type
          const canPurchase = !currentMembership || !currentMembership.is_active

          return (
            <Card
              key={plan.type}
              className={`relative bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-700 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-gray-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-gray-600 to-gray-500 text-white border-0 px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-white text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60 text-sm">/{plan.duration}</span>
                </div>
                <CardDescription className="text-white/70">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-white/80">
                      <Check className="h-4 w-4 text-green-400 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchaseMembership(plan.type)}
                  disabled={isCurrentPlan || purchaseLoading === plan.type || (!canPurchase && !isCurrentPlan)}
                  className={`w-full ${
                    isCurrentPlan
                      ? 'bg-green-500 cursor-default'
                      : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                  }`}
                >
                  {purchaseLoading === plan.type ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Processing...
                    </div>
                  ) : isCurrentPlan ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Current Plan
                    </>
                  ) : !canPurchase ? (
                    'Upgrade Available Soon'
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Get Started
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-16 text-center">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 max-w-4xl mx-auto">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-white mb-4">Why Choose Performix?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Expert Trainers</h3>
                <p className="text-white/70 text-sm">
                  Learn from certified professionals with years of experience
                </p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Flexible Scheduling</h3>
                <p className="text-white/70 text-sm">
                  Book classes that fit your busy lifestyle
                </p>
              </div>
              <div>
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Crown className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-2">Premium Facilities</h3>
                <p className="text-white/70 text-sm">
                  State-of-the-art equipment and clean, modern spaces
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
