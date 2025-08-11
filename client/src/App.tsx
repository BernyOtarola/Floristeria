import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import AdminLogin from "@/pages/admin-login";
import ProtectedRoute from "@/components/protected-route";

// Lazy load admin pages for better performance
import { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = lazy(() => import("@/pages/admin/dashboard"));
const AdminProducts = lazy(() => import("@/pages/admin/products"));
const AdminCategories = lazy(() => import("@/pages/admin/categories"));
const AdminCoupons = lazy(() => import("@/pages/admin/coupons"));
const AdminOrders = lazy(() => import("@/pages/admin/orders"));
const AdminReports = lazy(() => import("@/pages/admin/reports"));
const AdminSettings = lazy(() => import("@/pages/admin/settings"));

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={Home} />
      
      {/* Admin Login */}
      <Route path="/admin/login" component={AdminLogin} />
      
      {/* Protected Admin Routes */}
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
      
      {/* Catch all - 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

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