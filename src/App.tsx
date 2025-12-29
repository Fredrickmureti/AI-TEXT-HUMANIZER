import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/hooks/useAdmin";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";
import Dashboard from "./pages/Dashboard";
import Detect from "./pages/Detect";
import Humanize from "./pages/Humanize";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Paraphrase from "./pages/Paraphrase";
import Summarize from "./pages/Summarize";
import ImproveWriting from "./pages/ImproveWriting";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminModels from "./pages/admin/AdminModels";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminSettings from "./pages/admin/AdminSettings";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();
  
  if (authLoading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/admin-auth" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/admin-auth" replace />;
  }
  
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/admin-auth" element={<AdminAuth />} />
      <Route 
        path="/payment/success" 
        element={
          <ProtectedRoute>
            <PaymentSuccess />
          </ProtectedRoute>
        } 
      />
      <Route path="/payment/cancel" element={<PaymentCancel />} />
      
      {/* User Dashboard Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/detect" 
        element={
          <ProtectedRoute>
            <Detect />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/humanize" 
        element={
          <ProtectedRoute>
            <Humanize />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/history" 
        element={
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/settings" 
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/dashboard/paraphrase" 
        element={
          <ProtectedRoute>
            <Paraphrase />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/summarize" 
        element={
          <ProtectedRoute>
            <Summarize />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard/improve-writing" 
        element={
          <ProtectedRoute>
            <ImproveWriting />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route
        path="/admin" 
        element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/pricing" 
        element={
          <AdminRoute>
            <AdminPricing />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <AdminRoute>
            <AdminUsers />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/models" 
        element={
          <AdminRoute>
            <AdminModels />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/payments" 
        element={
          <AdminRoute>
            <AdminPayments />
          </AdminRoute>
        } 
      />
      <Route 
        path="/admin/settings" 
        element={
          <AdminRoute>
            <AdminSettings />
          </AdminRoute>
        } 
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
