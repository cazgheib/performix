import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Users, MapPin, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
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
  end_date: string
  is_active: boolean
}

export const ClassesPage = () => {
  const [classes, setClasses] = useState<Class[]>([])
  const [membership, setMembership] = useState<Membership | null>(null)
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState<string | null>(null)
  const [dayOffset, setDayOffset] = useState(0) // 0 = today, 1 = tomorrow, -1 = yesterday
  const { toast } = useToast()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const classesRes = await axios.get(`${API_URL}/classes`)
      setClasses(classesRes.data)

      try {
        const membershipRes = await axios.get(`${API_URL}/memberships/current`)
        setMembership(membershipRes.data)
      } catch (error) {
        setMembership(null)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: "Error",
        description: "Failed to load classes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const getCurrentDay = () => {
    const date = new Date()
    date.setDate(date.getDate() + dayOffset)
    return date
  }

  const getCurrentDayClasses = () => {
    const currentDay = getCurrentDay()
    const dayKey = currentDay.toDateString()
    
    const dayClasses = classes.filter(cls => {
      const classDate = new Date(cls.datetime)
      return classDate.toDateString() === dayKey
    })

    return dayClasses.sort((a, b) => 
      new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
    )
  }

  const handleBookClass = async (classId: string) => {
    if (!membership) {
      toast({
        title: "Membership Required",
        description: "You need an active membership to book classes",
        variant: "destructive",
      })
      return
    }

    setBookingLoading(classId)
    try {
      await axios.post(`${API_URL}/bookings`, { class_id: classId })
      toast({
        title: "Class Booked!",
        description: "You've successfully booked this class",
      })
      fetchData()
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.response?.data?.detail || "Failed to book class",
        variant: "destructive",
      })
    } finally {
      setBookingLoading(null)
    }
  }

  const getClassTypeColor = (name: string) => {
    if (name.toLowerCase().includes('crossfit')) return 'bg-red-500'
    if (name.toLowerCase().includes('yoga')) return 'bg-green-500'
    if (name.toLowerCase().includes('hiit')) return 'bg-orange-500'
    return 'bg-purple-500'
  }

  const getIntensityLevel = (name: string) => {
    if (name.toLowerCase().includes('crossfit') || name.toLowerCase().includes('hiit')) return 'High'
    if (name.toLowerCase().includes('yoga')) return 'Low'
    return 'Medium'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-300"></div>
      </div>
    )
  }

  const currentDay = getCurrentDay()
  const dayClasses = getCurrentDayClasses()
  
  const getDayTitle = () => {
    
    if (dayOffset === 0) {
      return "Today"
    } else if (dayOffset === 1) {
      return "Tomorrow"
    } else if (dayOffset === -1) {
      return "Yesterday"
    } else if (dayOffset > 0) {
      return `${dayOffset} days from now`
    } else {
      return `${Math.abs(dayOffset)} days ago`
    }
  }

  const handlePreviousDay = () => {
    setDayOffset(prev => prev - 1)
  }

  const handleNextDay = () => {
    setDayOffset(prev => prev + 1)
  }

  const handleToday = () => {
    setDayOffset(0)
  }

  return (
    <div className="min-h-screen relative">
      {/* Hyrox-themed black background with different shades */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-gray-700 to-gray-600 rounded-full blur-3xl"></div>
          <div className="absolute top-1/3 right-20 w-40 h-40 bg-gradient-to-r from-gray-800 to-gray-700 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-1/3 w-36 h-36 bg-gradient-to-r from-gray-600 to-gray-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-gradient-to-r from-gray-900 to-gray-800 rounded-full blur-3xl"></div>
        </div>
        
        {/* Hyrox equipment silhouettes */}
        <div className="absolute inset-0 opacity-8">
          <div className="absolute top-1/4 left-1/4 transform -rotate-12">
            <div className="w-16 h-4 bg-gray-400 rounded-full"></div>
            <div className="w-12 h-2 bg-gray-500 rounded-full mt-1 ml-2"></div>
          </div>
          <div className="absolute top-1/2 right-1/4 transform rotate-45">
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
            <div className="w-6 h-6 bg-gray-500 rounded-full mt-1 ml-1"></div>
          </div>
          <div className="absolute bottom-1/3 left-1/2 transform -rotate-45">
            <div className="w-20 h-3 bg-gray-400 rounded-full"></div>
            <div className="w-16 h-2 bg-gray-500 rounded-full mt-1 ml-2"></div>
          </div>
          <div className="absolute top-3/4 right-1/3 transform rotate-12">
            <div className="w-10 h-10 bg-gray-400 rounded-sm"></div>
            <div className="w-8 h-8 bg-gray-500 rounded-sm mt-1 ml-1"></div>
          </div>
        </div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-gray-200 via-white to-gray-300 bg-clip-text text-transparent">
                Daily Hyrox Schedule
              </h1>
              <p className="text-gray-300 text-sm sm:text-base">Book your functional fitness session</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handlePreviousDay}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-700 bg-gray-800/50"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </Button>
              
              <div className="text-center min-w-[120px]">
                <div className="text-white font-semibold text-sm">{getDayTitle()}</div>
                <div className="text-white/60 text-xs">
                  {currentDay.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <Button
                onClick={handleNextDay}
                variant="outline"
                size="sm"
                className="border-gray-600 text-white hover:bg-gray-700 bg-gray-800/50"
              >
                <ChevronRight className="h-4 w-4 text-white" />
              </Button>
            </div>
          </div>
          
          {dayOffset !== 0 && (
            <div className="flex justify-center mb-4">
              <Button
                onClick={handleToday}
                variant="outline"
                size="sm"
                className="border-blue-500 text-blue-400 hover:bg-blue-500/20 bg-gray-800/50"
              >
                <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                Back to Today
              </Button>
            </div>
          )}
          
          {!membership && (
            <div className="mt-4 p-3 sm:p-4 bg-orange-500/20 rounded-lg border border-orange-400/30">
              <p className="text-orange-400 font-semibold text-sm sm:text-base">No Active Membership</p>
              <p className="text-white/70 text-xs sm:text-sm">
                You need an active membership to book classes. Get one from the membership page.
              </p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className={`px-4 py-2 rounded-lg ${
                dayOffset === 0 ? 'bg-blue-600' : 
                currentDay < new Date() && dayOffset !== 0 ? 'bg-gray-600/50' : 
                'bg-gray-700'
              }`}>
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  {currentDay.toLocaleDateString('en-US', { weekday: 'long' })}
                </h2>
                <p className="text-white/80 text-sm">{currentDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                {dayOffset === 0 && <p className="text-blue-200 text-xs">Today</p>}
                {currentDay < new Date() && dayOffset !== 0 && <p className="text-gray-400 text-xs">Past</p>}
              </div>
              <div className="flex-1 h-px bg-gray-700"></div>
              <div className="text-white/60 text-sm">
                {dayClasses.length} {dayClasses.length === 1 ? 'class' : 'classes'}
              </div>
            </div>

            {dayClasses.length === 0 ? (
              <div className="text-center py-8 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <Calendar className="h-8 w-8 text-white/30 mx-auto mb-2" />
                <p className="text-white/50 text-sm">No classes scheduled for this day</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {dayClasses.map((cls) => {
                  const classDateTime = new Date(cls.datetime)
                  const isUpcoming = classDateTime > new Date()
                  const isFull = cls.current_bookings >= cls.max_capacity
                  const canBook = membership && isUpcoming && !isFull

                  return (
                    <Card
                      key={cls.id}
                      className="bg-gradient-to-br from-gray-900 to-gray-800 backdrop-blur-md border-gray-700/50 hover:bg-gradient-to-br hover:from-gray-800 hover:to-gray-700 transition-all duration-300"
                    >
                      <CardHeader className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-white text-base mb-1">{cls.name}</CardTitle>
                            <CardDescription className="text-white/70 text-sm">
                              {cls.description}
                            </CardDescription>
                          </div>
                          <div className={`w-3 h-3 rounded-full ${getClassTypeColor(cls.name)} flex-shrink-0`} />
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge 
                            variant="secondary" 
                            className={`${getClassTypeColor(cls.name)} text-white border-0 text-xs`}
                          >
                            {getIntensityLevel(cls.name)} Intensity
                          </Badge>
                          <Badge variant="outline" className="text-white/80 border-white/30 text-xs">
                            {cls.duration_minutes} min
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3 p-4">
                        <div className="space-y-2">
                          <div className="flex items-center text-white/80">
                            <MapPin className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-xs">Instructor: {cls.instructor}</span>
                          </div>
                          
                          <div className="flex items-center text-white/80">
                            <Clock className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-xs">
                              {new Date(cls.datetime).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                          </div>
                          
                          <div className="flex items-center text-white/80">
                            <Users className="h-3 w-3 mr-2 flex-shrink-0" />
                            <span className="text-xs">
                              {cls.current_bookings}/{cls.max_capacity} spots filled
                            </span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-700/50 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(cls.current_bookings / cls.max_capacity) * 100}%`
                            }}
                          />
                        </div>

                        <Button
                          onClick={() => handleBookClass(cls.id)}
                          disabled={!canBook || bookingLoading === cls.id}
                          className={`w-full text-sm py-2 ${
                            canBook
                              ? 'bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700'
                              : 'bg-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {bookingLoading === cls.id ? (
                            <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2" />
                              <span className="text-xs">Booking...</span>
                            </div>
                          ) : !isUpcoming ? (
                            <span className="text-xs">Class Ended</span>
                          ) : isFull ? (
                            <span className="text-xs">Class Full</span>
                          ) : !membership ? (
                            <span className="text-xs">Membership Required</span>
                          ) : (
                            <div className="flex items-center justify-center">
                              <Zap className="h-3 w-3 mr-2" />
                              <span className="text-xs">Book Class</span>
                            </div>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
