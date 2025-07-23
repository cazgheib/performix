import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Link } from 'react-router-dom'
import { Dumbbell, Mail, Lock, User } from 'lucide-react'
import { useToast } from '../hooks/use-toast'

export const RegisterPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await register(email, password, fullName)
      toast({
        title: "Welcome to Performix!",
        description: "Your account has been created successfully.",
      })
    } catch (error: any) {
      console.error('Registration error:', error)
      toast({
        title: "Registration failed",
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
      
      {/* Different gym floor pattern */}
      <div className="absolute inset-0 opacity-8" style={{
        backgroundImage: `radial-gradient(circle at 2px 2px, #4B5563 2px, transparent 0)`,
        backgroundSize: '40px 40px'
      }}></div>
      
      {/* Different equipment silhouettes */}
      <div className="absolute inset-0 opacity-7">
        <div className="absolute top-1/3 right-1/5 transform rotate-30">
          <div className="w-10 h-10 bg-gray-400 rounded-sm"></div>
          <div className="w-8 h-8 bg-gray-500 rounded-sm mt-1 ml-1"></div>
        </div>
        <div className="absolute bottom-1/3 left-1/5 transform -rotate-15">
          <div className="w-14 h-4 bg-gray-400 rounded-full"></div>
        </div>
      </div>
      
      {/* "START" overlay text */}
      <div className="absolute top-10 right-10 opacity-4">
        <div className="text-5xl font-bold text-white transform rotate-12">START</div>
      </div>
      
      {/* Dark overlay for form visibility */}
      <div className="absolute inset-0 bg-black/50"></div>
      <Card className="w-full max-w-md bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full">
              <Dumbbell className="h-8 w-8 text-gray-100" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-100">
            Join Performix
          </CardTitle>
          <CardDescription className="text-gray-300">
            Create your account and start booking classes today
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 text-white placeholder:text-gray-400 bg-gray-800/50 border-gray-600"
                  required
                />
              </div>
            </div>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-medium text-gray-200 hover:text-gray-100"
              >
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
