import React, { useContext } from 'react';
import { DataContext } from '../../contexts/DataContext';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../ui/dialog';
import { History, Clock, Download, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const PatientHistoryDialog = ({ open, setOpen, patientId }) => {
  const { getAllIncidents, getPatientById } = useContext(DataContext);
  
  const patient = getPatientById(patientId);
  const allAppointments = getAllIncidents();
  
    const patientAppointments = allAppointments
    .filter(appointment => appointment.patientId === patientId)
    .sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));

  const downloadFile = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[95vw] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Appointment History - {patient.name}
          </DialogTitle>
          <DialogDescription>
            View all appointments for {patient.name}.
          </DialogDescription>
        </DialogHeader>
        
        
              {patientAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No previous appointments found for this patient.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {patientAppointments.map((appointment) => {
                    const appointmentDate = new Date(appointment.appointmentDate);
                    
                    return (
                      <Card key={appointment.id} className="border">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-muted-foreground" />
                                  <h3 className="font-medium text-foreground">{appointment.title}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-xs text-muted-foreground">
                                    {format(appointmentDate, 'MMM d, yyyy')} at {format(appointmentDate, 'HH:mm')}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">{appointment.description}</p>
                                {appointment.comments && (
                                  <p className="text-sm text-muted-foreground italic">"{appointment.comments}"</p>
                                )}
                              </div>
                              
                              
                              {appointment.files && appointment.files.length > 0 && (
                                <div className="mt-4 pt-3 border-t">
                                  <Label className="text-sm font-medium mb-2">Attachments</Label>
                                  <div className="flex flex-wrap gap-2">
                                    {appointment.files.map((file, index) => (
                                      <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded-lg border max-w-full">
                                        <span className="text-xs truncate flex-1 min-w-0">{file.name}</span>
                                        <Button
                                          type="button"
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => downloadFile(file)}
                                          className="h-6 w-6 p-0 flex-shrink-0"
                                          title="Download file"
                                        >
                                          <Download className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-muted-foreground" />
                                <span className="text-sm font-medium">${appointment.cost}</span>
                              </div>
                              <Badge variant={appointment.status === 'Completed' ? 'default' : appointment.status === 'Cancelled' ? 'destructive' : 'secondary'}>
                                {appointment.status}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            
      </DialogContent>
    </Dialog>
  );
};

export default PatientHistoryDialog; 