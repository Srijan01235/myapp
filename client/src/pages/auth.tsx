import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LoginUser } from "@shared/schema";

export default function AuthPage() {
  const { toast } = useToast();

  // Login form state - default to admin credentials for convenience
  const [loginData, setLoginData] = useState<LoginUser>({
    username: "admin",
    password: "admin123",
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginUser) => {
      const response = await apiRequest("POST", "/api/auth/login", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Welcome Back!",
        description: "Successfully logged in to admin dashboard.",
      });
      
      // Store user data in localStorage for session management
      localStorage.setItem("user", JSON.stringify(data.user));
      
      // Force refresh of auth state
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      
      // Small delay to ensure state updates, then redirect
      setTimeout(() => {
        window.location.href = "/admin";
      }, 100);
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      toast({
        title: "Login Failed", 
        description: error.error || error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    loginMutation.mutate(loginData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Restaurant Admin Login</CardTitle>
            <CardDescription>
              Sign in to access the restaurant management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={loginData.username}
                  onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                  required
                  data-testid="input-username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  required
                  data-testid="input-password"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending}
                data-testid="button-login"
              >
                {loginMutation.isPending ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Admin Credentials</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Username:</strong> admin</p>
                <p><strong>Password:</strong> admin123</p>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <a 
                href="/order" 
                className="text-blue-600 hover:underline"
                data-testid="link-customer-menu"
              >
                Browse customer menu →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}