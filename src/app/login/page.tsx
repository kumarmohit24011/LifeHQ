
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LifeHQLogo } from "@/components/app/logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
      router.push("/tasks");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Please check your email and password." });
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex items-center gap-2 text-2xl font-semibold">
            <LifeHQLogo />
            <h1>LifeHQ</h1>
        </div>
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your email below to login to your account.</CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <Input id="login-email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password">Password</Label>
                <Input id="login-password" type="password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Loading...' : 'Login'}</Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
