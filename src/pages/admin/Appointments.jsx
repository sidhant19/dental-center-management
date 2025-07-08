import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../contexts/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/admin/Sidebar';
import { AddAppointmentForm, EditAppointmentForm } from '../../components/admin/AppointmentForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  Calendar, 
  Eye, 
  Trash2,
  Clock,
  DollarSign,
  User,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';

const Appointments = () => {
  const { 
    getAllIncidents, 
    getPatientById, 
    addIncident, 
    updateIncident,
    cancelIncident,
    getPatientEmail
  } = useContext(DataContext);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [showEditAppointmentForm, setShowEditAppointmentForm] = useState(false);
  const [selectedAppointmentData, setSelectedAppointmentData] = useState(null);
  const [appointmentsPerPage] = useState(10);

    const allIncidents = getAllIncidents();

    const filteredAppointments = allIncidents
    .filter(appointment => {
      const patient = getPatientById(appointment.patientId);
      const patientEmail = getPatientEmail(appointment.patientId);
      
      const searchLower = searchTerm.toLowerCase();
      const titleMatch = appointment.title.toLowerCase().includes(searchLower);
      const descriptionMatch = appointment.description.toLowerCase().includes(searchLower);
      const patientNameMatch = patient?.name?.toLowerCase().includes(searchLower) || false;
      const patientEmailMatch = patientEmail?.toLowerCase().includes(searchLower) || false;
      
      return titleMatch || descriptionMatch || patientNameMatch || patientEmailMatch;
    })
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

    const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage);
  const startIndex = (currentPage - 1) * appointmentsPerPage;
  const endIndex = startIndex + appointmentsPerPage;
  const currentAppointments = filteredAppointments.slice(startIndex, endIndex);

    const totalAppointments = allIncidents.length;
  const scheduledAppointments = allIncidents.filter(a => a.status === 'Scheduled').length;
  const completedAppointments = allIncidents.filter(a => a.status === 'Completed').length;

  const handleSuccess = (result, message) => {
    console.log(message, result);
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

  const handleViewAppointment = (appointment) => {
    const patient = getPatientById(appointment.patientId);
    setSelectedAppointmentData({
      ...appointment,
      patient: patient
    });
    setShowEditAppointmentForm(true);
  };

  const handleDeleteAppointment = (appointmentId) => {
    const result = cancelIncident(appointmentId);
    if (result && result.success) {
      handleSuccess(result, result.message || 'Appointment cancelled successfully');
    } else {
      handleSuccess(result, result.message || 'Failed to cancel appointment');
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid Date';
    }
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
              <h1 className="text-3xl font-bold tracking-tight">Appointments</h1>
              <p className="text-muted-foreground">Manage appointments and schedules.</p>
            </div>
            
            <Button onClick={() => setShowAddAppointmentForm(true)} className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Schedule Appointment
            </Button>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  All appointments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{scheduledAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Upcoming appointments
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{completedAppointments}</div>
                <p className="text-xs text-muted-foreground">
                  Finished appointments
                </p>
              </CardContent>
            </Card>
          </div>

          
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments by title, description, patient name, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle>Appointment List</CardTitle>
            </CardHeader>
            <CardContent>
              {currentAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No appointments found matching your search.' : 'No appointments available.'}
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Appointment</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAppointments.map((appointment) => {
                        const patient = getPatientById(appointment.patientId);
                        return (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {patient?.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{patient?.name || 'Unknown Patient'}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {patient?.contact || 'No contact'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium">{appointment.title}</div>
                                <div className="text-sm text-muted-foreground truncate">
                                  {appointment.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDateTime(appointment.appointmentDate)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(appointment.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">
                                  {formatCurrency(appointment.cost)}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewAppointment(appointment)}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteAppointment(appointment.id)}
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  
                  
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      >
                        Previous
                      </Button>
                      <span className="flex items-center px-3 text-sm">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => prev + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Sidebar>

      
      <AddAppointmentForm
        open={showAddAppointmentForm}
        setOpen={setShowAddAppointmentForm}
        onSubmit={handleAddAppointment}
        onSuccess={handleSuccess}
      />

      
      <EditAppointmentForm
        open={showEditAppointmentForm}
        setOpen={setShowEditAppointmentForm}
        appointmentData={selectedAppointmentData}
        onSubmit={handleUpdateAppointment}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default Appointments; 