import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Dumbbell, User, LogOut, Calendar, CreditCard, BookOpen } from 'lucide-react'

export const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()

  if (!user) {
    return null
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Dumbbell },
    { path: '/classes', label: 'Classes', icon: Calendar },
    { path: '/membership', label: 'Membership', icon: CreditCard },
    { path: '/bookings', label: 'My Bookings', icon: BookOpen },
  ]

  return (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-gray-800 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-gray-100" />
              <span className="text-xl font-bold text-gray-100">Performix</span>
              <span className="text-sm text-gray-300">book my wood</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-700/50 text-gray-100 border border-gray-600/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              )
            })}

            <div className="flex items-center space-x-2 text-gray-300">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.full_name}</span>
            </div>

            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
