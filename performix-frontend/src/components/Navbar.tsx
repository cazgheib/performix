import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Link, useLocation } from 'react-router-dom'
import { Dumbbell, User, LogOut, Calendar, CreditCard, BookOpen, Menu, X } from 'lucide-react'

export const Navbar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  if (!user) {
    return null
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Dumbbell },
    { path: '/classes', label: 'Classes', icon: Calendar },
    { path: '/membership', label: 'Membership', icon: CreditCard },
    { path: '/bookings', label: 'My Bookings', icon: BookOpen },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className="bg-gradient-to-r from-black via-gray-900 to-gray-800 backdrop-blur-md border-b border-gray-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <Dumbbell className="h-8 w-8 text-gray-100" />
              <span className="text-lg sm:text-xl font-bold text-gray-100">Performix</span>
              <span className="hidden sm:inline text-sm text-gray-300">book my wood</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-2 lg:px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-gray-700/50 text-gray-100 border border-gray-600/30'
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              )
            })}

            <div className="hidden lg:flex items-center space-x-2 text-gray-300 ml-4">
              <User className="h-4 w-4" />
              <span className="text-sm">{user.full_name}</span>
            </div>

            <Button
              onClick={logout}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 ml-2"
            >
              <LogOut className="h-4 w-4 lg:mr-1" />
              <span className="hidden lg:inline">Logout</span>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <Button
              onClick={toggleMobileMenu}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-gray-100 hover:bg-gray-800/50"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-900/95 backdrop-blur-sm rounded-lg mt-2 border border-gray-700/50">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-md text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-gray-700/50 text-gray-100 border border-gray-600/30'
                        : 'text-gray-300 hover:bg-gray-800/50 hover:text-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
              
              <div className="flex items-center space-x-3 px-3 py-3 text-gray-300 border-t border-gray-700/50 mt-2 pt-3">
                <User className="h-5 w-5" />
                <span className="text-base">{user.full_name}</span>
              </div>
              
              <Button
                onClick={() => {
                  logout()
                  setIsMobileMenuOpen(false)
                }}
                variant="ghost"
                className="w-full justify-start text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 px-3 py-3 text-base"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
