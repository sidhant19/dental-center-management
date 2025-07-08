import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../contexts/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/admin/Sidebar';
import { AddPatientForm, EditPatientForm } from '../../components/admin/PatientForm';
import { AddAppointmentForm, EditAppointmentForm } from '../../components/admin/AppointmentForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Plus,
  Eye,
  UserPlus,
  Clock,
  Activity
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const {
    getTotalRevenue,
    getMonthlyRevenue,
    getRevenueChange,
    getTotalPatients,
    getMonthlyNewPatients,
    getPatientChange,
    getPendingAppointments,
    getCompletedAppointments,
    getUpcomingAppointmentsPaginated,
    getTopPayingPatients,
    getMostVisitedPatients,
    getPatientById,
    addPatient,
    updatePatient,
    getIncidentById,
    addIncident,
    updateIncident,
    cancelIncident,
    completeIncident
  } = useContext(DataContext);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
    const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showEditPatientForm, setShowEditPatientForm] = useState(false);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [showEditAppointmentForm, setShowEditAppointmentForm] = useState(false);
  
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [selectedAppointmentData, setSelectedAppointmentData] = useState(null);

    const totalRevenue = getTotalRevenue();
  const monthlyRevenue = getMonthlyRevenue();
  const revenueChange = getRevenueChange();
  const totalPatients = getTotalPatients();
  const monthlyNewPatients = getMonthlyNewPatients();
  const patientChange = getPatientChange();
  const pendingAppointments = getPendingAppointments();
  const completedAppointments = getCompletedAppointments();

    const { appointments: upcomingAppointments, total: upcomingTotal } = getUpcomingAppointmentsPaginated(upcomingPage, 5);
  
    const { patients: topPayingPatients } = getTopPayingPatients(1, 3);
  const { patients: mostVisitedPatients } = getMostVisitedPatients(1, 3);

  const handleSuccess = (result, message) => {
    console.log(message, result);
      };

  const handleViewAppointment = (incidentId) => {
    const incident = getIncidentById(incidentId);
    if (incident) {
      const patient = getPatientById(incident.patientId);
      setSelectedAppointmentData({
        ...incident,
        patient: patient
      });
      setShowEditAppointmentForm(true);
    }
  };

  const handleAddPatient = async (patientData) => {
    const result = addPatient(patientData);
    return result;
  };

  const handleUpdatePatient = async (patientData) => {
    if (selectedPatientData) {
      const result = updatePatient(selectedPatientData.id, patientData);
      return result;
    }
    return { success: false, message: 'No patient selected' };
  };

  const handleAddAppointment = async (appointmentData) => {
    const result = addIncident(appointmentData);
    return result;
  };

  const handleUpdateAppointment = async (appointmentData) => {
    if (selectedAppointmentData) {
      const result = updateIncident(selectedAppointmentData.id, appointmentData);
      return result;
    }
    return { success: false, message: 'No appointment selected' };
  };

  const handleCancelAppointment = () => {
    if (selectedAppointmentData) {
      const result = cancelIncident(selectedAppointmentData.id);
      return result;
    }
    return { success: false, message: 'No appointment selected' };
  };

  const handleCompleteAppointment = () => {
    if (selectedAppointmentData) {
      const result = completeIncident(selectedAppointmentData.id);
      return result;
    }
    return { success: false, message: 'No appointment selected' };
  };

  const handleNewPatientSuccess = (result) => {
        console.log('New patient added:', result);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        burgerMenu={true} 
        showLogout={true} 
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}>
        <div className="p-6 space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{getGreeting()}, Admin</h1>
              <p className="text-muted-foreground">Here's what's happening with your dental center today.</p>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={() => setShowAddPatientForm(true)} className="flex items-center gap-2">
                <UserPlus className="h-4 w-4" />
                Add Patient
              </Button>
              <Button onClick={() => setShowAddAppointmentForm(true)} variant="outline" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule Appointment
              </Button>
            </div>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(monthlyRevenue)} this month
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {revenueChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(revenueChange).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  {monthlyNewPatients} new this month
                </p>
                <div className="flex items-center gap-1 mt-1">
                  {patientChange >= 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-600" />
                  ) : (
                    <TrendingDown className="h-3 w-3 text-red-600" />
                  )}
                  <span className={`text-xs ${patientChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {Math.abs(patientChange).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Appointments</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled appointments
                </p>
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Total completed
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No upcoming appointments
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Patient</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Cost</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {upcomingAppointments.map((appointment) => {
                          const patient = getPatientById(appointment.patientId);
                          return (
                            <TableRow key={appointment.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>
                                      {patient?.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="font-medium">{patient?.name}</div>
                                    <div className="text-sm text-muted-foreground">{patient?.contact}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {format(new Date(appointment.appointmentDate), 'MMM dd, yyyy HH:mm')}
                              </TableCell>
                              <TableCell>{appointment.title}</TableCell>
                              <TableCell>{formatCurrency(appointment.cost)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewAppointment(appointment.id)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    
                    {upcomingTotal > 5 && (
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={upcomingPage === 1}
                          onClick={() => setUpcomingPage(prev => Math.max(1, prev - 1))}
                        >
                          Previous
                        </Button>
                        <span className="flex items-center px-3 text-sm">
                          Page {upcomingPage} of {Math.ceil(upcomingTotal / 5)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={upcomingPage >= Math.ceil(upcomingTotal / 5)}
                          onClick={() => setUpcomingPage(prev => prev + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Most Visited Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mostVisitedPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patient data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {mostVisitedPatients.map((patient, index) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {patient.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{patient.name}</div>
                                <div className="text-sm text-muted-foreground">{patient.contact}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{patient.totalVisits}</div>
                            <div className="text-xs text-muted-foreground">Visits</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Top Paying Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                {topPayingPatients.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No patient data available
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {topPayingPatients.map((patient, index) => (
                        <div key={patient.id} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                              {index + 1}
                            </div>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {patient.name?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{patient.name}</div>
                                <div className="text-sm text-muted-foreground">{patient.contact}</div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">{formatCurrency(patient.totalRevenue)}</div>
                            <div className="text-xs text-muted-foreground">Total spent</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Sidebar>

      
      <AddPatientForm
        open={showAddPatientForm}
        setOpen={setShowAddPatientForm}
        onSubmit={handleAddPatient}
        onSuccess={handleSuccess}
      />

      
      <EditPatientForm
        open={showEditPatientForm}
        setOpen={setShowEditPatientForm}
        patientData={selectedPatientData}
        onSubmit={handleUpdatePatient}
        onSuccess={handleSuccess}
      />

      
      <AddAppointmentForm
        open={showAddAppointmentForm}
        setOpen={setShowAddAppointmentForm}
        onSubmit={handleAddAppointment}
        onSuccess={handleSuccess}
        onNewPatientSuccess={handleNewPatientSuccess}
      />

      
      <EditAppointmentForm
        open={showEditAppointmentForm}
        setOpen={setShowEditAppointmentForm}
        appointmentData={selectedAppointmentData}
        onSubmit={handleUpdateAppointment}
        onCancelAppointment={handleCancelAppointment}
        onCompleteAppointment={handleCompleteAppointment}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default AdminDashboard;