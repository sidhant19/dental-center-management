import React, { useEffect, useContext, useState } from 'react';
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
import { CalendarIcon, History, Clock, DollarSign, Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import PatientHistoryDialog from './PatientHistoryDialog';

const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dob: z.string().min(1, 'Date of birth is required'),
  contact: z.string().min(10, 'Contact number must be at least 10 digits'),
  email: z.string().email('Invalid email address'),
  healthInfo: z.string().optional(),
});

export const AddPatientForm = ({ 
  open, 
  setOpen, 
  onSubmit,
  onSuccess
}) => {
  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      dob: '',
      contact: '',
      email: '',
      healthInfo: '',
    },
  });

    useEffect(() => {
    if (open) {
      form.reset({
        name: '',
        dob: '',
        contact: '',
        email: '',
        healthInfo: '',
      });
    }
  }, [open, form]);

  const handleSubmit = async (data) => {
    try {
      const result = await onSubmit(data);
      if (result && result.success) {
        onSuccess?.(result, result.message || 'Patient added successfully');
        setOpen(false);
      } else if (result && !result.success) {
        
        if (result.errors && result.errors.length > 0) {
          
          result.errors.forEach(error => {
            if (error.includes('Name')) {
              form.setError('name', { message: error });
            } else if (error.includes('Contact')) {
              form.setError('contact', { message: error });
            } else if (error.includes('Email')) {
              form.setError('email', { message: error });
            } else if (error.includes('Date of birth')) {
              form.setError('dob', { message: error });
            }
          });
        }
        
        onSuccess?.(result, result.message || 'Failed to add patient');
      }
    } catch (error) {
      console.error('Error saving patient:', error);
      onSuccess?.({ success: false, message: 'An unexpected error occurred' }, 'Error saving patient');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Patient</DialogTitle>
          <DialogDescription>
            Enter the patient's information to add them to the system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter patient name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input 
                      type="date" 
                      {...field}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter contact number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="healthInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Health Information</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter health information (allergies, conditions, etc.)" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button type="submit">
                Add Patient
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const EditPatientForm = ({ 
  open, 
  setOpen, 
  patientData,
  onSubmit,
  onSuccess
}) => {
  const [showPatientHistory, setShowPatientHistory] = useState(false);
  
  const form = useForm({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: '',
      dob: '',
      contact: '',
      email: '',
      healthInfo: '',
    },
  });

    useEffect(() => {
    if (open && patientData) {
      form.reset({
        name: patientData.name || '',
        dob: patientData.dob || '',
        contact: patientData.contact || '',
        email: patientData.email || '',
        healthInfo: patientData.healthInfo || '',
      });
    }
  }, [patientData, open, form]);

  const handleSubmit = async (data) => {
    try {
      const result = await onSubmit(data);
      if (result && result.success) {
        onSuccess?.(result, result.message || 'Patient updated successfully');
        setOpen(false);
      } else if (result && !result.success) {
        
        if (result.errors && result.errors.length > 0) {
          
          result.errors.forEach(error => {
            if (error.includes('Name')) {
              form.setError('name', { message: error });
            } else if (error.includes('Contact')) {
              form.setError('contact', { message: error });
            } else if (error.includes('Email')) {
              form.setError('email', { message: error });
            } else if (error.includes('Date of birth')) {
              form.setError('dob', { message: error });
            }
          });
        }
        
        onSuccess?.(result, result.message || 'Failed to update patient');
      }
    } catch (error) {
      console.error('Error updating patient:', error);
      onSuccess?.({ success: false, message: 'An unexpected error occurred' }, 'Error updating patient');
    }
  };

  if (!patientData) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>Edit Patient</DialogTitle>
            </div>
            <DialogDescription>
              Update the patient's information in the system.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter patient name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dob"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date of Birth</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="healthInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Health Information</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter health information (allergies, conditions, etc.)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPatientHistory(true)}
                className="flex items-center gap-1 flex-shrink-0"
              >
                <History className="h-3 w-3" />
                <span>Patient History</span>
              </Button>
                <Button type="submit">
                  Update Patient
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      
      <PatientHistoryDialog
        open={showPatientHistory}
        setOpen={setShowPatientHistory}
        patientId={patientData?.id}
      />
    </>
  );
};

const PatientForm = ({ 
  open, 
  setOpen, 
  patientData = null,
  isEditing = false,
  onSubmit,
  onSuccess,
  title = 'Add New Patient'
}) => {
  if (isEditing) {
    return (
      <EditPatientForm
        open={open}
        setOpen={setOpen}
        patientData={patientData}
        onSubmit={onSubmit}
        onSuccess={onSuccess}
      />
    );
  }

  return (
    <AddPatientForm
      open={open}
      setOpen={setOpen}
      onSubmit={onSubmit}
      onSuccess={onSuccess}
    />
  );
};

export default PatientForm; 