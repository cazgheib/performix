import { useState } from 'react'
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, Lock } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

interface PaymentFormProps {
  clientSecret: string
  amount: number
  membershipType: string
  onSuccess: (paymentIntentId: string) => void
  onCancel: () => void
  loading?: boolean
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#ffffff',
      '::placeholder': {
        color: '#9ca3af',
      },
      backgroundColor: 'transparent',
    },
    invalid: {
      color: '#ef4444',
    },
  },
}

export const PaymentForm = ({ 
  clientSecret, 
  amount, 
  membershipType, 
  onSuccess, 
  onCancel,
  loading = false 
}: PaymentFormProps) => {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    const cardElement = elements.getElement(CardElement)
    if (!cardElement) {
      return
    }

    setProcessing(true)

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        }
      })

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred during payment",
          variant: "destructive",
        })
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        toast({
          title: "Payment Successful!",
          description: "Your payment has been processed successfully",
        })
        onSuccess(paymentIntent.id)
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-white flex items-center justify-center">
          <CreditCard className="h-5 w-5 mr-2" />
          Complete Payment
        </CardTitle>
        <div className="text-center">
          <p className="text-white/80 text-sm capitalize">{membershipType} Membership</p>
          <p className="text-2xl font-bold text-white">${(amount / 100).toFixed(2)}</p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-white text-sm font-medium">Card Information</label>
            <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
              <CardElement options={cardElementOptions} />
            </div>
          </div>

          <div className="flex items-center justify-center text-white/60 text-xs">
            <Lock className="h-3 w-3 mr-1" />
            <span>Your payment information is secure and encrypted</span>
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              className="flex-1 border-gray-600 text-white hover:bg-gray-700"
              disabled={processing || loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || processing || loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700"
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processing...
                </div>
              ) : (
                `Pay $${(amount / 100).toFixed(2)}`
              )}
            </Button>
          </div>
        </form>

        <div className="text-center text-xs text-white/50">
          <p>Test card: 4242 4242 4242 4242</p>
          <p>Use any future date and any 3-digit CVC</p>
        </div>
      </CardContent>
    </Card>
  )
}
