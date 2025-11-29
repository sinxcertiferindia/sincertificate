import { FormEvent, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, ShieldCheck } from "lucide-react";
import {
  clearAdminSession,
  getConfiguredAdminCredentials,
  isAdminAuthenticated,
  setAdminAuthenticated,
  validateAdminCredentials,
} from "@/lib/admin-auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectPath =
    (location.state as { from?: string })?.from && location.state.from !== "/admin/login"
      ? (location.state as { from?: string })?.from
      : "/admin";

  useEffect(() => {
    if (isAdminAuthenticated()) {
      navigate("/admin", { replace: true });
    } else {
      clearAdminSession();
    }
  }, [navigate]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (!email || !password) {
        setError("Please enter both email and password.");
        return;
      }

      if (!validateAdminCredentials(email, password)) {
        setError("Invalid admin credentials. Update the .env values to match.");
        return;
      }

      setAdminAuthenticated();
      navigate(redirectPath || "/admin", { replace: true });
    } finally {
      setSubmitting(false);
    }
  };

  const credentials = getConfiguredAdminCredentials();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Securely sign in to manage certificates.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                autoComplete="username"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <Lock className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Current placeholder credentials: {credentials.email} / {credentials.password}. Update `VITE_ADMIN_EMAIL`
              and `VITE_ADMIN_PASSWORD` in your environment file before deploying.
            </p>
            <div className="text-center text-sm">
              <Link to="/" className="text-primary hover:underline">
                Back to Home
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;

