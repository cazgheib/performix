import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Settings, Users, Calendar, CreditCard, BookOpen, Plus, Edit, Trash2, BarChart3 } from 'lucide-react'
import { useToast } from '../hooks/use-toast'
import axios from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  role?: string
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

interface Membership {
  id: string
  user_id: string
  type: string
  start_date: string
  end_date: string
  is_active: boolean
}

interface Booking {
  id: string
  user_id: string
  class_id: string
  booking_date: string
  status: string
}

interface AppSetting {
  id: string
  key: string
  value: string
  category: string
  description?: string
}

interface DashboardStats {
  total_users: number
  total_classes: number
  total_memberships: number
  total_bookings: number
  active_memberships: number
  recent_bookings: Booking[]
}

export const AdminPage = () => {
  const { isAdmin } = useAuth()
  const { toast } = useToast()
  const [users, setUsers] = useState<User[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [memberships, setMemberships] = useState<Membership[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [settings, setSettings] = useState<AppSetting[]>([])
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  const [newUser, setNewUser] = useState({ email: '', password: '', full_name: '' })
  const [newClass, setNewClass] = useState({
    name: '',
    description: '',
    instructor: '',
    datetime: '',
    duration_minutes: 60,
    max_capacity: 20
  })
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editingClass, setEditingClass] = useState<Class | null>(null)

  useEffect(() => {
    if (isAdmin) {
      fetchAllData()
    }
  }, [isAdmin])

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [usersRes, classesRes, membershipsRes, bookingsRes, settingsRes, dashboardRes] = await Promise.all([
        axios.get(`${API_URL}/admin/users`),
        axios.get(`${API_URL}/admin/classes`),
        axios.get(`${API_URL}/admin/memberships`),
        axios.get(`${API_URL}/admin/bookings`),
        axios.get(`${API_URL}/admin/settings`),
        axios.get(`${API_URL}/admin/dashboard`)
      ])

      setUsers(usersRes.data)
      setClasses(classesRes.data)
      setMemberships(membershipsRes.data)
      setBookings(bookingsRes.data)
      setSettings(settingsRes.data)
      setDashboardStats(dashboardRes.data)
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast({
        title: "Error",
        description: "Failed to fetch admin data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const createUser = async () => {
    try {
      await axios.post(`${API_URL}/admin/users`, newUser)
      setNewUser({ email: '', password: '', full_name: '' })
      fetchAllData()
      toast({
        title: "Success",
        description: "User created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create user",
        variant: "destructive",
      })
    }
  }

  const updateUser = async () => {
    if (!editingUser) return
    try {
      await axios.put(`${API_URL}/admin/users/${editingUser.id}`, {
        email: editingUser.email,
        password: 'password123',
        full_name: editingUser.full_name
      })
      setEditingUser(null)
      fetchAllData()
      toast({
        title: "Success",
        description: "User updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update user",
        variant: "destructive",
      })
    }
  }

  const deleteUser = async (userId: string) => {
    try {
      await axios.delete(`${API_URL}/admin/users/${userId}`)
      fetchAllData()
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete user",
        variant: "destructive",
      })
    }
  }

  const createClass = async () => {
    try {
      if (!newClass.datetime) {
        toast({
          title: "Error",
          description: "Please select a valid date and time",
          variant: "destructive",
        })
        return
      }

      await axios.post(`${API_URL}/admin/classes`, {
        ...newClass,
        datetime: newClass.datetime
      })
      setNewClass({
        name: '',
        description: '',
        instructor: '',
        datetime: '',
        duration_minutes: 60,
        max_capacity: 20
      })
      fetchAllData()
      toast({
        title: "Success",
        description: "Class created successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to create class",
        variant: "destructive",
      })
    }
  }

  const updateClass = async () => {
    if (!editingClass) return
    try {
      await axios.put(`${API_URL}/admin/classes/${editingClass.id}`, {
        name: editingClass.name,
        description: editingClass.description,
        instructor: editingClass.instructor,
        datetime: new Date(editingClass.datetime).toISOString(),
        duration_minutes: editingClass.duration_minutes,
        max_capacity: editingClass.max_capacity
      })
      setEditingClass(null)
      fetchAllData()
      toast({
        title: "Success",
        description: "Class updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update class",
        variant: "destructive",
      })
    }
  }

  const deleteClass = async (classId: string) => {
    try {
      await axios.delete(`${API_URL}/admin/classes/${classId}`)
      fetchAllData()
      toast({
        title: "Success",
        description: "Class deleted successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete class",
        variant: "destructive",
      })
    }
  }

  const deleteBooking = async (bookingId: string) => {
    try {
      await axios.delete(`${API_URL}/admin/bookings/${bookingId}`)
      fetchAllData()
      toast({
        title: "Success",
        description: "Booking cancelled successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to cancel booking",
        variant: "destructive",
      })
    }
  }

  const updateSetting = async (settingId: string, value: string) => {
    try {
      await axios.put(`${API_URL}/admin/settings/${settingId}?value=${encodeURIComponent(value)}`)
      fetchAllData()
      toast({
        title: "Success",
        description: "Setting updated successfully",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update setting",
        variant: "destructive",
      })
    }
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
            <p className="text-gray-300">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-300"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-gray-300">Manage your Performix application</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/50">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="classes" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Classes
            </TabsTrigger>
            <TabsTrigger value="memberships" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Memberships
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Bookings
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {dashboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardStats.total_users}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Classes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardStats.total_classes}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Memberships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardStats.total_memberships}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Active Memberships</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardStats.active_memberships}</div>
                  </CardContent>
                </Card>
                <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-300">Total Bookings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{dashboardStats.total_bookings}</div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Users Management</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-700 hover:bg-gray-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add User
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New User</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email" className="text-gray-300">Email</Label>
                          <Input
                            id="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="full_name" className="text-gray-300">Full Name</Label>
                          <Input
                            id="full_name"
                            value={newUser.full_name}
                            onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="password" className="text-gray-300">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <Button onClick={createUser} className="w-full bg-gray-700 hover:bg-gray-600">
                          Create User
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Email</TableHead>
                      <TableHead className="text-gray-300">Full Name</TableHead>
                      <TableHead className="text-gray-300">Role</TableHead>
                      <TableHead className="text-gray-300">Created</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id} className="border-gray-700">
                        <TableCell className="text-white">{user.email}</TableCell>
                        <TableCell className="text-white">{user.full_name}</TableCell>
                        <TableCell className="text-white">{user.role || 'user'}</TableCell>
                        <TableCell className="text-white">
                          {new Date(user.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingUser(user)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {user.role !== 'admin' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => deleteUser(user.id)}
                                className="border-red-600 text-red-400 hover:bg-red-900"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Classes Management</CardTitle>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="bg-gray-700 hover:bg-gray-600">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Class
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border-gray-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Create New Class</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="name" className="text-gray-300">Name</Label>
                          <Input
                            id="name"
                            value={newClass.name}
                            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="description" className="text-gray-300">Description</Label>
                          <Input
                            id="description"
                            value={newClass.description}
                            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="instructor" className="text-gray-300">Instructor</Label>
                          <Input
                            id="instructor"
                            value={newClass.instructor}
                            onChange={(e) => setNewClass({ ...newClass, instructor: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div>
                          <Label htmlFor="datetime" className="text-gray-300">Date and Time</Label>
                          <Input
                            id="datetime"
                            type="datetime-local"
                            value={newClass.datetime}
                            onChange={(e) => setNewClass({ ...newClass, datetime: e.target.value })}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="duration" className="text-gray-300">Duration (minutes)</Label>
                            <Input
                              id="duration"
                              type="number"
                              value={newClass.duration_minutes}
                              onChange={(e) => setNewClass({ ...newClass, duration_minutes: parseInt(e.target.value) })}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                          <div>
                            <Label htmlFor="capacity" className="text-gray-300">Max Capacity</Label>
                            <Input
                              id="capacity"
                              type="number"
                              value={newClass.max_capacity}
                              onChange={(e) => setNewClass({ ...newClass, max_capacity: parseInt(e.target.value) })}
                              className="bg-gray-800 border-gray-600 text-white"
                            />
                          </div>
                        </div>
                        <Button onClick={createClass} className="w-full bg-gray-700 hover:bg-gray-600">
                          Create Class
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">Name</TableHead>
                      <TableHead className="text-gray-300">Instructor</TableHead>
                      <TableHead className="text-gray-300">Date and Time</TableHead>
                      <TableHead className="text-gray-300">Duration</TableHead>
                      <TableHead className="text-gray-300">Capacity</TableHead>
                      <TableHead className="text-gray-300">Bookings</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {classes.map((classItem) => (
                      <TableRow key={classItem.id} className="border-gray-700">
                        <TableCell className="text-white">{classItem.name}</TableCell>
                        <TableCell className="text-white">{classItem.instructor}</TableCell>
                        <TableCell className="text-white">
                          {new Date(classItem.datetime).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white">{classItem.duration_minutes}min</TableCell>
                        <TableCell className="text-white">{classItem.max_capacity}</TableCell>
                        <TableCell className="text-white">
                          {classItem.current_bookings}/{classItem.max_capacity}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingClass(classItem)}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => deleteClass(classItem.id)}
                              className="border-red-600 text-red-400 hover:bg-red-900"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memberships" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Memberships</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">Type</TableHead>
                      <TableHead className="text-gray-300">Start Date</TableHead>
                      <TableHead className="text-gray-300">End Date</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {memberships.map((membership) => (
                      <TableRow key={membership.id} className="border-gray-700">
                        <TableCell className="text-white">{membership.user_id}</TableCell>
                        <TableCell className="text-white">{membership.type}</TableCell>
                        <TableCell className="text-white">
                          {new Date(membership.start_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">
                          {new Date(membership.end_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white">
                          {membership.is_active ? 'Active' : 'Inactive'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">Bookings Management</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">Class ID</TableHead>
                      <TableHead className="text-gray-300">Booking Date</TableHead>
                      <TableHead className="text-gray-300">Status</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id} className="border-gray-700">
                        <TableCell className="text-white">{booking.user_id}</TableCell>
                        <TableCell className="text-white">{booking.class_id}</TableCell>
                        <TableCell className="text-white">
                          {new Date(booking.booking_date).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-white">{booking.status}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteBooking(booking.id)}
                            className="border-red-600 text-red-400 hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-900/90 backdrop-blur-sm border-gray-700/50">
              <CardHeader>
                <CardTitle className="text-white">App Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {settings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between p-4 border border-gray-700 rounded-lg">
                      <div>
                        <h3 className="text-white font-medium">{setting.key}</h3>
                        <p className="text-gray-400 text-sm">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          value={setting.value}
                          onChange={(e) => {
                            const newSettings = settings.map(s => 
                              s.id === setting.id ? { ...s, value: e.target.value } : s
                            )
                            setSettings(newSettings)
                          }}
                          className="bg-gray-800 border-gray-600 text-white w-48"
                        />
                        <Button
                          size="sm"
                          onClick={() => updateSetting(setting.id, setting.value)}
                          className="bg-gray-700 hover:bg-gray-600"
                        >
                          Update
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {editingUser && (
          <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Edit User</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-email" className="text-gray-300">Email</Label>
                  <Input
                    id="edit-email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-full-name" className="text-gray-300">Full Name</Label>
                  <Input
                    id="edit-full-name"
                    value={editingUser.full_name}
                    onChange={(e) => setEditingUser({ ...editingUser, full_name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <Button onClick={updateUser} className="w-full bg-gray-700 hover:bg-gray-600">
                  Update User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {editingClass && (
          <Dialog open={!!editingClass} onOpenChange={() => setEditingClass(null)}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Edit Class</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-class-name" className="text-gray-300">Name</Label>
                  <Input
                    id="edit-class-name"
                    value={editingClass.name}
                    onChange={(e) => setEditingClass({ ...editingClass, name: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-class-description" className="text-gray-300">Description</Label>
                  <Input
                    id="edit-class-description"
                    value={editingClass.description}
                    onChange={(e) => setEditingClass({ ...editingClass, description: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-class-instructor" className="text-gray-300">Instructor</Label>
                  <Input
                    id="edit-class-instructor"
                    value={editingClass.instructor}
                    onChange={(e) => setEditingClass({ ...editingClass, instructor: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-class-datetime" className="text-gray-300">Date and Time</Label>
                  <Input
                    id="edit-class-datetime"
                    type="datetime-local"
                    value={editingClass.datetime || ''}
                    onChange={(e) => setEditingClass({ ...editingClass, datetime: e.target.value })}
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-class-duration" className="text-gray-300">Duration (minutes)</Label>
                    <Input
                      id="edit-class-duration"
                      type="number"
                      value={editingClass.duration_minutes}
                      onChange={(e) => setEditingClass({ ...editingClass, duration_minutes: parseInt(e.target.value) })}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-class-capacity" className="text-gray-300">Max Capacity</Label>
                    <Input
                      id="edit-class-capacity"
                      type="number"
                      value={editingClass.max_capacity}
                      onChange={(e) => setEditingClass({ ...editingClass, max_capacity: parseInt(e.target.value) })}
                      className="bg-gray-800 border-gray-600 text-white"
                    />
                  </div>
                </div>
                <Button onClick={updateClass} className="w-full bg-gray-700 hover:bg-gray-600">
                  Update Class
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
