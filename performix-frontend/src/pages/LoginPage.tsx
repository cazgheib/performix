import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Dumbbell, Mail, Lock } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(email, password)
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      })
    } catch (error: any) {
      console.error('Login error:', error)
      toast({
        title: "Login failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Hyrox gym floor background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800"></div>
      
      {/* Gym floor texture pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `
          linear-gradient(45deg, rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(-45deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        backgroundSize: '30px 30px'
      }}></div>
      
      {/* Equipment silhouettes */}
      <div className="absolute inset-0 opacity-6">
        <div className="absolute top-1/4 left-1/6 transform -rotate-45">
          <div className="w-12 h-12 bg-gray-500 rounded-full"></div>
          <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs font-bold">24</div>
        </div>
        <div className="absolute bottom-1/4 right-1/6 transform rotate-12">
          <div className="w-16 h-3 bg-gray-400 rounded-full"></div>
          <div className="w-12 h-2 bg-gray-500 rounded-full mt-1 ml-2"></div>
        </div>
      </div>
      
      {/* "FINISH" overlay text */}
      <div className="absolute bottom-10 left-10 opacity-5">
        <div className="text-6xl font-bold text-white transform -rotate-12">FINISH</div>
      </div>
      
      {/* Dark overlay for form visibility */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <Card className="w-full max-w-md bg-gray-900/95 backdrop-blur-md border-gray-700/50 relative z-10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full">
              <Dumbbell className="h-8 w-8 text-gray-100" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-100">
            Welcome to Performix
          </CardTitle>
          <CardDescription className="text-gray-300">
            Sign in to book your wood and start your fitness journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-white placeholder:text-gray-400 bg-gray-800/50 border-gray-600"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-white placeholder:text-gray-400 bg-gray-800/50 border-gray-600"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700 text-gray-100"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="font-medium text-gray-200 hover:text-gray-100"
              >
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
