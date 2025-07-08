import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

function PatientProfile({ patient }) {
  const fadeInClass = 'animate-fade-in';

  return (
    <section className={`mb-12 ${fadeInClass}`} style={{animationDelay: '0.2s'}}>
      
      <Card className="hidden sm:block border-0 shadow-sm bg-background">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            
            <div className="flex-shrink-0">
              <Avatar className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 shadow-md border-2 border-border bg-background">
                <AvatarFallback className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                  {patient.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            
            <div className="flex-1 min-w-0">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-foreground mb-3">
                {patient.name}
              </h2>
              
              <div className="space-y-2 text-sm sm:text-base text-muted-foreground">
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                  <span>Patient ID: <span className="font-medium text-foreground">{patient.id}</span></span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-6">
                  <div>Date of Birth: <span className="font-medium text-foreground">{patient.dob}</span></div>
                  <div>Contact: <span className="font-medium text-foreground">{patient.contact}</span></div>
                  <div className="sm:col-span-2 lg:col-span-1">Health Info: <span className="font-medium text-foreground">{patient.healthInfo}</span></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      
      <div className="block sm:hidden space-y-4">
        
        <div className="flex items-center gap-4 p-4 bg-background rounded-xl border shadow-sm">
          <Avatar className="w-16 h-16 shadow-md border-2 border-border bg-background">
            <AvatarFallback className="text-xl font-semibold">
              {patient.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold text-foreground mb-1 truncate">
              {patient.name}
            </h2>
            <p className="text-sm text-muted-foreground">
              ID: <span className="font-medium text-foreground">{patient.id}</span>
            </p>
          </div>
        </div>

        
        <div className="grid grid-cols-1 gap-3">
          <div className="p-3 bg-background rounded-lg border">
            <div className="text-xs text-muted-foreground mb-1">Date of Birth</div>
            <div className="text-sm font-medium">{patient.dob}</div>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <div className="text-xs text-muted-foreground mb-1">Contact</div>
            <div className="text-sm font-medium">{patient.contact}</div>
          </div>
          <div className="p-3 bg-background rounded-lg border">
            <div className="text-xs text-muted-foreground mb-1">Health Info</div>
            <div className="text-sm font-medium">{patient.healthInfo}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PatientProfile;