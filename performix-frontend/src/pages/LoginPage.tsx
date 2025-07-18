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
      {/* Hyrox-themed background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800"></div>
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-600/30 to-transparent transform -skew-y-12 scale-150"></div>
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-gray-500/20 to-transparent transform skew-y-12 scale-150"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_80%,rgba(255,119,48,0.1),transparent_50%)]"></div>
      </div>
      {/* Geometric pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%),
            linear-gradient(-45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)
          `,
          backgroundSize: '60px 60px',
          backgroundPosition: '0 0, 30px 30px'
        }}></div>
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
