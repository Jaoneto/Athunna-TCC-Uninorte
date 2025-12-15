
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleGuard from "@/components/RoleGuard";
import Index from "./pages/Index";
import Institutions from "./pages/Institutions";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import NewEvent from "./pages/NewEvent";
import PastEvents from "./pages/PastEvents";
import NotFound from "./pages/NotFound";
import Participants from "./pages/Participants";
import ParticipantsList from "./pages/ParticipantsList";
import SystemUsers from "./pages/SystemUsers";
import Workshops from "./pages/Workshops";
import Activities from "./pages/Activities";
import Lectures from "./pages/Lectures";
import Indicators from "./pages/Indicators";
import Reports from "./pages/Reports";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import EventRegistration from "./pages/EventRegistration";
import Feedback from "./pages/Feedback";
import Community from "./pages/Community";
import StudentLayout from "./pages/student/StudentLayout";
import StudentDashboard from "./pages/student/StudentDashboard";
import StudentActivities from "./pages/student/StudentActivities";
import StudentEvents from "./pages/student/StudentEvents";
import StudentCertificates from "./pages/student/StudentCertificates";
import StudentRanking from "./pages/student/StudentRanking";
import StudentFeedback from "./pages/student/StudentFeedback";
import StudentCommunity from "./pages/student/StudentCommunity";
import StudentHistory from "./pages/student/StudentHistory";
import StudentProfile from "./pages/student/StudentProfile";
import StudentSettings from "./pages/student/StudentSettings";
import UploadLogo from "./pages/UploadLogo";
import EmailPreview from "./pages/EmailPreview";
import UserStats from "./pages/UserStats";
import CertificateValidation from "./pages/CertificateValidation";

// Create a client
const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <TooltipProvider>
            <Toaster />
            <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/event-registration" element={<EventRegistration />} />
            <Route path="/validar/:codigo" element={<CertificateValidation />} />
            <Route path="/validar" element={<CertificateValidation />} />
            <Route path="/upload-logo" element={<UploadLogo />} />
            <Route path="/email-preview" element={<EmailPreview />} />
            
            {/* Student Area Routes */}
            <Route path="/student" element={
              <ProtectedRoute allowedRoles={['estudante', 'admin']}>
                <StudentLayout />
              </ProtectedRoute>
            }>
              <Route index element={<StudentDashboard />} />
              <Route path="events" element={<StudentEvents />} />
              <Route path="activities" element={<StudentActivities />} />
              <Route path="certificates" element={<StudentCertificates />} />
              <Route path="ranking" element={<StudentRanking />} />
              <Route path="feedback" element={<StudentFeedback />} />
              <Route path="community" element={<StudentCommunity />} />
              <Route path="history" element={<StudentHistory />} />
              <Route path="profile" element={<StudentProfile />} />
              <Route path="settings" element={<StudentSettings />} />
            </Route>
            
            {/* Admin/Professor Area Routes */}
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin', 'professor']}>
                <Index />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="events" element={<Events />} />
              <Route path="new-event" element={<NewEvent />} />
              <Route path="past-events" element={<PastEvents />} />
              <Route path="participants" element={<Participants />} />
              <Route path="participants-list" element={<ParticipantsList />} />
              <Route path="system-users" element={
                <RoleGuard allowedRoles={['admin']}>
                  <SystemUsers />
                </RoleGuard>
              } />
              <Route path="user-stats" element={
                <RoleGuard allowedRoles={['admin']}>
                  <UserStats />
                </RoleGuard>
              } />
              <Route path="workshops" element={<Workshops />} />
              <Route path="activities" element={<Activities />} />
              <Route path="lectures" element={<Lectures />} />
              <Route path="indicators" element={
                <RoleGuard allowedRoles={['admin']}>
                  <Indicators />
                </RoleGuard>
              } />
              <Route path="reports" element={<Reports />} />
              <Route path="feedback" element={<Feedback />} />
              <Route path="community" element={<Community />} />
              <Route path="institutions" element={
                <RoleGuard allowedRoles={['admin']}>
                  <Institutions />
                </RoleGuard>
              } />
              <Route path="profile" element={<Profile />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </TooltipProvider>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
