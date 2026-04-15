import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { useEffect, useLayoutEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { MetrikaConsole } from "./components/MetrikaConsole";
import { ChatWidget } from "./components/ChatWidget";
import { RouteGuard } from "./components/RouteGuard";

import Landing from "./pages/Landing";
import AssistedStart from "./pages/AssistedStart";
import ManagerHandoff from "./pages/ManagerHandoff";
import SmsAuth from "./pages/SmsAuth";
import Step1Business from "./pages/Step1Business";
import Step2Passport from "./pages/Step2Passport";
import Step3Review from "./pages/Step3Review";
import Success from "./pages/Success";
import ManagerRequest from "./pages/ManagerRequest";
import RkoRequest from "./pages/RkoRequest";
import NotFound from "./pages/NotFound";
import ManagerWorkspace from "./pages/ManagerWorkspace";
import MyApplications from "./pages/MyApplications";
import uralsibLogoClean from "@/assets/uralsib-logo-clean.webp";
import uralsibLogoDark from "@/assets/uralsib-logo-dark.webp";

function ScrollToTop() {
  const { pathname } = useLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname]);
  return null;
}

function PreloadCriticalAssets() {
  useEffect(() => {
    [uralsibLogoClean, uralsibLogoDark].forEach((href) => {
      const preload = document.createElement("link");
      preload.rel = "preload";
      preload.as = "image";
      preload.href = href;
      document.head.appendChild(preload);

      const image = new Image();
      image.src = href;
      image.decode?.().catch(() => undefined);
    });
  }, []);

  return null;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <PreloadCriticalAssets />
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/assisted-start" element={<AssistedStart />} />
            <Route path="/manager" element={<ManagerHandoff />} />
            <Route path="/sms-auth" element={<SmsAuth />} />
            <Route path="/step/1" element={<RouteGuard requireSms><Step1Business /></RouteGuard>} />
            <Route path="/step/2" element={<RouteGuard requireSms requireStep={1}><Step2Passport /></RouteGuard>} />
            <Route path="/step/3" element={<RouteGuard requireSms requireStep={2}><Step3Review /></RouteGuard>} />
            <Route path="/manager-request" element={<RouteGuard requireSms><ManagerRequest /></RouteGuard>} />
            <Route path="/success" element={<RouteGuard requireSms><Success /></RouteGuard>} />
            <Route path="/rko-request" element={<RouteGuard requireSms><RkoRequest /></RouteGuard>} />
            <Route path="/my-applications" element={<RouteGuard requireSms><MyApplications /></RouteGuard>} />
            <Route path="/office-agent" element={<ManagerWorkspace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        
        <ChatWidget />
        <MetrikaConsole />
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
