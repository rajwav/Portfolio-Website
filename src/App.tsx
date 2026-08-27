import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoadingProvider from "./context/LoadingProvider";
import { PortfolioDataProvider } from "./context/PortfolioDataContext";
import { AuthProvider } from "./admin/context/AuthContext";

const CharacterModel = lazy(() => import("./components/Character"));
const MainContainer = lazy(() => import("./components/MainContainer"));
const AdminLogin = lazy(() => import("./admin/pages/AdminLogin"));
const AdminGuard = lazy(() => import("./admin/components/AdminGuard"));
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));

const PublicPortfolio = () => (
  <LoadingProvider>
    <Suspense fallback={null}>
      <MainContainer>
        <Suspense fallback={null}>
          <CharacterModel />
        </Suspense>
      </MainContainer>
    </Suspense>
  </LoadingProvider>
);

const App = () => {
  return (
    <PortfolioDataProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<PublicPortfolio />} />
            <Route
              path="/admin/login"
              element={
                <Suspense
                  fallback={
                    <div style={{ minHeight: "100vh", backgroundColor: "#0b080c" }} />
                  }
                >
                  <AdminLogin />
                </Suspense>
              }
            />
            <Route
              path="/admin"
              element={
                <Suspense
                  fallback={
                    <div style={{ minHeight: "100vh", backgroundColor: "#0b080c" }} />
                  }
                >
                  <AdminGuard>
                    <AdminDashboard />
                  </AdminGuard>
                </Suspense>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </PortfolioDataProvider>
  );
};

export default App;
