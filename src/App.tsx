import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import VerifyCertificate from "./pages/VerifyCertificate";
import IssueCertificate from "./pages/IssueCertificate";
import CertificateViewer from "./pages/CertificateViewer";
import BulkUpload from "./pages/BulkUpload";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminCourses from "./pages/AdminCourses";
import StudentCertificates from "./pages/StudentCertificates";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/issue"
            element={
              <AdminRoute>
                <IssueCertificate />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/bulk"
            element={
              <AdminRoute>
                <BulkUpload />
              </AdminRoute>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <AdminRoute>
                <AdminCourses />
              </AdminRoute>
            }
          />
          <Route path="/verify" element={<VerifyCertificate />} />
          <Route path="/students/certificates" element={<StudentCertificates />} />
          <Route path="/certificate/:id" element={<CertificateViewer />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
