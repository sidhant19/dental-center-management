import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { DataContext } from '../../contexts/DataContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Upload, X, Plus, Download, History, Clock, DollarSign } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { AddPatientForm } from './PatientForm';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import PatientHistoryDialog from './PatientHistoryDialog';

const appointmentSchema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  comments: z.string().optional(),
  appointmentDate: z.date({
    required_error: 'Appointment date is required',
  }),
  appointmentTime: z.string().min(1, 'Appointment time is required'),
  cost: z.number().min(0, 'Cost must be a positive number'),
});


export const AddAppointmentForm = ({ 
  open, 
  setOpen, 
  onSubmit,
  onSuccess,
  onNewPatientSuccess,
  initialData = null
}) => {
  const { searchPatients, getPatientById } = useContext(DataContext);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [files, setFiles] = useState([]);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showPatientHistory, setShowPatientHistory] = useState(false);

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      title: '',
      description: '',
      comments: '',
      appointmentDate: undefined,
      appointmentTime: '',
      cost: 0,
    },
  });


  useEffect(() => {
    if (open) {
      setSelectedPatient(null);
      setSearchTerm('');
      setSearchResults([]);
      setFiles([]);
      
      let defaultValues = {
        patientId: '',
        title: '',
        description: '',
        comments: '',
        appointmentDate: undefined,
        appointmentTime: '',
        cost: 0,
      };


      if (initialData) {
        if (initialData.appointmentDate) {
          defaultValues.appointmentDate = new Date(initialData.appointmentDate);
        }
        if (initialData.appointmentTime) {
          defaultValues.appointmentTime = initialData.appointmentTime;
        }
        if (initialData.patientId) {
          defaultValues.patientId = initialData.patientId;

          const patient = getPatientById(initialData.patientId);
          if (patient) {
            setSelectedPatient(patient);
            setSearchTerm(patient.name);
          }
        }
        if (initialData.title) {
          defaultValues.title = initialData.title;
        }
        if (initialData.description) {
          defaultValues.description = initialData.description;
        }
        if (initialData.comments) {
          defaultValues.comments = initialData.comments;
        }
        if (initialData.cost) {
          defaultValues.cost = initialData.cost;
        }
        if (initialData.files) {
          setFiles(initialData.files);
        }
      }
      
      form.reset(defaultValues);
    }
  }, [open, form, initialData, searchPatients]);

  const handlePatientSearch = (term) => {
    setSearchTerm(term);
    if (term.length > 2) {
      const results = searchPatients(term);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
    form.setValue('patientId', patient.id);
    setSearchTerm(patient.name);
    setSearchResults([]);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setFiles(prev => [...prev, {
          name: file.name,
          url: base64
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (data) => {
    try {
      const appointmentDateTime = new Date(data.appointmentDate);
      const [hours, minutes] = data.appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const incidentData = {
        patientId: data.patientId,
        title: data.title,
        description: data.description,
        comments: data.comments,
        appointmentDate: appointmentDateTime.toISOString(),
        cost: data.cost,
        files: files,
        status: "Scheduled" 
      };

      const result = await onSubmit(incidentData);
      if (result && result.success) {
        onSuccess?.(result, result.message || 'Appointment scheduled successfully');
        setOpen(false);
      } else if (result && !result.success) {
        
        if (result.errors && result.errors.length > 0) {
          
          result.errors.forEach(error => {
            if (error.includes('Patient')) {
              form.setError('patientId', { message: error });
            } else if (error.includes('Title')) {
              form.setError('title', { message: error });
            } else if (error.includes('Appointment date')) {
              form.setError('appointmentDate', { message: error });
            } else if (error.includes('Cost')) {
              form.setError('cost', { message: error });
            }
          });
        }
        
        onSuccess?.(result, result.message || 'Failed to schedule appointment');
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      onSuccess?.({ success: false, message: 'An unexpected error occurred' }, 'Error saving appointment');
    }
  };

  const handleNewPatientSuccess = (result) => {
    setSelectedPatient(result.patient);
    form.setValue('patientId', result.patient.id);
    setShowPatientForm(false);
    onNewPatientSuccess?.(result);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Schedule New Appointment</DialogTitle>
            <DialogDescription>
              Create a new appointment for a patient with all necessary details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <FormControl>
                          <Input
                            placeholder="Search patients..."
                            value={searchTerm}
                            onChange={(e) => handlePatientSearch(e.target.value)}
                            className="flex-1"
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowPatientForm(true)}
                          className="sm:w-auto"
                        >
                          <Plus className="h-4 w-4 sm:mr-2" />
                          <span className="hidden sm:inline">Add Patient</span>
                        </Button>
                      </div>
                      
                      {searchResults.length > 0 && (
                        <div className="border rounded-md p-2 max-h-32 overflow-y-auto">
                          {searchResults.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-2 hover:bg-accent rounded cursor-pointer"
                              onClick={() => handlePatientSelect(patient)}
                            >
                              <div className="font-medium">{patient.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {patient.contact} • {patient.email || 'No email'}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {selectedPatient && (
                        <div className="p-3 bg-accent rounded-md">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium">{selectedPatient.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {selectedPatient.contact} • {selectedPatient.email || 'No email'}
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setShowPatientHistory(true)}
                                className="flex items-center gap-1 ml-2 flex-shrink-0"
                              >
                                <History className="h-3 w-3" />
                                <span className="hidden sm:inline">History</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Appointment title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the appointment details" 
                        {...field} 
                        className="min-h-[80px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional comments or notes" 
                        {...field} 
                        className="min-h-[60px]"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field}
                          className="w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              
              <div className="space-y-2">
                <Label>Attachments</Label>
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground sm:ml-2" />
                  </div>
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-background rounded">
                          <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="ml-2 flex-shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button type="submit" className="w-full sm:w-auto">
                  Schedule Appointment
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>


      <AddPatientForm
        open={showPatientForm}
        setOpen={setShowPatientForm}
        onSubmit={onNewPatientSuccess}
        onSuccess={handleNewPatientSuccess}
      />


      <PatientHistoryDialog
        open={showPatientHistory}
        setOpen={setShowPatientHistory}
        patientId={selectedPatient?.id}
      />
    </>
  );
};


export const EditAppointmentForm = ({ 
  open, 
  setOpen, 
  appointmentData,
  onSubmit,
  onCancelAppointment,
  onCompleteAppointment,
  onSuccess
}) => {
  const { getPatientById } = useContext(DataContext);
  
  const [files, setFiles] = useState([]);
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  const [showFollowupForm, setShowFollowupForm] = useState(false);

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      title: '',
      description: '',
      comments: '',
      appointmentDate: undefined,
      appointmentTime: '',
      cost: 0,
    },
  });

  useEffect(() => {
    if (open && appointmentData) {
      setFiles(appointmentData.files || []);
      
      const appointmentDate = new Date(appointmentData.appointmentDate);
      form.reset({
        patientId: appointmentData.patientId,
        title: appointmentData.title,
        description: appointmentData.description,
        comments: appointmentData.comments || '',
        appointmentDate: appointmentDate,
        appointmentTime: format(appointmentDate, 'HH:mm'),
        cost: appointmentData.cost,
      });
    }
  }, [appointmentData, open, form]);

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result;
        setFiles(prev => [...prev, {
          name: file.name,
          url: base64
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const downloadFile = (file) => {
        const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    
        document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (data) => {
    try {
      const appointmentDateTime = new Date(data.appointmentDate);
      const [hours, minutes] = data.appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const incidentData = {
        patientId: data.patientId,
        title: data.title,
        description: data.description,
        comments: data.comments,
        appointmentDate: appointmentDateTime.toISOString(),
        cost: data.cost,
        files: files
      };

      const result = await onSubmit(incidentData);
      if (result && result.success) {
        onSuccess?.(result, result.message || 'Appointment updated successfully');
        setOpen(false);
      } else if (result && !result.success) {
        
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => {
            if (error.includes('Patient')) {
              form.setError('patientId', { message: error });
            } else if (error.includes('Title')) {
              form.setError('title', { message: error });
            } else if (error.includes('Appointment date')) {
              form.setError('appointmentDate', { message: error });
            } else if (error.includes('Cost')) {
              form.setError('cost', { message: error });
            }
          });
        }
        onSuccess?.(result, result.message || 'Failed to update appointment');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
      onSuccess?.({ success: false, message: 'An unexpected error occurred' }, 'Error updating appointment');
    }
  };

  const handleCancelAppointment = () => {
    if (onCancelAppointment) {
      const result = onCancelAppointment();
      if (result && result.success) {
        onSuccess?.(result, result.message || 'Appointment cancelled successfully');
        setOpen(false);
      } else {
        onSuccess?.(result, result.message || 'Failed to cancel appointment');
      }
    }
  };

  const handleCompleteAppointment = () => {
    if (onCompleteAppointment) {
      const result = onCompleteAppointment();
      if (result && result.success) {
        onSuccess?.(result, result.message || 'Appointment completed successfully');
        setOpen(false);
      } else {
        onSuccess?.(result, result.message || 'Failed to complete appointment');
      }
    }
  };

  const handleScheduleFollowup = () => {
    if (appointmentData) {
      setShowFollowupForm(true);
    }
  };

  if (!appointmentData) return null;

  const patient = getPatientById(appointmentData.patientId);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appointment</DialogTitle>
            <DialogDescription>
              Update the appointment details and manage the patient's appointment.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              
              <FormField
                control={form.control}
                name="patientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patient</FormLabel>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{patient?.name || 'Unknown Patient'}</div>
                          <div className="text-sm text-muted-foreground">
                            {patient?.contact || 'No contact'} • {patient?.email || 'No email'}
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPatientHistory(true)}
                          className="flex items-center gap-1 ml-2 flex-shrink-0"
                        >
                          <History className="h-3 w-3" />
                          <span className="hidden sm:inline">History</span>
                        </Button>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Appointment title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cost ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0.00" 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the appointment..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Additional notes..." 
                        className="min-h-[80px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="appointmentDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="appointmentTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="time" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              
              <div className="space-y-2">
                <Label>File Attachments</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="cursor-pointer"
                  />
                  
                  {files.length > 0 && (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm truncate flex-1">{file.name}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(file)}
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFile(index)}
                              title="Remove file"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              
              <div className="flex flex-col gap-2 pt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button type="submit" className="flex-1">
                    Update Appointment
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleScheduleFollowup}
                    className="flex-1"
                  >
                    Schedule Followup
                  </Button>
                </div>
                
                {appointmentData.status === 'Scheduled' && (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCompleteAppointment}
                      className="flex-1"
                    >
                      Mark Complete
                    </Button>
                    <Button 
                      type="button" 
                      variant="destructive" 
                      onClick={handleCancelAppointment}
                      className="flex-1"
                    >
                      Cancel Appointment
                    </Button>
                  </div>
                )}
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      
      <PatientHistoryDialog
        open={showPatientHistory}
        setOpen={setShowPatientHistory}
        patientId={appointmentData?.patientId}
      />

      
      <FollowupAppointmentForm
        open={showFollowupForm}
        setOpen={setShowFollowupForm}
        originalAppointment={appointmentData}
        onSuccess={onSuccess}
      />
    </>
  );
};

const FollowupAppointmentForm = ({ 
  open, 
  setOpen, 
  originalAppointment,
  onSuccess
}) => {
  const { addIncident, getPatientById } = useContext(DataContext);
  
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [files, setFiles] = useState([]);

  const form = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      patientId: '',
      title: '',
      description: '',
      comments: '',
      appointmentDate: undefined,
      appointmentTime: '',
      cost: 0,
    },
  });

    useEffect(() => {
    if (open && originalAppointment) {
      const appointmentDate = new Date(originalAppointment.appointmentDate);
            const followupDate = new Date(appointmentDate);
      followupDate.setDate(followupDate.getDate() + 1);
      
            const timeString = format(appointmentDate, 'HH:mm');
      
            const patient = getPatientById(originalAppointment.patientId);
      if (patient) {
        setSelectedPatient(patient);
      }
      
            setFiles(originalAppointment.files || []);
      
      form.reset({
        patientId: originalAppointment.patientId,
        title: `Follow up: ${originalAppointment.title}`,
        description: originalAppointment.description,
        comments: originalAppointment.comments,
        appointmentDate: followupDate,
        appointmentTime: timeString,
        cost: originalAppointment.cost,
      });
    }
  }, [open, originalAppointment, form, getPatientById]);

  const handleSubmit = async (data) => {
    try {
      const appointmentDateTime = new Date(data.appointmentDate);
      const [hours, minutes] = data.appointmentTime.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const incidentData = {
        patientId: data.patientId,
        title: data.title,
        description: data.description,
        comments: data.comments,
        appointmentDate: appointmentDateTime.toISOString(),
        cost: data.cost,
        files: files,
        status: "Scheduled"       };

      const result = await addIncident(incidentData);
      if (result && result.success) {
        onSuccess?.(result, result.message || 'Followup appointment scheduled successfully');
        setOpen(false);
      } else if (result && !result.success) {
        
        if (result.errors && result.errors.length > 0) {
          result.errors.forEach(error => {
            if (error.includes('Patient')) {
              form.setError('patientId', { message: error });
            } else if (error.includes('Title')) {
              form.setError('title', { message: error });
            } else if (error.includes('Appointment date')) {
              form.setError('appointmentDate', { message: error });
            } else if (error.includes('Cost')) {
              form.setError('cost', { message: error });
            }
          });
        }
        onSuccess?.(result, result.message || 'Failed to schedule followup appointment');
      }
    } catch (error) {
      console.error('Error scheduling followup appointment:', error);
      onSuccess?.({ success: false, message: 'An unexpected error occurred' }, 'Error scheduling followup appointment');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Followup Appointment</DialogTitle>
          <DialogDescription>
            Create a followup appointment based on the original appointment details.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            
            <FormField
              control={form.control}
              name="patientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient</FormLabel>
                  <div className="p-3 bg-muted rounded-md">
                    <div className="font-medium">{selectedPatient?.name || 'Unknown Patient'}</div>
                    <div className="text-sm text-muted-foreground">
                      {selectedPatient?.contact || 'No contact'} • {selectedPatient?.email || 'No email'}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Appointment title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cost ($)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0.00" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the appointment..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes..." 
                      className="min-h-[80px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="appointmentDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="appointmentTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input 
                        type="time" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            
            <div className="space-y-2">
              <Label>File Attachments</Label>
              <div className="space-y-2">
                <Input
                  type="file"
                  multiple
                  onChange={(event) => {
                    const files = Array.from(event.target.files);
                    files.forEach(file => {
                      const reader = new FileReader();
                      reader.onload = () => {
                        const base64 = reader.result;
                        setFiles(prev => [...prev, {
                          name: file.name,
                          url: base64
                        }]);
                      };
                      reader.readAsDataURL(file);
                    });
                  }}
                  className="cursor-pointer"
                />
                
                {files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = file.url;
                              link.download = file.name;
                              link.target = '_blank';
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiles(prev => prev.filter((_, i) => i !== index))}
                            title="Remove file"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" className="w-full sm:w-auto">
                Schedule Followup
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

const AppointmentForm = ({ 
  open, 
  setOpen, 
  appointmentData = null,
  isEditing = false,
  onSubmit,
  onCancelAppointment,
  onCompleteAppointment,
  onSuccess,
  title = 'Schedule New Appointment',
  showPatientForm = false,
  setShowPatientForm = () => {},
  onNewPatientSuccess
}) => {
  if (isEditing) {
    return (
      <EditAppointmentForm
        open={open}
        setOpen={setOpen}
        appointmentData={appointmentData}
        onSubmit={onSubmit}
        onCancelAppointment={onCancelAppointment}
        onCompleteAppointment={onCompleteAppointment}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <AddAppointmentForm
      open={open}
      setOpen={setOpen}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
      onNewPatientSuccess={onNewPatientSuccess}
    />
  );
};

export default AppointmentForm; 