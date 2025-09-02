import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { User, Lock, Eye, EyeOff, UserPlus, LogIn, Utensils, Mail, IdCard, Shield, Phone, Info, HelpCircle } from "lucide-react";
import { z } from "zod";
import { useLocation } from "wouter";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Admin } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/, "Password must contain uppercase, lowercase, and numbers"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginData = z.infer<typeof loginSchema>;
type SignupData = z.infer<typeof signupSchema>;

export default function AdminAuth() {
  const [isSignup, setIsSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const signupForm = useForm<SignupData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json();
    },
    onSuccess: (data: { admin: Admin }) => {
      login(data.admin);
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    },
  });

  const signupMutation = useMutation({
    mutationFn: async (data: Omit<SignupData, "confirmPassword">) => {
      const response = await apiRequest("POST", "/api/admin/signup", data);
      return response.json();
    },
    onSuccess: (data: { admin: Admin }) => {
      login(data.admin);
      toast({
        title: "Account created!",
        description: "Welcome to the restaurant admin dashboard.",
      });
      setLocation("/admin");
    },
    onError: (error: Error) => {
      toast({
        title: "Signup failed",
        description: "Username or email already exists.",
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginData) => {
    loginMutation.mutate(data);
  };

  const onSignupSubmit = (data: SignupData) => {
    const { confirmPassword, ...signupData } = data;
    signupMutation.mutate(signupData);
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score;
  };

  const passwordStrength = calculatePasswordStrength(signupForm.watch("password") || "");
  const strengthColors = ["bg-red-500", "bg-yellow-500", "bg-blue-500", "bg-green-500"];
  const strengthTexts = ["Very Weak", "Weak", "Good", "Strong"];

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Utensils className="text-white text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Restaurant Admin</h2>
          <p className="text-gray-600">Access your management dashboard</p>
        </div>

        {/* Auth Toggle */}
        <div className="bg-gray-100 rounded-lg p-1 flex">
          <button
            onClick={() => setIsSignup(false)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              !isSignup
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>
          <button
            onClick={() => setIsSignup(true)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isSignup
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </button>
        </div>

        {/* Login Form */}
        {!isSignup && (
          <Card className="shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">Welcome Back</h3>
                <p className="text-gray-600 text-sm mt-1">Sign in to your admin account</p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your username"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="h-12 pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Signing in...
                      </div>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Demo Credentials */}
              <div className="border-t pt-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Demo Credentials
                  </h4>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Username:</strong> admin</p>
                    <p><strong>Password:</strong> admin123</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Signup Form */}
        {isSignup && (
          <Card className="shadow-lg">
            <CardContent className="p-8 space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-semibold text-gray-900">Create Admin Account</h3>
                <p className="text-gray-600 text-sm mt-1">Set up your restaurant management access</p>
              </div>

              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-gray-400" />
                          Full Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter your full name"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          Email Address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="Enter your email address"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          Username
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Choose a username"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <div className="text-xs text-gray-500">
                          Username must be at least 3 characters long
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Create a password"
                              className="h-12 pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        
                        {/* Password Strength Indicator */}
                        {field.value && (
                          <div className="mt-2">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4].map((level) => (
                                <div
                                  key={level}
                                  className={`h-1 flex-1 rounded ${
                                    level <= passwordStrength
                                      ? strengthColors[Math.min(passwordStrength - 1, 3)]
                                      : "bg-gray-200"
                                  }`}
                                />
                              ))}
                            </div>
                            {passwordStrength > 0 && (
                              <div className={`text-xs mt-1 ${
                                passwordStrength >= 3 ? 'text-green-600' : 
                                passwordStrength >= 2 ? 'text-blue-600' : 'text-red-600'
                              }`}>
                                Password strength: {strengthTexts[Math.min(passwordStrength - 1, 3)]}
                              </div>
                            )}
                          </div>
                        )}
                        <div className="text-xs text-gray-500">
                          Password must be at least 8 characters with uppercase, lowercase, and numbers
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={signupForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-gray-400" />
                          Confirm Password
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm your password"
                              className="h-12 pr-12"
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                    disabled={signupMutation.isPending}
                  >
                    {signupMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating account...
                      </div>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Create Account
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 space-y-2">
          <p className="flex items-center justify-center gap-1">
            <Shield className="w-4 h-4" />
            Secure admin access for restaurant management
          </p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-gray-700 transition-colors flex items-center gap-1">
              <HelpCircle className="w-4 h-4" />
              Help
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors flex items-center gap-1">
              <Phone className="w-4 h-4" />
              Support
            </a>
            <a href="#" className="hover:text-gray-700 transition-colors flex items-center gap-1">
              <Info className="w-4 h-4" />
              About
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
