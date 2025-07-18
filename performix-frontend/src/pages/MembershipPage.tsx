import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Zap, Calendar } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import { PaymentForm } from '../components/PaymentForm'
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
  const [showPaymentForm, setShowPaymentForm] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState<string>('')
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
      const plan = membershipPlans.find(p => p.type === type)
      if (!plan) return

      const amount = parseInt(plan.price.replace('$', '')) * 100

      const response = await axios.post(`${API_URL}/create-payment-intent`, {
        amount,
        membership_type: type
      })

      setClientSecret(response.data.client_secret)
      setSelectedPlan(plan)
      setShowPaymentForm(true)
    } catch (error: any) {
      toast({
        title: "Payment Setup Failed",
        description: error.response?.data?.detail || "Failed to setup payment",
        variant: "destructive",
      })
    } finally {
      setPurchaseLoading(null)
    }
  }

  const handlePaymentSuccess = async (paymentIntentId: string) => {
    try {
      await axios.post(`${API_URL}/memberships`, { 
        type: selectedPlan.type,
        payment_intent_id: paymentIntentId
      })
      
      toast({
        title: "Membership Activated!",
        description: `Your ${selectedPlan.name} membership is now active`,
      })
      
      setShowPaymentForm(false)
      setSelectedPlan(null)
      setClientSecret('')
      fetchCurrentMembership()
    } catch (error: any) {
      toast({
        title: "Activation Failed",
        description: error.response?.data?.detail || "Failed to activate membership",
        variant: "destructive",
      })
    }
  }

  const handlePaymentCancel = () => {
    setShowPaymentForm(false)
    setSelectedPlan(null)
    setClientSecret('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-300"></div>
      </div>
    )
  }

  if (showPaymentForm && selectedPlan && clientSecret) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen">
        <PaymentForm
          clientSecret={clientSecret}
          amount={parseInt(selectedPlan.price.replace('$', '')) * 100}
          membershipType={selectedPlan.name}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4">Choose Your Membership</h1>
        <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-6 sm:mb-8">
          Unlock your potential with our flexible membership options
        </p>

        {currentMembership && (
          <div className="max-w-md mx-auto mb-6 sm:mb-8">
            <Card className="bg-green-500/20 backdrop-blur-md border-green-400/30">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-center mb-2">
                  <Check className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2" />
                  <span className="text-green-400 font-semibold text-sm sm:text-base">Current Membership</span>
                </div>
                <h3 className="text-white text-base sm:text-lg font-semibold capitalize mb-1">
                  {currentMembership.type} Plan
                </h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  Expires: {new Date(currentMembership.end_date).toLocaleDateString()}
                </p>
                <div className="mt-3 sm:mt-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {membershipPlans.map((plan) => {
          const Icon = plan.icon
          const isCurrentPlan = currentMembership?.type === plan.type
          const canPurchase = !currentMembership || !currentMembership.is_active

          return (
            <Card
              key={plan.type}
              className={`relative bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-700 transition-all duration-300 ${
                plan.popular ? 'ring-2 ring-gray-500 sm:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-gray-600 to-gray-500 text-white border-0 px-3 sm:px-4 py-1 text-xs sm:text-sm">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-3 sm:pb-4 p-4 sm:p-6">
                <div className={`w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gradient-to-r ${plan.color} flex items-center justify-center`}>
                  <Icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <CardTitle className="text-white text-lg sm:text-xl lg:text-2xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">{plan.price}</span>
                  <span className="text-white/60 text-xs sm:text-sm">/{plan.duration}</span>
                </div>
                <CardDescription className="text-white/70 text-sm">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                <ul className="space-y-2 sm:space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-white/80">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 mr-2 sm:mr-3 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handlePurchaseMembership(plan.type)}
                  disabled={isCurrentPlan || purchaseLoading === plan.type || (!canPurchase && !isCurrentPlan)}
                  className={`w-full text-sm sm:text-base py-2 sm:py-3 ${
                    isCurrentPlan
                      ? 'bg-green-500 cursor-default'
                      : `bg-gradient-to-r ${plan.color} hover:opacity-90`
                  }`}
                >
                  {purchaseLoading === plan.type ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                      <span className="text-xs sm:text-sm">Processing...</span>
                    </div>
                  ) : isCurrentPlan ? (
                    <div className="flex items-center justify-center">
                      <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="text-xs sm:text-sm">Current Plan</span>
                    </div>
                  ) : !canPurchase ? (
                    <span className="text-xs sm:text-sm">Upgrade Available Soon</span>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Zap className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      <span className="text-xs sm:text-sm">Get Started</span>
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="mt-12 sm:mt-16 text-center">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 max-w-4xl mx-auto">
          <CardContent className="p-4 sm:p-6 lg:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Why Choose Performix?</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Expert Trainers</h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  Learn from certified professionals with years of experience
                </p>
              </div>
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Flexible Scheduling</h3>
                <p className="text-white/70 text-xs sm:text-sm">
                  Book classes that fit your busy lifestyle
                </p>
              </div>
              <div>
                <div className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-2 sm:mb-3 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
                  <Crown className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <h3 className="text-white font-semibold mb-1 sm:mb-2 text-sm sm:text-base">Premium Facilities</h3>
                <p className="text-white/70 text-xs sm:text-sm">
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
