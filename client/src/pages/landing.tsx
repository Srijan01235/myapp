import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Restaurant Manager</CardTitle>
            <CardDescription>
              Access your restaurant management dashboard to manage orders and menu items.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/api/login'} 
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <a 
                href="/order" 
                className="text-blue-600 hover:underline"
              >
                Or browse our menu →
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}