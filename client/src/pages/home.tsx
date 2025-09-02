import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import type { User } from "@shared/schema";

export default function Home() {
  const { user } = useAuth() as { user: User | null };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
          </h1>
          <p className="text-gray-600">
            Manage your restaurant operations from your dashboard
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Admin Dashboard</CardTitle>
              <CardDescription>
                Manage orders, menu items, and view analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin">
                <Button className="w-full">
                  Go to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer View</CardTitle>
              <CardDescription>
                See how customers view your menu and place orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/order">
                <Button variant="outline" className="w-full">
                  View Menu
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => window.location.href = '/api/logout'}
          >
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}