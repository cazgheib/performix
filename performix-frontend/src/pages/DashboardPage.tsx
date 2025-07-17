import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users, Trophy, TrendingUp, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import axios from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

interface Class {
  id: string
  name: string
  description: string
  instructor: string
  datetime: string
  duration_minutes: number
  max_capacity: number
  current_bookings: number
}

interface Membership {
  id: string
  type: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface Booking {
  id: string
  class_id: string
  booking_date: string
  status: string
}

export const DashboardPage = () => {
  const { user } = useAuth()
  const [classes, setClasses] = useState<Class[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [classesRes, bookingsRes] = await Promise.all([
        axios.get(`${API_URL}/classes`),
        axios.get(`${API_URL}/bookings`)
      ])

      setClasses(classesRes.data)
      setBookings(bookingsRes.data)

      try {
        const membershipRes = await axios.get(`${API_URL}/memberships/current`)
        setMembership(membershipRes.data)
      } catch (error) {
        setMembership(null)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const upcomingClasses = classes
    .filter(cls => new Date(cls.datetime) > new Date())
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .slice(0, 3)


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-300"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-black via-gray-900 to-gray-800 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back, {user?.full_name}! 💪
        </h1>
        <p className="text-white/80">Ready to crush your fitness goals today?</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold">{bookings.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Active Classes</p>
                <p className="text-2xl font-bold">{classes.length}</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Membership</p>
                <p className="text-2xl font-bold capitalize">
                  {membership ? membership.type : 'None'}
                </p>
              </div>
              <Trophy className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">This Week</p>
                <p className="text-2xl font-bold">
                  {bookings.filter(b => {
                    const bookingDate = new Date(b.booking_date)
                    const weekAgo = new Date()
                    weekAgo.setDate(weekAgo.getDate() - 7)
                    return bookingDate > weekAgo
                  }).length}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="h-5 w-5 mr-2" />
              Upcoming Classes
            </CardTitle>
            <CardDescription className="text-white/70">
              Next classes available for booking
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingClasses.length > 0 ? (
              <div className="space-y-4">
                {upcomingClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/30"
                  >
                    <div>
                      <h3 className="font-semibold text-white">{cls.name}</h3>
                      <p className="text-sm text-white/70">with {cls.instructor}</p>
                      <div className="flex items-center text-sm text-white/60 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {new Date(cls.datetime).toLocaleDateString()} at{' '}
                        {new Date(cls.datetime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-white/60 mb-2">
                        <Users className="h-4 w-4 mr-1" />
                        {cls.current_bookings}/{cls.max_capacity}
                      </div>
                    </div>
                  </div>
                ))}
                <Link to="/classes">
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                    View All Classes
                  </Button>
                </Link>
              </div>
            ) : (
              <p className="text-white/70 text-center py-8">No upcoming classes</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Trophy className="h-5 w-5 mr-2" />
              Membership Status
            </CardTitle>
            <CardDescription className="text-white/70">
              Your current membership details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {membership ? (
              <div className="space-y-4">
                <div className="p-4 bg-green-500/20 rounded-lg border border-green-400/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-green-400 font-semibold capitalize">
                      {membership.type} Membership
                    </span>
                    <span className="text-green-400 text-sm">Active</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Expires: {new Date(membership.end_date).toLocaleDateString()}
                  </p>
                </div>
                <Link to="/membership">
                  <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700">
                    Manage Membership
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-orange-500/20 rounded-lg border border-orange-400/30">
                  <p className="text-orange-400 font-semibold">No Active Membership</p>
                  <p className="text-white/70 text-sm">
                    Get a membership to start booking classes
                  </p>
                </div>
                <Link to="/membership">
                  <Button className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700">
                    Get Membership
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
