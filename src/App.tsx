import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { MetrikaConsole } from "./components/MetrikaConsole";
import { RouteGuard } from "./components/RouteGuard";

import Landing from "./pages/Landing";
import ManagerHandoff from "./pages/ManagerHandoff";
import SmsAuth from "./pages/SmsAuth";
import Step1Business from "./pages/Step1Business";
import Step2Passport from "./pages/Step2Passport";
import Step3Review from "./pages/Step3Review";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";
import ManagerWorkspace from "./pages/ManagerWorkspace";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/manager" element={<ManagerHandoff />} />
            <Route path="/sms-auth" element={<SmsAuth />} />
            <Route path="/step/1" element={<RouteGuard requireSms><Step1Business /></RouteGuard>} />
            <Route path="/step/2" element={<RouteGuard requireSms requireStep={1}><Step2Passport /></RouteGuard>} />
            <Route path="/step/3" element={<RouteGuard requireSms requireStep={2}><Step3Review /></RouteGuard>} />
            <Route path="/success" element={<RouteGuard requireSms><Success /></RouteGuard>} />
            <Route path="/office-agent" element={<ManagerWorkspace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        
        <MetrikaConsole />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
