// App.tsx
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatAnalyzer from "./pages/ChatAnalyzer";
import BioGenerator from "./pages/BioGenerator";
import DpAnalyzer from "./pages/DpAnalyzer";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import axios from "axios";
import RazorpayPaymentPage from "./pages/RazorPayPaymentPage";
import AdminInfluencers from "./pages/AdminInfluencers";
import { AuthProvider } from "./context/AuthContext";

const queryClient = new QueryClient();
axios.defaults.withCredentials = true; // global
axios.defaults.baseURL = "http://localhost:4000";
// axios.defaults.baseURL = "https://amour123.vercel.app/";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/buy-credits" element={<RazorpayPaymentPage />} />
              <Route path="/tools/chat-analyzer" element={<ChatAnalyzer />} />
              <Route path="/tools/bio-generator" element={<BioGenerator />} />
              <Route path="/tools/dp-analyzer" element={<DpAnalyzer />} />
              <Route path="/admin" element={<AdminInfluencers />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
