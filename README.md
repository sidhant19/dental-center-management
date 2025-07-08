# Dental Center Management System

## Overview

This project is a comprehensive Dental Center Management System designed to streamline patient, appointment, and clinical operations for both administrators and patients. The system features role-based access, a modern responsive UI, and modular architecture for maintainability and scalability.

[Live Demo Link](https://dental-center-management-git-main-sidhant19s-projects.vercel.app)

---

## Setup Instructions

### Prerequisites
- **Node.js** (v16.x or above)
- **npm** or **yarn**
- **Git**

### Cloning the Repository
Clone the repository and navigate to the project directory:

```bash
git clone https://github.com/sidhant19/dental-center-management
cd dental-center-management
```

### Installing Dependencies
Install the required dependencies:

```bash
npm install
# or
yarn install
```

### Running the Application
Start the development server:

```bash
npm start
# or
yarn start
```

**Testing Note:**
To test the application, you can view and modify the `AppData` key in your browser's local storage. Additionally, you can refer to the `MockData.json` file in the `src` directory to get initial user credentials for login.

---

## Architecture

### Full Application Flow

1. **Login**  
   - The application starts at the login page (`/login`). Users provide their credentials.
   - Authentication is handled via the `AuthContext`, which checks credentials and sets the user context.

2. **Role-Based Routing**  
   - After login, users are redirected based on their role:
     - **Admin**: Redirected to `/admin/dashboard`
     - **Patient**: Redirected to `/patient`
   - Routing and access control are enforced in `App.jsx` using React Router and context.

3. **Admin Flow**  
   - **AdminDashboard** (`/admin/dashboard`):  
     - Displays KPIs, revenue, patient stats, and quick actions.
     - Provides access to add patients and schedule appointments.
   - **Patients** (`/admin/patients`):  
     - List, search, add, edit, and view patient details.
   - **Appointments** (`/admin/appointments`):  
     - List, search, add, edit, and cancel appointments.
   - **Calendar** (`/admin/calendar`):  
     - Visual calendar for all appointments, with drag-and-drop and quick scheduling.

4. **Patient Flow**  
   - **PatientDashboard** (`/patient`):  
     - Displays personal info, upcoming appointments, appointment history, and downloadable attachments.

5. **Error Handling**  
   - Any undefined route renders the `NotFound` page.

6. **State Management**  
   - **DataContext**: Manages all patient, appointment, and user data, mimicking API operations.
   - **AuthContext**: Handles authentication state and user session.
   - **ThemeContext**: Manages light/dark theme.

---

## Technologies Used

- **React**: UI library for building the SPA.
- **React Router**: Client-side routing.
- **Context API**: Global state management.
- **shadcn/ui**: Modern, accessible UI components (in `src/components/ui`).
- **Tailwind CSS**: Utility-first CSS framework (inferred from class names).
- **Lucide-react**: Icon library.
- **Vite**: Build tool for fast development.

---

## File and Component Descriptions

### Root Files
- **App.jsx**: Main entry point. Sets up routing and wraps the app in all context providers.
- **main.jsx**: Bootstraps the React app and renders it to the DOM.
- **index.css**: Global styles, including Tailwind CSS setup.

### Contexts (`src/contexts/`)
- **AuthContext.jsx**: Manages authentication state and user session.
- **DataContext.jsx**: Centralized data management for patients, appointments, and users. Mimics API operations.
- **ThemeContext.jsx**: Manages light/dark theme and persists preference.

### Components
- **Header.jsx**: Top navigation bar, includes branding and logout.
- **login-form.jsx**: Login form UI and logic, interacts with AuthContext.

#### Admin Components (`src/components/admin/`)
- **AppointmentForm.jsx**: Form for adding/editing appointments.
- **PatientForm.jsx**: Form for adding/editing patients.
- **PatientHistoryDialog.jsx**: Dialog for viewing a patient's appointment history.
- **Sidebar.jsx**: Admin sidebar navigation.

#### Patient Components (`src/components/patient/`)
- **AppointmentGrid.jsx**: Displays a grid of patient appointments.
- **AttatchmentDialog.jsx**: Dialog for viewing/downloading appointment attachments.
- **PatientProfile.jsx**: Displays patient profile information.

#### UI Components (`src/components/ui/`)
- Contains shadcn/ui components (buttons, cards, dialogs, etc.).
  *No custom logic; these are reusable UI primitives.*

### Pages
- **Login.jsx**: Login page, renders the login form.
- **NotFound.jsx**: 404 error page for undefined routes.

#### Admin Pages (`src/pages/admin/`)
- **AdminDashboard.jsx**: Main admin dashboard with KPIs, stats, and quick actions.
- **Patients.jsx**: Patient management (list, search, add, edit, view).
- **Appointments.jsx**: Appointment management (list, search, add, edit, cancel).
- **Calendar.jsx**: Calendar view for all appointments, with drag-and-drop and quick scheduling.

#### Patient Pages (`src/pages/patient/`)
- **PatientDashboard.jsx**: Patient dashboard with personal info, upcoming appointments, history, and attachments.

---

## Technical Discussion

### API Simulation
- The application uses the React Context API (`DataContext`) to mimic backend API interactions.
- All CRUD operations for patients, appointments, and user authentication are handled in-memory and persisted to local state.
- The structure and methods in `DataContext` are designed to closely resemble typical RESTful API endpoints, facilitating future backend integration.

### Security Considerations
- **Authentication**: The login system is client-side only, with no real session or token management.
- **Data Storage**: All data is stored in local state, making it vulnerable to tampering and not suitable for production.
- **No JWT or Backend Validation**: There is no server-side validation or protection against unauthorized access.
- **Role Enforcement**: Role-based routing is enforced in the frontend, but can be bypassed by manipulating local state.

**Recommendation:** For production, implement a secure backend with JWT-based authentication, server-side validation, and proper session management.

### Future Scope
- **Backend Integration**: Replace Context API data management with real API calls to a secure backend.
- **Notifications**: Add user notifications for successful or failed actions (e.g., appointment booking, record updates).
- **Loading States**: Currently, loading states are not implemented, as data is fetched from local state. These should be added when integrating with asynchronous APIs.
- **Enhanced Security**: Add proper authentication, authorization, and data protection mechanisms.
- **Role Management**: Expand user roles and permissions for finer-grained access control.
- **Audit Logging**: Track changes and actions for compliance and traceability.

---
