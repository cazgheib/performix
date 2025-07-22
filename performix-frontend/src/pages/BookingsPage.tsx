import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, X, CheckCircle, AlertCircle } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import axios from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'https://app-nimdsrfd.fly.dev'

interface Booking {
  id: string
  class_id: string
  booking_date: string
  status: string
}

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

interface BookingWithClass extends Booking {
  class_info?: Class
}

export const BookingsPage = () => {
  const [bookings, setBookings] = useState<BookingWithClass[]>([])
  const [loading, setLoading] = useState(true)
  const [cancelLoading, setCancelLoading] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [bookingsRes, classesRes] = await Promise.all([
        axios.get(`${API_URL}/bookings`),
        axios.get(`${API_URL}/classes`)
      ])

      const bookingsData = bookingsRes.data
      const classesData = classesRes.data

      const bookingsWithClassInfo = bookingsData.map((booking: Booking) => ({
        ...booking,
        class_info: classesData.find((cls: Class) => cls.id === booking.class_id)
      }))

      setBookings(bookingsWithClassInfo)
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCancelBooking = async (bookingId: string) => {
    setCancelLoading(bookingId)
    try {
      await axios.delete(`${API_URL}/bookings/${bookingId}`)
      toast({
        title: "Booking Cancelled",
        description: "Your booking has been cancelled successfully",
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.response?.data?.detail || "Failed to cancel booking",
        variant: "destructive",
      })
    } finally {
      setCancelLoading(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'bg-green-500'
      case 'cancelled':
        return 'bg-red-500'
      case 'completed':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return CheckCircle
      case 'cancelled':
        return X
      case 'completed':
        return CheckCircle
      default:
        return AlertCircle
    }
  }

  const upcomingBookings = bookings.filter(booking => 
    booking.class_info && new Date(booking.class_info.datetime) > new Date() && booking.status === 'confirmed'
  )

  const pastBookings = bookings.filter(booking => 
    booking.class_info && new Date(booking.class_info.datetime) <= new Date()
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative">
      {/* Hyrox-themed black background with different shades */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-40 h-40 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full blur-3xl"></div>
        </div>
        
        {/* Hyrox equipment silhouettes */}
        <div className="absolute inset-0 opacity-8">
          <div className="absolute top-1/4 left-1/4 transform -rotate-12">
            <div className="w-16 h-4 bg-gray-400 rounded-full"></div>
            <div className="w-4 h-16 bg-gray-400 rounded-full mx-auto -mt-2"></div>
          </div>
          <div className="absolute top-1/3 right-1/4 transform rotate-45">
            <div className="w-12 h-12 bg-gray-500 rounded-lg"></div>
            <div className="w-8 h-8 bg-gray-500 rounded-lg mx-auto mt-2"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/3 transform -rotate-45">
            <div className="w-20 h-6 bg-gray-400 rounded-full"></div>
          </div>
        </div>
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-3" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #374151 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Additional black shade layers for depth */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
          <div className="absolute left-0 top-0 w-1/4 h-full bg-gradient-to-r from-black/20 to-transparent"></div>
          <div className="absolute right-0 top-0 w-1/4 h-full bg-gradient-to-l from-black/20 to-transparent"></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-gray-200 via-white to-gray-300 bg-clip-text text-transparent">
            My Hyrox Bookings
          </h1>
          <p className="text-gray-300 text-base sm:text-lg">Manage your functional fitness class reservations</p>
          <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-gray-500 rounded-full mr-2"></div>
              Running + Functional Training
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
              Competition Ready
            </span>
          </div>
        </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <Card className="bg-gradient-to-br from-gray-900/60 to-black/80 backdrop-blur-md border-gray-600/40 text-white hover:from-gray-800/70 hover:to-black/90 transition-all duration-300 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs sm:text-sm">Upcoming Hyrox Sessions</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{upcomingBookings.length}</p>
              </div>
              <div className="relative">
                <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/80 backdrop-blur-md border-gray-500/40 text-white hover:from-gray-700/70 hover:to-gray-800/90 transition-all duration-300 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs sm:text-sm">Completed Workouts</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{pastBookings.length}</p>
              </div>
              <div className="relative">
                <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-black/60 to-gray-900/80 backdrop-blur-md border-gray-700/40 text-white hover:from-gray-900/70 hover:to-gray-800/90 transition-all duration-300 shadow-lg">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-xs sm:text-sm">Total Training Sessions</p>
                <p className="text-xl sm:text-2xl font-bold text-white">{bookings.length}</p>
              </div>
              <div className="relative">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gray-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {upcomingBookings.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full mr-2 sm:mr-3"></div>
            <span className="text-base sm:text-xl lg:text-2xl">Upcoming Hyrox Training Sessions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {upcomingBookings.map((booking) => {
              const StatusIcon = getStatusIcon(booking.status)
              if (!booking.class_info) return null

              return (
                <Card
                  key={booking.id}
                  className="bg-gradient-to-br from-gray-900/70 to-black/80 backdrop-blur-md border-gray-600/30 hover:border-gray-500/50 hover:from-gray-800/80 hover:to-black/90 transition-all duration-300 shadow-lg hover:shadow-gray-500/20"
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <CardTitle className="text-white text-base sm:text-lg mb-2">
                          {booking.class_info.name}
                        </CardTitle>
                        <CardDescription className="text-white/70 text-sm">
                          with {booking.class_info.instructor}
                        </CardDescription>
                      </div>
                      <Badge className={`${getStatusColor(booking.status)} text-white border-0 text-xs flex-shrink-0`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
                    <div className="space-y-2">
                      <div className="flex items-center text-white/80">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {new Date(booking.class_info.datetime).toLocaleDateString()}
                        </span>
                      </div>
                      
                      <div className="flex items-center text-white/80">
                        <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {new Date(booking.class_info.datetime).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} ({booking.class_info.duration_minutes} min)
                        </span>
                      </div>
                      
                      <div className="flex items-center text-white/80">
                        <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="text-xs sm:text-sm">
                          {booking.class_info.current_bookings}/{booking.class_info.max_capacity} spots
                        </span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <p className="text-white/60 text-xs mb-2 sm:mb-3">
                        Booked on {new Date(booking.booking_date).toLocaleDateString()}
                      </p>
                      
                      <Button
                        onClick={() => handleCancelBooking(booking.id)}
                        disabled={cancelLoading === booking.id}
                        variant="destructive"
                        size="sm"
                        className="w-full text-xs sm:text-sm py-2 sm:py-3"
                      >
                        {cancelLoading === booking.id ? (
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2" />
                            <span className="text-xs sm:text-sm">Cancelling...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center">
                            <X className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                            <span className="text-xs sm:text-sm">Cancel Booking</span>
                          </div>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {pastBookings.length > 0 && (
        <div className="mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4 flex items-center">
            <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-gray-600 to-gray-700 rounded-full mr-2 sm:mr-3"></div>
            <span className="text-base sm:text-xl lg:text-2xl">Completed Hyrox Sessions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {pastBookings.slice(0, 6).map((booking) => {
              const StatusIcon = getStatusIcon('completed')
              if (!booking.class_info) return null

              return (
                <Card
                  key={booking.id}
                  className="bg-gradient-to-br from-gray-900/40 to-black/50 backdrop-blur-md border-gray-600/20 opacity-75 hover:opacity-90 transition-all duration-300"
                >
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                      <div className="flex-1">
                        <CardTitle className="text-white text-base sm:text-lg mb-2">
                          {booking.class_info.name}
                        </CardTitle>
                        <CardDescription className="text-white/70 text-sm">
                          with {booking.class_info.instructor}
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-500 text-white border-0 text-xs flex-shrink-0">
                        <StatusIcon className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-2 p-4 sm:p-6">
                    <div className="flex items-center text-white/60">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {new Date(booking.class_info.datetime).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-white/60">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="text-xs sm:text-sm">
                        {new Date(booking.class_info.datetime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="text-center py-12 sm:py-16">
          <div className="relative mb-4 sm:mb-6">
            <Calendar className="h-16 w-16 sm:h-20 sm:w-20 text-white/50 mx-auto" />
            <div className="absolute -top-1 sm:-top-2 -right-1 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full flex items-center justify-center border border-gray-500">
              <span className="text-white text-xs font-bold">0</span>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 bg-gradient-to-r from-gray-200 to-white bg-clip-text text-transparent">
            Ready to Start Your Hyrox Journey?
          </h3>
          <p className="text-gray-400 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4">
            Book your first functional fitness session and join the Hyrox community. 
            Combine running with functional workouts for the ultimate challenge.
          </p>
          <Button className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-6 sm:px-8 py-2 sm:py-3 text-base sm:text-lg font-semibold shadow-lg hover:shadow-gray-500/25 transition-all duration-300 border border-gray-600">
            Browse Hyrox Classes
          </Button>
        </div>
      )}
      </div>
    </div>
  )
}
