import { lazy, Suspense, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Skeleton } from "@/components/ui/skeleton";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

import ProtectedRoute from "@/components/protected-route";

// Auth (usuario)
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";

// Lazy admin pages
const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminCategories = lazy(() => import("@/pages/admin/categories"));
const AdminCoupons = lazy(() => import("@/pages/admin/coupons"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));

function AdminLoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    </div>
  );
}

// Redirect helper for Wouter
function Redirect({ to }: { to: string }) {
  const [, setLocation] = useLocation();
  useEffect(() => {
    setLocation(to);
  }, [setLocation, to]);
  return null;
}

function Router() {
  return (
    <Switch>
      {/* Públicas */}
      <Route path="/" component={Home} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />

      

      {/* Atajo: /admin -> /admin/dashboard */}
      <Route path="/admin">
        <Redirect to="/admin/dashboard" />
      </Route>

      {/* Admin protegidas */}
      <Route path="/admin/dashboard">
        <ProtectedRoute>
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminDashboard />
          </Suspense>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/products">
        <ProtectedRoute>
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminProducts />
          </Suspense>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/categories">
        <ProtectedRoute>
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminCategories />
          </Suspense>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/coupons">
        <ProtectedRoute>
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminCoupons />
          </Suspense>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/orders">
        <ProtectedRoute>
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminOrders />
          </Suspense>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/reports">
        <ProtectedRoute>
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminReports />
          </Suspense>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/settings">
        <ProtectedRoute>
          <Suspense fallback={<AdminLoadingSkeleton />}>
            <AdminSettings />
          </Suspense>
        </ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
