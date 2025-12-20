import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Search, CheckCircle2, XCircle, Award, Calendar, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const VerifyCertificate = () => {
  const [certId, setCertId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const handleVerify = async () => {
    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/certificates/${certId}`);
      const certificate = response.data;

      setVerificationResult({
        valid: true,
        certNumber: certificate.certificateId,
        recipient: certificate.recipientName,
        course: certificate.courseName,
        issueDate: new Date(certificate.issueDate).toLocaleDateString(),
        organization: certificate.organizationName || "CertifyHub",
        status: certificate.expirationDate && new Date(certificate.expirationDate) < new Date()
          ? "Expired"
          : certificate.status === "revoked" ? "Revoked" : "Active",
      });
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        setVerificationResult({
          valid: false,
          message: "Certificate not found.",
        });
      } else {
        setVerificationResult({
          valid: false,
          message: error.response?.data?.message || "An error occurred during verification.",
        });
      }
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Certificate Verification</h1>
                <p className="text-sm text-muted-foreground">Verify authenticity instantly</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {/* Verification Form */}
        <Card className="border-2 mb-8">
          <CardHeader className="text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Verify a Certificate</CardTitle>
            <CardDescription className="text-base">
              Enter the certificate ID or scan the QR code to verify authenticity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Enter Certificate ID (e.g., CERT-2025-001)"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="text-lg h-12"
              />
              <Button 
                onClick={handleVerify} 
                disabled={!certId || isVerifying}
                size="lg"
                className="px-8"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Or scan QR code from your certificate
            </p>
          </CardContent>
        </Card>

        {/* Verification Result */}
        {verificationResult && (
          <Card className={`border-2 ${verificationResult.valid ? 'border-accent' : 'border-destructive'}`}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  verificationResult.valid ? 'bg-accent/10' : 'bg-destructive/10'
                }`}>
                  {verificationResult.valid ? (
                    <CheckCircle2 className="w-6 h-6 text-accent" />
                  ) : (
                    <XCircle className="w-6 h-6 text-destructive" />
                  )}
                </div>
                <div>
                  <CardTitle className={verificationResult.valid ? 'text-accent' : 'text-destructive'}>
                    {verificationResult.valid ? 'Certificate Valid' : 'Invalid Certificate'}
                  </CardTitle>
                  <CardDescription>
                    {verificationResult.valid 
                      ? 'This certificate is authentic and verified' 
                      : 'This certificate ID was not found in our system'}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            {verificationResult.valid && (
              <CardContent className="space-y-6">
                <Alert className="border-accent/50 bg-accent/5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <AlertDescription className="text-sm">
                    This certificate has been verified and is currently <strong>active</strong>
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Certificate ID</p>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.certNumber}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Recipient</p>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.recipient}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Award className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Course/Program</p>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.course}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Building2 className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Issued By</p>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.organization}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">Issue Date</p>
                      <p className="text-lg font-semibold text-foreground">{verificationResult.issueDate}</p>
                    </div>
                  </div>
                </div>

                <Button asChild className="w-full" size="lg">
                  <Link to={`/certificate/${verificationResult.certNumber}`}>
                    View Full Certificate
                  </Link>
                </Button>
              </CardContent>
            )}
          </Card>
        )}
      </div>
    </div>
  );
};

export default VerifyCertificate;
