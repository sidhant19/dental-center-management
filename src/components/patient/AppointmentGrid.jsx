import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString();
}

function formatCost(cost) {
  return `$${cost}`;
}

function AppointmentGrid({ appointments, onViewAttachments, emptyMessage }) {
  if (appointments.length === 0) {
    return (
      <Card className="col-span-full">
        <CardContent className="text-center py-12 text-muted-foreground">
          {emptyMessage}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {appointments.map((appointment) => (
        <Card key={appointment.id} className="shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-3">
              <CardTitle className="text-lg font-semibold leading-tight flex-1">
                {appointment.title}
              </CardTitle>
              <Badge 
                variant={appointment.status === 'Completed' ? 'default' : 'secondary'} 
                className="flex-shrink-0"
              >
                {appointment.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-4">
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
                <span className="font-medium">{formatCost(appointment.cost)}</span>
              </div>
            </div>
            
            <div className="pt-2">
              {appointment.files && appointment.files.length > 0 ? (
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onViewAttachments(appointment.files)}
                >
                  View Attachments ({appointment.files.length})
                </Button>
              ) : (
                <div className="text-center py-2 text-muted-foreground text-xs">
                  No attachments
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default AppointmentGrid;