import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Award, CheckCircle2, QrCode, Download, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-accent/5 py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6">
            <div className="inline-block">
              <div className="flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4">
                <Award className="w-10 h-10 text-primary" />
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground">
              Digital Certificate
              <span className="block text-primary">Management System</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Issue, verify, and manage digital certificates with blockchain-level security. 
              Trusted by organizations worldwide.
            </p>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <Button asChild size="lg" className="text-lg">
                <Link to="/admin">Admin Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg">
                <Link to="/students/certificates">Student Portal</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-lg">
                <Link to="/verify">Verify Certificate</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Powerful Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to manage digital certificates
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Secure Verification</CardTitle>
                <CardDescription>
                  Each certificate gets a unique ID and QR code for instant verification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Bulk Issuance</CardTitle>
                <CardDescription>
                  Upload CSV files to issue hundreds of certificates in seconds
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <QrCode className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>QR Code Generation</CardTitle>
                <CardDescription>
                  Automatic QR code generation for easy mobile verification
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Download className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>PDF Downloads</CardTitle>
                <CardDescription>
                  Recipients can download high-quality PDF certificates instantly
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Share2 className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Social Sharing</CardTitle>
                <CardDescription>
                  One-click sharing to LinkedIn and other social platforms
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                  <Award className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>Custom Templates</CardTitle>
                <CardDescription>
                  Create and manage multiple certificate templates for different programs
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of organizations using our platform to issue trusted digital certificates
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="text-lg">
              <Link to="/admin">Access Dashboard</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg">
              <Link to="/students/certificates">Student Portal</Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-lg">
              <Link to="/verify">Verify a Certificate</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
