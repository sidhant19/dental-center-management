import MockData from '../MockData.json';
import { createContext, useState, useEffect } from 'react';

export const DataContext = createContext();

export const DataProvider = ({ children }) => {
    const [data, setData] = useState(JSON.parse(localStorage.getItem('AppData')) || MockData);

    useEffect(()=>{
        localStorage.setItem('AppData', JSON.stringify(data));
    }, [data]);

    
    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    
    const isEmailDuplicate = (email, excludeUserId = null) => {
        if (!data?.users) return false;
        return data.users.some(user => 
            user.email === email && (!excludeUserId || user.id !== excludeUserId)
        );
    };

    
    const validatePatientData = (patientData) => {
        const errors = [];
        
        const nameError = validateRequiredField(patientData.name, 'Name');
        if (nameError) errors.push(nameError);
        else if (patientData.name.trim().length < 2) {
            errors.push('Name must be at least 2 characters long');
        }
        
        const contactError = validateRequiredField(patientData.contact, 'Contact number');
        if (contactError) errors.push(contactError);
        else if (patientData.contact.trim().length < 10) {
            errors.push('Contact number must be at least 10 digits');
        }
        
        const emailError = validateRequiredField(patientData.email, 'Email');
        if (emailError) errors.push(emailError);
        else if (!isValidEmail(patientData.email)) {
            errors.push('Please enter a valid email address');
        }
        
        const dobError = validateRequiredField(patientData.dob, 'Date of birth');
        if (dobError) errors.push(dobError);
        else if (!isValidDate(patientData.dob)) {
            errors.push('Please enter a valid date of birth');
        }
        
        return errors;
    };

    
    const validateIncidentData = (incidentData) => {
        const errors = [];
        
        const patientError = validateRequiredField(incidentData.patientId, 'Patient');
        if (patientError) errors.push(patientError);
        
        const titleError = validateRequiredField(incidentData.title, 'Title');
        if (titleError) errors.push(titleError);
        else if (incidentData.title.trim().length < 3) {
            errors.push('Title must be at least 3 characters long');
        }
        
        const dateError = validateRequiredField(incidentData.appointmentDate, 'Appointment date');
        if (dateError) errors.push(dateError);
        else if (!isValidDate(incidentData.appointmentDate)) {
            errors.push('Please enter a valid appointment date');
        }
        
        if (!isValidCost(incidentData.cost)) {
            errors.push('Cost must be a valid positive number');
        }
        
        return errors;
    };

    const login = (email, password) => {
        if (!email || !password) {
            return { success: false, message: 'Email and password are required' };
        }

        if (!data?.users) {
            return { success: false, message: 'No users found' };
        }

        const user = data.users.find(user => user.email === email && user.password === password);
        if (user) {            
            return { success: true, user: { id: user.id, role: user.role, email: user.email, patientId: user.patientId? user.patientId : null } };
        } else {
            return { success: false, message: 'Invalid email or password' };
        }
    }

    const getPatientById = (patientId) => {
        if (!patientId) return null;
        if (!data?.patients || !data?.users) return null;
    
        const patient = data.patients.find(p => p.id === patientId);
        if (!patient) return null;
    
        const user = data.users.find(
            u => u.role === 'Patient' && u.patientId === patientId
        );
    
        return {
            ...patient,
            email: user?.email || ''
        };
    };
    

    const getIncidentsByPatientId = (patientId) => {
        if (!patientId) return [];
        return data?.incidents?.filter((i) => i.patientId === patientId) || [];
    };

    const getUpcomingAppointments = (patientId) => {
        if (!patientId) return [];
        const now = new Date();
        return getIncidentsByPatientId(patientId).filter((i) => new Date(i.appointmentDate) > now);
    };

    const getHistoricalAppointments = (patientId) => {
        if (!patientId) return [];
        const now = new Date();
        return getIncidentsByPatientId(patientId).filter((i) => new Date(i.appointmentDate) <= now);
    };

    const getTreatmentsByPatientId = (patientId) => {
        return getIncidentsByPatientId(patientId);
    };

    const getFileAttachments = (patientId) => {
        const incidents = getIncidentsByPatientId(patientId);
        return incidents.flatMap((i) => i.files || []);
    };

    const addPatient = (patientData) => {
        try {
            
            const validationErrors = validatePatientData(patientData);
            if (validationErrors.length > 0) {
                return { 
                    success: false, 
                    errors: validationErrors,
                    message: 'Validation failed'
                };
            }

            
            if (isEmailDuplicate(patientData.email)) {
                return { 
                    success: false, 
                    message: 'A user with this email already exists',
                    errors: ['Email already exists']
                };
            }

            
            if (data?.patients?.some(p => p.contact === patientData.contact)) {
                return { 
                    success: false, 
                    message: 'A patient with this contact number already exists',
                    errors: ['Contact number already exists']
                };
            }

            const newPatient = {
                id: `p${Date.now()}`,
                name: patientData.name.trim(),
                dob: patientData.dob,
                contact: patientData.contact.trim(),
                healthInfo: patientData.healthInfo?.trim() || ''
            };

            const password = Math.random().toString(36).slice(-8);
        
            const newUser = {
                id: `${Date.now()}`,
                role: "Patient",
                email: patientData.email.trim().toLowerCase(),
                password: password,
                patientId: newPatient.id
            };

            setData(prevData => {
                if (!prevData) return prevData;
                return {
                    ...prevData,
                    patients: [...prevData.patients, newPatient],
                    users: [...prevData.users, newUser]
                };
            });

            return { 
                success: true, 
                patient: newPatient, 
                password,
                message: 'Patient added successfully'
            };
        } catch (error) {
            console.error('Error adding patient:', error);
            return { 
                success: false, 
                message: 'Failed to add patient',
                error: error.message
            };
        }
    };

    const updatePatient = (patientId, patientData) => {
        try {
            if (!patientId) {
                return { 
                    success: false, 
                    message: 'Patient ID is required',
                    errors: ['Patient ID is required']
                };
            }

            
            const validationErrors = validatePatientData(patientData);
            if (validationErrors.length > 0) {
                return { 
                    success: false, 
                    errors: validationErrors,
                    message: 'Validation failed'
                };
            }

            
            const existingPatient = data?.patients?.find(p => p.id === patientId);
            if (!existingPatient) {
                return { 
                    success: false, 
                    message: 'Patient not found',
                    errors: ['Patient not found']
                };
            }

            
            const currentUser = data?.users?.find(u => u.role === 'Patient' && u.patientId === patientId);
            if (isEmailDuplicate(patientData.email, currentUser?.id)) {
                return { 
                    success: false, 
                    message: 'A user with this email already exists',
                    errors: ['Email already exists']
                };
            }

            
            const contactExists = data?.patients?.some(p => 
                p.contact === patientData.contact && p.id !== patientId
            );
            if (contactExists) {
                return { 
                    success: false, 
                    message: 'A patient with this contact number already exists',
                    errors: ['Contact number already exists']
                };
            }

            setData(prevData => {
                if (!prevData) return prevData;
    
                const patientIndex = prevData.patients.findIndex(p => p.id === patientId);
                if (patientIndex === -1) return prevData;
    
                const updatedPatients = [...prevData.patients];
                updatedPatients[patientIndex] = {
                    ...updatedPatients[patientIndex],
                    name: patientData.name.trim(),
                    dob: patientData.dob,
                    contact: patientData.contact.trim(),
                    healthInfo: patientData.healthInfo?.trim() || ''
                };
    
                const updatedUsers = prevData.users.map(user => {
                    if (user.role === 'Patient' && user.patientId === patientId) {
                        return {
                            ...user,
                            email: patientData.email.trim().toLowerCase()
                        };
                    }
                    return user;
                });
    
                return {
                    ...prevData,
                    patients: updatedPatients,
                    users: updatedUsers
                };
            });
    
            return {
                success: true,
                id: patientId,
                name: patientData.name.trim(),
                dob: patientData.dob,
                contact: patientData.contact.trim(),
                email: patientData.email.trim().toLowerCase(),
                healthInfo: patientData.healthInfo?.trim() || '',
                message: 'Patient updated successfully'
            };
        } catch (error) {
            console.error('Error updating patient:', error);
            return { 
                success: false, 
                message: 'Failed to update patient',
                error: error.message
            };
        }
    };
    

    const searchPatients = (searchTerm) => {
        if (!searchTerm || searchTerm.trim().length === 0) return [];
        if (!data?.patients || !data?.users) return [];
    
        const lowerTerm = searchTerm.toLowerCase().trim();
    
        return data.patients
            .map(patient => {
                const matchingUser = data.users.find(
                    user => user.role === 'Patient' && user.patientId === patient.id
                );
    
                const email = matchingUser?.email || '';
    
                const matches = 
                    patient.name.toLowerCase().includes(lowerTerm) ||
                    patient.contact.includes(searchTerm) ||
                    email.toLowerCase().includes(lowerTerm);
    
                if (matches) {
                    return {
                        ...patient,
                        email
                    };
                }
    
                return null;
            })
            .filter(Boolean);
    };
    

    const addIncident = (incidentData) => {
        try {
            
            const validationErrors = validateIncidentData(incidentData);
            if (validationErrors.length > 0) {
                return { 
                    success: false, 
                    errors: validationErrors,
                    message: 'Validation failed'
                };
            }

            
            const patient = data?.patients?.find(p => p.id === incidentData.patientId);
            if (!patient) {
                return { 
                    success: false, 
                    message: 'Patient not found',
                    errors: ['Patient not found']
                };
            }

            
            if (checkAppointmentConflict(incidentData.patientId, incidentData.appointmentDate)) {
                return { 
                    success: false, 
                    message: 'Patient has another appointment at this time',
                    errors: ['Appointment time conflict']
                };
            }

            const newIncident = {
                id: `i${Date.now()}`,
                patientId: incidentData.patientId,
                title: incidentData.title.trim(),
                description: incidentData.description?.trim() || '',
                comments: incidentData.comments?.trim() || "",
                appointmentDate: incidentData.appointmentDate,
                cost: parseFloat(incidentData.cost) || 0,
                status: "Scheduled",
                files: incidentData.files || []
            };

            setData(prevData => {
                if (!prevData) return prevData;
                return {
                    ...prevData,
                    incidents: [...prevData.incidents, newIncident]
                };
            });

            return { 
                success: true, 
                incident: newIncident,
                message: 'Appointment scheduled successfully'
            };
        } catch (error) {
            console.error('Error adding incident:', error);
            return { 
                success: false, 
                message: 'Failed to schedule appointment',
                error: error.message
            };
        }
    };

    const updateIncident = (incidentId, incidentData) => {
        try {
            if (!incidentId) {
                return { 
                    success: false, 
                    message: 'Incident ID is required',
                    errors: ['Incident ID is required']
                };
            }

            
            const validationErrors = validateIncidentData(incidentData);
            if (validationErrors.length > 0) {
                return { 
                    success: false, 
                    errors: validationErrors,
                    message: 'Validation failed'
                };
            }

            
            const existingIncident = data?.incidents?.find(i => i.id === incidentId);
            if (!existingIncident) {
                return { 
                    success: false, 
                    message: 'Appointment not found',
                    errors: ['Appointment not found']
                };
            }

            
            const patient = data?.patients?.find(p => p.id === incidentData.patientId);
            if (!patient) {
                return { 
                    success: false, 
                    message: 'Patient not found',
                    errors: ['Patient not found']
                };
            }

            
            if (checkAppointmentConflict(incidentData.patientId, incidentData.appointmentDate, incidentId)) {
                return { 
                    success: false, 
                    message: 'Patient has another appointment at this time',
                    errors: ['Appointment time conflict']
                };
            }

            setData(prevData => {
                if (!prevData) return prevData;
                
                const incidentIndex = prevData.incidents.findIndex(i => i.id === incidentId);
                if (incidentIndex === -1) return prevData;

                const updatedIncidents = [...prevData.incidents];
                updatedIncidents[incidentIndex] = {
                    ...updatedIncidents[incidentIndex],
                    title: incidentData.title.trim(),
                    description: incidentData.description?.trim() || '',
                    comments: incidentData.comments?.trim() || "",
                    appointmentDate: incidentData.appointmentDate,
                    cost: parseFloat(incidentData.cost) || 0,
                    files: incidentData.files || []
                };

                return {
                    ...prevData,
                    incidents: updatedIncidents
                };
            });

            return {
                success: true,
                id: incidentId,
                patientId: incidentData.patientId,
                title: incidentData.title.trim(),
                description: incidentData.description?.trim() || '',
                comments: incidentData.comments?.trim() || "",
                appointmentDate: incidentData.appointmentDate,
                cost: parseFloat(incidentData.cost) || 0,
                files: incidentData.files || [],
                message: 'Appointment updated successfully'
            };
        } catch (error) {
            console.error('Error updating incident:', error);
            return { 
                success: false, 
                message: 'Failed to update appointment',
                error: error.message
            };
        }
    };

    const cancelIncident = (incidentId) => {
        try {
            if (!incidentId) {
                return { 
                    success: false, 
                    message: 'Incident ID is required',
                    errors: ['Incident ID is required']
                };
            }

            
            const existingIncident = data?.incidents?.find(i => i.id === incidentId);
            if (!existingIncident) {
                return { 
                    success: false, 
                    message: 'Appointment not found',
                    errors: ['Appointment not found']
                };
            }

            
            if (existingIncident.status === 'Cancelled') {
                return { 
                    success: false, 
                    message: 'Appointment is already cancelled',
                    errors: ['Appointment already cancelled']
                };
            }

            setData(prevData => {
                if (!prevData) return prevData;
                
                const incidentIndex = prevData.incidents.findIndex(i => i.id === incidentId);
                if (incidentIndex === -1) return prevData;

                const updatedIncidents = [...prevData.incidents];
                updatedIncidents[incidentIndex] = {
                    ...updatedIncidents[incidentIndex],
                    status: "Cancelled"
                };

                return {
                    ...prevData,
                    incidents: updatedIncidents
                };
            });

            return { 
                success: true,
                incident: { ...existingIncident, status: "Cancelled" },
                message: 'Appointment cancelled successfully'
            };
        } catch (error) {
            console.error('Error cancelling incident:', error);
            return { 
                success: false, 
                message: 'Failed to cancel appointment',
                error: error.message
            };
        }
    };

    const completeIncident = (incidentId) => {
        try {
            if (!incidentId) {
                return { 
                    success: false, 
                    message: 'Incident ID is required',
                    errors: ['Incident ID is required']
                };
            }

            
            const existingIncident = data?.incidents?.find(i => i.id === incidentId);
            if (!existingIncident) {
                return { 
                    success: false, 
                    message: 'Appointment not found',
                    errors: ['Appointment not found']
                };
            }

            
            if (existingIncident.status === 'Completed') {
                return { 
                    success: false, 
                    message: 'Appointment is already completed',
                    errors: ['Appointment already completed']
                };
            }

            
            if (existingIncident.status === 'Cancelled') {
                return { 
                    success: false, 
                    message: 'Cannot complete a cancelled appointment',
                    errors: ['Cannot complete cancelled appointment']
                };
            }

            setData(prevData => {
                if (!prevData) return prevData;
                
                const incidentIndex = prevData.incidents.findIndex(i => i.id === incidentId);
                if (incidentIndex === -1) return prevData;

                const updatedIncidents = [...prevData.incidents];
                updatedIncidents[incidentIndex] = {
                    ...updatedIncidents[incidentIndex],
                    status: "Completed"
                };

                return {
                    ...prevData,
                    incidents: updatedIncidents
                };
            });

            return { 
                success: true,
                incident: { ...existingIncident, status: "Completed" },
                message: 'Appointment completed successfully'
            };
        } catch (error) {
            console.error('Error completing incident:', error);
            return { 
                success: false, 
                message: 'Failed to complete appointment',
                error: error.message
            };
        }
    };

    const getIncidentById = (incidentId) => {
        if (!incidentId) return null;
        return data?.incidents?.find(i => i.id === incidentId) || null;
    };

        const getTotalRevenue = () => {
        if (!data?.incidents) return 0;
        return data.incidents
            .filter(incident => incident.status === 'Completed')
            .reduce((sum, incident) => sum + (incident.cost || 0), 0);
    };

    const getMonthlyRevenue = () => {
        if (!data?.incidents) return 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        return data.incidents
            .filter(incident => {
                const incidentDate = new Date(incident.appointmentDate);
                return incident.status === 'Completed' && 
                       incidentDate.getMonth() === currentMonth && 
                       incidentDate.getFullYear() === currentYear;
            })
            .reduce((sum, incident) => sum + (incident.cost || 0), 0);
    };

    const getRevenueChange = () => {
        if (!data?.incidents) return 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const currentMonthRevenue = data.incidents
            .filter(incident => {
                const incidentDate = new Date(incident.appointmentDate);
                return incident.status === 'Completed' && 
                       incidentDate.getMonth() === currentMonth && 
                       incidentDate.getFullYear() === currentYear;
            })
            .reduce((sum, incident) => sum + (incident.cost || 0), 0);
        
        const lastMonthRevenue = data.incidents
            .filter(incident => {
                const incidentDate = new Date(incident.appointmentDate);
                return incident.status === 'Completed' && 
                       incidentDate.getMonth() === lastMonth && 
                       incidentDate.getFullYear() === lastMonthYear;
            })
            .reduce((sum, incident) => sum + (incident.cost || 0), 0);
        
        if (lastMonthRevenue === 0) return currentMonthRevenue > 0 ? 100 : 0;
        return ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;
    };

    const getTotalPatients = () => {
        return data?.patients?.length || 0;
    };

    const getMonthlyNewPatients = () => {
        if (!data?.incidents) return 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        const patientFirstAppointments = {};
        
                data.incidents.forEach(incident => {
            if (!patientFirstAppointments[incident.patientId] || 
                new Date(incident.appointmentDate) < new Date(patientFirstAppointments[incident.patientId])) {
                patientFirstAppointments[incident.patientId] = incident.appointmentDate;
            }
        });
        
                return Object.values(patientFirstAppointments).filter(appointmentDate => {
            const date = new Date(appointmentDate);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
    };

    const getPatientChange = () => {
        if (!data?.incidents) return 0;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        
        const patientFirstAppointments = {};
        
                data.incidents.forEach(incident => {
            if (!patientFirstAppointments[incident.patientId] || 
                new Date(incident.appointmentDate) < new Date(patientFirstAppointments[incident.patientId])) {
                patientFirstAppointments[incident.patientId] = incident.appointmentDate;
            }
        });
        
        const currentMonthPatients = Object.values(patientFirstAppointments).filter(appointmentDate => {
            const date = new Date(appointmentDate);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).length;
        
        const lastMonthPatients = Object.values(patientFirstAppointments).filter(appointmentDate => {
            const date = new Date(appointmentDate);
            return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        }).length;
        
        if (lastMonthPatients === 0) return currentMonthPatients > 0 ? 100 : 0;
        return ((currentMonthPatients - lastMonthPatients) / lastMonthPatients) * 100;
    };

    const getPendingAppointments = () => {
        if (!data?.incidents) return 0;
        return data.incidents.filter(incident => incident.status === 'Scheduled').length;
    };

    const getCompletedAppointments = () => {
        if (!data?.incidents) return 0;
        return data.incidents.filter(incident => incident.status === 'Completed').length;
    };

    const getUpcomingAppointmentsPaginated = (page = 1, limit = 5) => {
        if (!data?.incidents) return { appointments: [], total: 0 };
        
        const now = new Date();
        const upcoming = data.incidents
            .filter(incident => new Date(incident.appointmentDate) > now && incident.status === 'Scheduled')
            .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            appointments: upcoming.slice(startIndex, endIndex),
            total: upcoming.length
        };
    };

    const getTopPayingPatients = (page = 1, limit = 3) => {
        if (!data?.incidents || !data?.patients) return { patients: [], total: 0 };
        
        const patientRevenue = {};
        
                data.incidents
            .filter(incident => incident.status === 'Completed')
            .forEach(incident => {
                if (!patientRevenue[incident.patientId]) {
                    patientRevenue[incident.patientId] = 0;
                }
                patientRevenue[incident.patientId] += incident.cost || 0;
            });
        
                const patientsWithRevenue = Object.entries(patientRevenue).map(([patientId, revenue]) => {
            const patient = data.patients.find(p => p.id === patientId);
            return {
                ...patient,
                totalRevenue: revenue
            };
        }).sort((a, b) => b.totalRevenue - a.totalRevenue);
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            patients: patientsWithRevenue.slice(startIndex, endIndex),
            total: patientsWithRevenue.length
        };
    };

    const getMostVisitedPatients = (page = 1, limit = 3) => {
        if (!data?.incidents || !data?.patients) return { patients: [], total: 0 };
        
        const patientVisitCounts = {};
        
                data.incidents
            .filter(incident => incident.status !== 'Cancelled')
            .forEach(incident => {
                if (!patientVisitCounts[incident.patientId]) {
                    patientVisitCounts[incident.patientId] = 0;
                }
                patientVisitCounts[incident.patientId]++;
            });
        
                const patientsWithVisits = Object.entries(patientVisitCounts).map(([patientId, visits]) => {
            const patient = data.patients.find(p => p.id === patientId);
            return {
                ...patient,
                totalVisits: visits
            };
        }).sort((a, b) => b.totalVisits - a.totalVisits);
        
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        
        return {
            patients: patientsWithVisits.slice(startIndex, endIndex),
            total: patientsWithVisits.length
        };
    };

        const getAllPatients = () => {
        return data?.patients || [];
    };

    const getAllIncidents = () => {
        return data?.incidents || [];
    };

        const getPatientEmail = (patientId) => {
        if (!data?.users) return null;
        const user = data.users.find(u => u.patientId === patientId);
        return user?.email || null;
    };

    
    const checkAppointmentConflict = (patientId, appointmentDate, excludeIncidentId = null) => {
        if (!data?.incidents) return false;
        
        const appointmentTime = new Date(appointmentDate);
        return data.incidents.some(incident => 
            incident.id !== excludeIncidentId &&
            incident.patientId === patientId &&
            incident.status !== 'Cancelled' &&
            Math.abs(new Date(incident.appointmentDate).getTime() - appointmentTime.getTime()) < 30 * 60 * 1000 
        );
    };

    
    const validateRequiredField = (value, fieldName) => {
        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
            return `${fieldName} is required`;
        }
        return null;
    };

    
    const sanitizeString = (str) => {
        if (typeof str !== 'string') return '';
        return str.trim();
    };

    
    const isValidDate = (dateString) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    };

    
    const isValidCost = (cost) => {
        const numCost = parseFloat(cost);
        return !isNaN(numCost) && numCost >= 0;
    };

    return (
        <DataContext.Provider value={{
            data,
            login,
            getPatientById,
            getIncidentsByPatientId,
            getUpcomingAppointments,
            getHistoricalAppointments,
            getTreatmentsByPatientId,
            getFileAttachments,
            addPatient,
            updatePatient,
            searchPatients,
            addIncident,
            updateIncident,
            cancelIncident,
            completeIncident,
            getIncidentById,
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
            getAllPatients,
            getAllIncidents,
            getPatientEmail,
            checkAppointmentConflict,
            validateRequiredField,
            sanitizeString,
            isValidDate,
            isValidCost
        }}>
            {children}
        </DataContext.Provider>
    );
};