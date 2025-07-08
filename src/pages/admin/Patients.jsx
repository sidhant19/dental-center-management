import React, { useContext, useState, useEffect } from 'react';
import { DataContext } from '../../contexts/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/admin/Sidebar';
import { AddPatientForm, EditPatientForm } from '../../components/admin/PatientForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { 
  Search, 
  UserPlus, 
  Eye, 
  Trash2,
  Users,
  Calendar,
  Phone,
  Mail,
  Copy,
  ExternalLink
} from 'lucide-react';
import { format } from 'date-fns';

const Patients = () => {
  const { 
    getAllPatients, 
    addPatient, 
    updatePatient, 
    getTotalPatients,
    getPatientEmail,
    getPatientById,
    getAllIncidents
  } = useContext(DataContext);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPatientForm, setShowAddPatientForm] = useState(false);
  const [showEditPatientForm, setShowEditPatientForm] = useState(false);
  const [selectedPatientData, setSelectedPatientData] = useState(null);
  const [patientsPerPage] = useState(10);

    const allPatients = getAllPatients();
  const allIncidents = getAllIncidents();

    const filteredPatients = allPatients
    .filter(patient => 
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.contact.includes(searchTerm) ||
      (getPatientEmail(patient.id)?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    )
    .sort((a, b) => a.name.localeCompare(b.name));

    const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

    const getActivePatients = () => {
    const twoMonthsAgo = new Date();
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    
    const recentIncidents = allIncidents.filter(incident => 
      new Date(incident.appointmentDate) >= twoMonthsAgo
    );
    
    const patientVisitCounts = {};
    recentIncidents.forEach(incident => {
      if (!patientVisitCounts[incident.patientId]) {
        patientVisitCounts[incident.patientId] = 0;
      }
      patientVisitCounts[incident.patientId]++;
    });
    
        return Object.values(patientVisitCounts).filter(count => count > 1).length;
  };

    const getAverageVisitsPerPatient = () => {
    if (allPatients.length === 0) return 0;
    
    const patientVisitCounts = {};
    allIncidents.forEach(incident => {
            if (incident.status !== 'Cancelled') {
        if (!patientVisitCounts[incident.patientId]) {
          patientVisitCounts[incident.patientId] = 0;
        }
        patientVisitCounts[incident.patientId]++;
      }
    });
    
    const totalVisits = Object.values(patientVisitCounts).reduce((sum, count) => sum + count, 0);
    return (totalVisits / allPatients.length).toFixed(1);
  };

    const totalPatients = getTotalPatients();
  const activePatients = getActivePatients();
  const averageVisits = getAverageVisitsPerPatient();

    const handlePhoneClick = (phoneNumber) => {
        const cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    window.open(`tel:${cleanNumber}`, '_blank');
  };

    const handleEmailClick = (email) => {
    window.open(`mailto:${email}`, '_blank');
  };

    const handleCopyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
            console.log(`${type} copied to clipboard`);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleSuccess = (result, message) => {
    console.log(message, result);
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

  const handleViewPatient = (patient) => {
        const completePatientData = getPatientById(patient.id);
    setSelectedPatientData(completePatientData);
    setShowEditPatientForm(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch {
      return 'Invalid Date';
    }
  };

  const getPatientAge = (dob) => {
    if (!dob) return 'N/A';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return 'N/A';
    }
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
              <h1 className="text-3xl font-bold tracking-tight">Patients</h1>
              <p className="text-muted-foreground">Manage your patient records and information.</p>
            </div>
            
            <Button onClick={() => setShowAddPatientForm(true)} className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add New Patient
            </Button>
          </div>

          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  All registered patients
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{activePatients}</div>
                <p className="text-xs text-muted-foreground">
                  Multiple visits in last 2 months
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Visits/Patient</CardTitle>
                <Search className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageVisits}</div>
                <p className="text-xs text-muted-foreground">
                  Average visits per patient
                </p>
              </CardContent>
            </Card>
          </div>

          
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search patients by name, contact, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          
          <Card>
            <CardHeader>
              <CardTitle>Patient List</CardTitle>
            </CardHeader>
            <CardContent>
              {currentPatients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'No patients found matching your search.' : 'No patients available.'}
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Health Info</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentPatients.map((patient) => {
                        const patientEmail = getPatientEmail(patient.id) || patient.email;
                        return (
                          <TableRow key={patient.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                  <AvatarFallback>
                                    {patient.name?.charAt(0).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">{patient.name}</div>
                                  <div className="text-sm text-muted-foreground">
                                    DOB: {formatDate(patient.dob)}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getPatientAge(patient.dob)} years
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handlePhoneClick(patient.contact)}
                                    className="text-primary hover:text-primary/80 underline cursor-pointer"
                                    title="Click to call"
                                  >
                                    {patient.contact}
                                  </button>
                                  <button
                                    onClick={() => handleCopyToClipboard(patient.contact, 'Phone number')}
                                    className="text-muted-foreground hover:text-foreground"
                                    title="Copy phone number"
                                  >
                                    <Copy className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <div className="flex items-center gap-1">
                                  {patientEmail ? (
                                    <>
                                      <button
                                        onClick={() => handleEmailClick(patientEmail)}
                                        className="text-primary hover:text-primary/80 underline cursor-pointer truncate max-w-[150px]"
                                        title="Click to send email"
                                      >
                                        {patientEmail}
                                      </button>
                                      <button
                                        onClick={() => handleCopyToClipboard(patientEmail, 'Email')}
                                        className="text-muted-foreground hover:text-foreground flex-shrink-0"
                                        title="Copy email"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    </>
                                  ) : (
                                    <span className="text-muted-foreground">No email</span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                {patient.healthInfo ? (
                                  <span className="text-sm text-muted-foreground truncate block">
                                    {patient.healthInfo}
                                  </span>
                                ) : (
                                  <Badge variant="outline">No info</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewPatient(patient)}
                                >
                                  <Eye className="h-4 w-4" />
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
    </div>
  );
};

export default Patients; 