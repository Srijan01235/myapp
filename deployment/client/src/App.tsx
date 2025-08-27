import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AdminDashboard from "@/pages/admin-dashboard";
import CustomerOrder from "@/pages/customer-order";
import AuthPage from "@/pages/auth";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {/* Public routes - always accessible */}
      <Route path="/auth" component={AuthPage} />
      <Route path="/order" component={CustomerOrder} />
      
      {/* Protected admin route */}
      <Route path="/admin">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        ) : isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <AuthPage />
        )}
      </Route>
      
      {/* Root route */}
      <Route path="/">
        {isLoading ? (
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-lg">Loading...</div>
          </div>
        ) : isAuthenticated ? (
          <AdminDashboard />
        ) : (
          <AuthPage />
        )}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Router />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;