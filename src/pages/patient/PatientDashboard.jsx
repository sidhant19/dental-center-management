import React, { useContext, useState } from 'react';
import { DataContext } from '@/contexts/DataContext';
import { AuthContext } from '@/contexts/AuthContext';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  Phone, 
  Mail, 
  FileText,
  Download,
  CalendarDays
} from 'lucide-react';
import Header from '@/components/Header';
import AttachmentDialog from '@/components/patient/AttatchmentDialog';
import { format } from 'date-fns';

function getGreeting(name) {
  const hour = new Date().getHours();
  let greeting = 'Good Morning';
  if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';
  else if (hour >= 18 || hour < 5) greeting = 'Good Evening';
  return `${greeting}, ${name}`;
}

function PatientDashboard() {
  const { user } = useContext(AuthContext);
  const patientId = user.patientId;
  const {
    getPatientById,
    getUpcomingAppointments,
    getHistoricalAppointments,
  } = useContext(DataContext);

  const patient = getPatientById(patientId);
  const upcoming = getUpcomingAppointments(patientId);
  const historical = getHistoricalAppointments(patientId);

    const [selectedFiles, setSelectedFiles] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewAttachments = (files) => {
    setSelectedFiles(files);
    setDialogOpen(true);
  };

  if (!patient) return <div className="flex items-center justify-center h-96">Loading...</div>;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Scheduled':
        return <Badge variant="default">Scheduled</Badge>;
      case 'Completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'Cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header burgerMenu={false} showLogout={true} />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {getGreeting(patient.name.split(' ')[0])}
            </h1>
            <p className="text-muted-foreground">Welcome to your patient dashboard.</p>
          </div>
        </div>

        
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col lg:flex-row gap-8">
                
                <div className="flex flex-col items-center gap-6 lg:gap-4">
                  <Avatar className="h-24 w-24 lg:h-32 lg:w-32 border-4 border-primary/10">
                    <AvatarFallback className="text-2xl lg:text-3xl font-semibold bg-primary/5">
                      {patient.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center max-w-xs">
                    <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-1 break-words">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-muted-foreground font-medium">
                      Patient ID: {patient.id}
                    </p>
                  </div>
                </div>
                
                
                <div className="flex-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Personal Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Date of Birth</p>
                            <p className="text-sm font-medium">{patient.dob}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Contact Number</p>
                            <p className="text-sm font-medium">{patient.contact}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                        Health Information
                      </h4>
                      <div className="space-y-3">
                        {patient.healthInfo ? (
                          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs text-muted-foreground">Medical Notes</p>
                              <p className="text-sm font-medium leading-relaxed">{patient.healthInfo}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div>
                              <p className="text-xs text-muted-foreground">Medical Notes</p>
                              <p className="text-sm font-medium text-muted-foreground">No health information recorded</p>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                          <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <div>
                            <p className="text-xs text-muted-foreground">Patient Status</p>
                            <p className="text-sm font-medium text-green-600">Active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Next Appointment</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {upcoming.length > 0 ? (
                <>
                  <div className="text-lg font-bold">
                    {formatDate(upcoming[0].appointmentDate)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {upcoming[0].title}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-muted-foreground">No upcoming</div>
                  <p className="text-xs text-muted-foreground">
                    No scheduled appointments
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Visit</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {historical.length > 0 ? (
                <>
                  <div className="text-lg font-bold">
                    {formatDate(historical[0].appointmentDate)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {historical[0].title}
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-muted-foreground">No visits</div>
                  <p className="text-xs text-muted-foreground">
                    No previous appointments
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Days Since Last Visit</CardTitle>
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {historical.length > 0 ? (
                <>
                  <div className="text-lg font-bold">
                    {Math.floor((new Date() - new Date(historical[0].appointmentDate)) / (1000 * 60 * 60 * 24))} days
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Since last appointment
                  </p>
                </>
              ) : (
                <>
                  <div className="text-lg font-bold text-muted-foreground">N/A</div>
                  <p className="text-xs text-muted-foreground">
                    No previous visits
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upcoming">Upcoming Appointments</TabsTrigger>
            <TabsTrigger value="history">Appointment History</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-6">
            {upcoming.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No upcoming appointments.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {upcoming.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-lg font-semibold leading-tight flex-1">
                          {appointment.title}
                        </CardTitle>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {appointment.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{formatCurrency(appointment.cost)}</span>
                        </div>
                      </div>
                      
                      {appointment.files && appointment.files.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleViewAttachments(appointment.files)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View Attachments ({appointment.files.length})
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            {historical.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No appointment history.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {historical.map((appointment) => (
                  <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <CardTitle className="text-lg font-semibold leading-tight flex-1">
                          {appointment.title}
                        </CardTitle>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {appointment.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{formatDate(appointment.appointmentDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Cost:</span>
                          <span className="font-medium">{formatCurrency(appointment.cost)}</span>
                        </div>
                      </div>
                      
                      {appointment.files && appointment.files.length > 0 && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleViewAttachments(appointment.files)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          View Attachments ({appointment.files.length})
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      
      <AttachmentDialog 
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        files={selectedFiles}
      />
    </div>
  );
}

export default PatientDashboard;