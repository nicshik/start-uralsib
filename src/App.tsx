import { BrowserRouter, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect, useLayoutEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { MetrikaConsole } from "./components/MetrikaConsole";
import { ChatWidget } from "./components/ChatWidget";
import { RouteGuard } from "./components/RouteGuard";
import { AppHeader } from "./components/AppHeader";
import { AutosaveIndicator } from "./components/AutosaveIndicator";
import { isDemoToolsEnabled } from "@/lib/demoTools";

import Landing from "./pages/Landing";
import AssistedStart from "./pages/AssistedStart";
import ManagerHandoff from "./pages/ManagerHandoff";
import SmsAuth from "./pages/SmsAuth";
import Step1Business from "./pages/Step1Business";
import Step2Passport from "./pages/Step2Passport";
import Step3Contact from "./pages/Step3Contact";
import Step3Review from "./pages/Step3Review";
import Success from "./pages/Success";
import ManagerRequest from "./pages/ManagerRequest";
import RkoRequest from "./pages/RkoRequest";
import NotFound from "./pages/NotFound";
import MyApplications from "./pages/MyApplications";
import uralsibLogoClean from "@/assets/uralsib-logo-clean.webp";
import uralsibLogoDark from "@/assets/uralsib-logo-dark.webp";

const ManagerWorkspace = lazy(() => import("./pages/ManagerWorkspace"));
const Coverage = lazy(() => import("./pages/Coverage"));
const FieldCoverage = lazy(() => import("./pages/FieldCoverage"));
const Hypotheses = lazy(() => import("./pages/Hypotheses"));

function FormStepsLayout() {
  return (
    <>
      <AppHeader showBack>
        <AutosaveIndicator />
      </AppHeader>
      <Outlet />
    </>
  );
}

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

const App = () => (
  <TooltipProvider>
    <AppProvider>
      <Toaster />
      {/* Persistent hidden images keep decoded logo in browser memory — prevents flash on navigation */}
      <div aria-hidden="true" className="absolute top-0 left-0 w-0 h-0 overflow-hidden pointer-events-none">
        <img src={uralsibLogoClean} alt="" fetchPriority="high" decoding="sync" />
        <img src={uralsibLogoDark} alt="" fetchPriority="high" decoding="sync" />
      </div>
      <BrowserRouter>
        <PreloadCriticalAssets />
        <ScrollToTop />
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/assisted-start" element={<AssistedStart />} />
            <Route path="/manager" element={<ManagerHandoff />} />
            <Route path="/sms-auth" element={<SmsAuth />} />
            <Route element={<FormStepsLayout />}>
              <Route path="/step/1" element={<RouteGuard requireSms><Step1Business /></RouteGuard>} />
              <Route path="/step/2" element={<RouteGuard requireSms requireStep={1}><Step2Passport /></RouteGuard>} />
              <Route path="/step/3" element={<RouteGuard requireSms requireStep={2}><Step3Contact /></RouteGuard>} />
              <Route path="/step/4" element={<RouteGuard requireSms requireStep={3}><Step3Review /></RouteGuard>} />
            </Route>
            <Route path="/manager-request" element={<RouteGuard requireSms><ManagerRequest /></RouteGuard>} />
            <Route path="/success" element={<RouteGuard requireSms><Success /></RouteGuard>} />
            <Route path="/rko-request" element={<RouteGuard requireSms><RkoRequest /></RouteGuard>} />
            <Route path="/my-applications" element={<RouteGuard requireSms><MyApplications /></RouteGuard>} />
            <Route path="/office-agent" element={<ManagerWorkspace />} />
            <Route path="/design" element={<Coverage />} />
            <Route path="/coverage" element={<FieldCoverage />} />
            <Route path="/hypotheses" element={<Hypotheses />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>

      <ChatWidget />
      <MetrikaConsole />
    </AppProvider>
  </TooltipProvider>
);

export default App;
