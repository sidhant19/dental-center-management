import React, { useContext, useState, useEffect, useRef } from 'react';
import { DataContext } from '../../contexts/DataContext';
import Header from '../../components/Header';
import Sidebar from '../../components/admin/Sidebar';
import { AddAppointmentForm, EditAppointmentForm } from '../../components/admin/AppointmentForm';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback } from '../../components/ui/avatar';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  DollarSign,
  Eye,
  Plus
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths, startOfWeek, endOfWeek, eachHourOfInterval, parseISO, addDays, subDays, addYears, subYears } from 'date-fns';

const Calendar = () => {
  const { 
    getAllIncidents, 
    getPatientById, 
    addIncident, 
    updateIncident,
    cancelIncident,
    completeIncident
  } = useContext(DataContext);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month');   const [showAddAppointmentForm, setShowAddAppointmentForm] = useState(false);
  const [showEditAppointmentForm, setShowEditAppointmentForm] = useState(false);
  const [selectedAppointmentData, setSelectedAppointmentData] = useState(null);
  const [draggedAppointment, setDraggedAppointment] = useState(null);
  const [dragOverDate, setDragOverDate] = useState(null);
  const [quickScheduleData, setQuickScheduleData] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());   const [selectedDay, setSelectedDay] = useState(new Date());   const weeklyViewRef = useRef(null);

    const allAppointments = getAllIncidents();

    useEffect(() => {
    if (viewMode === 'week' && weeklyViewRef.current) {
            const scrollToY = 8 * 40;
      weeklyViewRef.current.scrollTo({
        top: scrollToY,
        behavior: 'smooth'
      });
    }
  }, [viewMode]);

    useEffect(() => {
    setSelectedDay(currentDate);
  }, [currentDate]);

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

    const handleQuickSchedule = (date, time = null) => {
    let appointmentDate = new Date(date);
    
    if (time) {
            appointmentDate.setHours(time.getHours(), time.getMinutes(), 0, 0);
    } else {
            appointmentDate.setHours(9, 0, 0, 0);
    }

    setQuickScheduleData({
      appointmentDate: appointmentDate.toISOString(),
      appointmentTime: format(appointmentDate, 'HH:mm')
    });
    setShowAddAppointmentForm(true);
  };

    const goToPrevious = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
            if (window.innerWidth < 640) {         setSelectedDay(subDays(selectedDay, 1));
      } else {
        setCurrentDate(subDays(currentDate, 7));
      }
    }
  };

  const goToNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
            if (window.innerWidth < 640) {         setSelectedDay(addDays(selectedDay, 1));
      } else {
        setCurrentDate(addDays(currentDate, 7));
      }
    }
  };

  const goToPreviousYear = () => {
    setCurrentDate(subYears(currentDate, 1));
  };

  const goToNextYear = () => {
    setCurrentDate(addYears(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

    const getAppointmentsForDate = (date) => {
    return allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return isSameDay(appointmentDate, date);
    }).sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
  };

    const getAppointmentsForHour = (date, hour) => {
    return allAppointments.filter(appointment => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return isSameDay(appointmentDate, date) && appointmentDate.getHours() === hour;
    });
  };

    const handleDragStart = (e, appointment) => {
    setDraggedAppointment(appointment);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, date, hour = null) => {
    e.preventDefault();
    setDragOverDate({ date, hour });
  };

  const handleDrop = (e, targetDate, targetHour = null) => {
    e.preventDefault();
    if (draggedAppointment && targetDate) {
            const newDateTime = new Date(targetDate);
      
      if (targetHour !== null) {
                newDateTime.setHours(targetHour, 0, 0, 0);
      } else {
                const originalTime = new Date(draggedAppointment.appointmentDate);
        newDateTime.setHours(
          originalTime.getHours(),
          originalTime.getMinutes(),
          0,
          0
        );
      }

      const updatedAppointment = {
        ...draggedAppointment,
        appointmentDate: newDateTime.toISOString()
      };

      updateIncident(draggedAppointment.id, updatedAppointment);
    }
    setDraggedAppointment(null);
    setDragOverDate(null);
  };

  const handleDragEnd = () => {
    setDraggedAppointment(null);
    setDragOverDate(null);
  };

    const renderAppointmentTile = (appointment, isDraggable = true, isCompact = false) => {
    const patient = getPatientById(appointment.patientId);
    const appointmentDate = new Date(appointment.appointmentDate);
    const timeString = format(appointmentDate, 'HH:mm');

    if (isCompact) {
      return (
        <div
          key={appointment.id}
          className={`p-1.5 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-sm ${
            isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
          } ${
            draggedAppointment?.id === appointment.id ? 'opacity-50' : ''
          }`}
          draggable={isDraggable}
          onDragStart={(e) => isDraggable && handleDragStart(e, appointment)}
          onClick={(e) => {
            e.stopPropagation();
            handleViewAppointment(appointment);
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1">
              <Clock className="h-2.5 w-2.5 text-muted-foreground" />
              <span className="text-xs font-medium">{timeString}</span>
            </div>
            <Badge variant="secondary" className="text-xs px-1 py-0">
              ${appointment.cost}
            </Badge>
          </div>
          <div className="text-xs font-medium truncate mb-1">
            {appointment.title}
          </div>
          <div className="text-xs text-muted-foreground truncate mb-1">
            {patient?.name || 'Unknown'}
          </div>
          <Badge 
            variant={appointment.status === 'Completed' ? 'default' : appointment.status === 'Cancelled' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {appointment.status}
          </Badge>
        </div>
      );
    }

    return (
      <div
        key={appointment.id}
        className={`p-2 sm:p-3 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md ${
          isDraggable ? 'cursor-grab active:cursor-grabbing' : ''
        } ${
          draggedAppointment?.id === appointment.id ? 'opacity-50' : ''
        }`}
        draggable={isDraggable}
        onDragStart={(e) => isDraggable && handleDragStart(e, appointment)}
        onClick={(e) => {
          e.stopPropagation();
          handleViewAppointment(appointment);
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">{timeString}</span>
        </div>
        <div className="font-medium text-sm truncate mb-1">
          {appointment.title}
        </div>
        <div className="text-xs text-muted-foreground truncate mb-2">
          {patient?.name || 'Unknown Patient'}
        </div>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            ${appointment.cost}
          </Badge>
          <Badge 
            variant={appointment.status === 'Completed' ? 'default' : appointment.status === 'Cancelled' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {appointment.status}
          </Badge>
        </div>
      </div>
    );
  };

    const renderMonthlyView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const days = eachDayOfInterval({ start: startDate, end: endDate });

        const renderMobileMonthView = () => (
      <div className="space-y-4">
        
        <div className="grid grid-cols-7 gap-1">
          
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <div key={`mobile-${day}-${index}`} className="p-2 text-center font-medium text-xs bg-muted">
              {day.charAt(0)}
            </div>
          ))}
          
          
          {days.map(day => {
            const appointments = getAppointmentsForDate(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isTodayDate = isToday(day);
            const isSelected = isSameDay(day, selectedDate);
            const scheduledAppointments = appointments.filter(a => a.status === 'Scheduled');

            return (
              <div
                key={day.toISOString()}
                className={`min-h-[50px] p-2 border relative cursor-pointer ${
                  isCurrentMonth ? 'bg-background' : 'bg-muted/50'
                } ${
                  isTodayDate ? 'ring-2 ring-primary' : ''
                } ${
                  isSelected ? 'bg-primary text-primary-foreground' : ''
                }`}
                onClick={() => setSelectedDate(day)}
              >
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-medium ${
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                  } ${isSelected ? 'text-primary-foreground' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  {scheduledAppointments.length > 0 && (
                    <Badge variant="secondary" className="text-xs px-1 py-0 bg-secondary text-secondary-foreground">
                      {scheduledAppointments.length}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </h3>
            <Button 
              size="sm" 
              onClick={() => handleQuickSchedule(selectedDate)}
              className="flex items-center gap-1"
            >
              <Plus className="h-3 w-3" />
              Schedule
            </Button>
          </div>
          
          <div className="space-y-2">
            {getAppointmentsForDate(selectedDate).map(appointment => 
              renderAppointmentTile(appointment, false, false)
            )}
            {getAppointmentsForDate(selectedDate).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No appointments scheduled for this date</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );

        const renderDesktopMonthView = () => (
      <div className="grid grid-cols-7 gap-1">
        
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-medium text-sm bg-muted">
            {day}
          </div>
        ))}
        
        
        {days.map(day => {
          const appointments = getAppointmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isDragOver = dragOverDate && isSameDay(day, dragOverDate.date);

          return (
            <div
              key={day.toISOString()}
              className={`min-h-[120px] p-1 border relative z-0 group ${
                isCurrentMonth ? 'bg-background' : 'bg-muted/50'
              } ${
                isTodayDate ? 'ring-2 ring-primary' : ''
              } ${
                isDragOver ? 'bg-primary/10 ring-2 ring-primary' : ''
              }`}
              onDragOver={(e) => handleDragOver(e, day)}
              onDrop={(e) => handleDrop(e, day)}
              onClick={(e) => {
                                if (e.target === e.currentTarget) {
                  handleQuickSchedule(day);
                }
              }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className={`text-sm font-medium ${
                  isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                }`}>
                  {format(day, 'd')}
                </div>
                {appointments.length > 0 && (
                  <Badge variant="secondary" className="text-xs px-1 py-0">
                    {appointments.length}
                  </Badge>
                )}
              </div>
              <div className="space-y-1">
                {appointments.slice(0, 3).map(appointment => 
                  renderAppointmentTile(appointment, true, true)
                )}
                {appointments.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center py-1">
                    +{appointments.length - 3} more
                  </div>
                )}
                
                <div 
                  className="h-6 border-2 border-dashed border-muted-foreground/20 rounded cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickSchedule(day);
                  }}
                  title="Click to schedule new appointment"
                >
                  <div className="flex items-center justify-center h-full">
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );

    return (
      <>
        <div className="block sm:hidden">
          {renderMobileMonthView()}
        </div>
        <div className="hidden sm:block">
          {renderDesktopMonthView()}
        </div>
      </>
    );
  };

    const renderWeeklyView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
    const hours = eachHourOfInterval({ 
      start: new Date(weekStart.setHours(0)), 
      end: new Date(weekStart.setHours(23)) 
    });

        const renderMobileWeeklyView = () => {
      return (
        <div className="space-y-4">
          
          <div className="space-y-2">
            {hours.map(hour => {
              const appointments = getAppointmentsForHour(selectedDay, hour.getHours());
              const isTodayDate = isToday(selectedDay);
              const isDragOver = dragOverDate && isSameDay(selectedDay, dragOverDate.date) && hour.getHours() === dragOverDate.hour;

              return (
                <div
                  key={hour.toISOString()}
                  className={`border rounded-lg p-3 ${
                    isTodayDate ? 'bg-primary/5' : ''
                  } ${
                    isDragOver ? 'bg-primary/10 ring-2 ring-primary' : ''
                  }`}
                  onDragOver={(e) => handleDragOver(e, selectedDay, hour.getHours())}
                  onDrop={(e) => handleDrop(e, selectedDay, hour.getHours())}
                  onClick={(e) => {
                    if (e.target === e.currentTarget) {
                      handleQuickSchedule(selectedDay, hour);
                    }
                  }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium">
                      {format(hour, 'HH:mm')}
                    </div>
                    {appointments.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {appointments.map(appointment => 
                      renderAppointmentTile(appointment, true, false)
                    )}
                    
                    <div 
                      className="h-8 border border-dashed border-muted-foreground/20 rounded cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleQuickSchedule(selectedDay, hour);
                      }}
                      title="Click to schedule new appointment"
                    >
                      <div className="flex items-center justify-center h-full">
                        <Plus className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

        const renderDesktopWeeklyView = () => (
      <div className="overflow-x-auto">
        <div className="grid grid-cols-8 gap-1 min-w-[800px]" ref={weeklyViewRef}>
          
          <div className="p-2 text-center font-medium text-sm bg-muted">
            Time
          </div>
          
          
          {days.map(day => (
            <div key={day.toISOString()} className="p-2 text-center font-medium text-sm bg-muted">
              <div>{format(day, 'EEE')}</div>
              <div className="text-xs text-muted-foreground">
                {format(day, 'MMM d')}
              </div>
            </div>
          ))}
          
          
          {hours.map(hour => (
            <React.Fragment key={hour.toISOString()}>
              <div className="p-2 text-xs text-muted-foreground border-r">
                {format(hour, 'HH:mm')}
              </div>
              
              {days.map(day => {
                const appointments = getAppointmentsForHour(day, hour.getHours());
                const isTodayDate = isToday(day);
                const isDragOver = dragOverDate && isSameDay(day, dragOverDate.date) && hour.getHours() === dragOverDate.hour;

                return (
                  <div
                    key={`${day.toISOString()}-${hour.getHours()}`}
                    className={`min-h-[40px] p-1 border relative z-0 group ${
                      isTodayDate ? 'bg-primary/5' : ''
                    } ${
                      isDragOver ? 'bg-primary/10 ring-2 ring-primary' : ''
                    }`}
                    onDragOver={(e) => handleDragOver(e, day, hour.getHours())}
                    onDrop={(e) => handleDrop(e, day, hour.getHours())}
                    onClick={(e) => {
                                            if (e.target === e.currentTarget) {
                        handleQuickSchedule(day, hour);
                      }
                    }}
                  >
                    <div className="space-y-1 max-h-full overflow-y-auto">
                      {appointments.map(appointment => 
                        renderAppointmentTile(appointment, true, true)
                      )}
                      
                      <div 
                        className="h-4 border border-dashed border-muted-foreground/20 rounded cursor-pointer hover:border-muted-foreground/40 hover:bg-muted/20 transition-all duration-200 opacity-0 group-hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickSchedule(day, hour);
                        }}
                        title="Click to schedule new appointment"
                      >
                        <div className="flex items-center justify-center h-full">
                          <Plus className="h-2 w-2 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    );

    return (
      <>
        <div className="block sm:hidden">
          {renderMobileWeeklyView()}
        </div>
        <div className="hidden sm:block">
          {renderDesktopWeeklyView()}
        </div>
      </>
    );
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
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Calendar</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Manage appointments and schedules.</p>
            </div>
            
            <Button onClick={() => setShowAddAppointmentForm(true)} className="flex items-center gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Schedule Appointment</span>
              <span className="sm:hidden">Schedule</span>
            </Button>
          </div>

          
          <Card>
            <CardContent className="pt-4 sm:pt-6">
              <div className="flex flex-col gap-4">
                
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToPrevious}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={goToNext}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    
                    
                    <div className="flex items-center gap-1 ml-2">
                      <Button variant="outline" size="sm" onClick={goToPreviousYear}>
                        <ChevronLeft className="h-3 w-3" />
                      </Button>
                      <div className="text-xs font-medium px-1">
                        {format(currentDate, 'yyyy')}
                      </div>
                      <Button variant="outline" size="sm" onClick={goToNextYear}>
                        <ChevronRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  
                  <div className="text-center flex-1">
                    <h2 className="text-lg sm:text-xl font-semibold">
                      {viewMode === 'month' ? format(currentDate, 'MMMM yyyy') :
                        (window.innerWidth < 640 ? format(selectedDay, 'EEEE, MMMM d, yyyy') : `${format(startOfWeek(currentDate), 'MMM d')} - ${format(endOfWeek(currentDate), 'MMM d, yyyy')}`)
                      }
                    </h2>
                  </div>

                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant={viewMode === 'month' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('month')}
                    >
                      Month
                    </Button>
                    <Button
                      variant={viewMode === 'week' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('week')}
                    >
                      <span className="hidden sm:inline">Week</span>
                      <span className="sm:hidden">Day</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          
          <Card>
            <CardContent className="p-0">
              <div className="p-2 sm:p-4">
                {viewMode === 'month' ? renderMonthlyView() : renderWeeklyView()}
              </div>
            </CardContent>
          </Card>

          
          
        </div>
      </Sidebar>

      
      <AddAppointmentForm
        open={showAddAppointmentForm}
        setOpen={setShowAddAppointmentForm}
        onSubmit={handleAddAppointment}
        onSuccess={handleSuccess}
        initialData={quickScheduleData}
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

export default Calendar; 