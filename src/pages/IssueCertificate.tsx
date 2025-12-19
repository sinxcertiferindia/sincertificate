import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Award, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const IssueCertificate = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const certificateData = {
      recipientName: formData.get('recipientName') as string,
      recipientEmail: formData.get('recipientEmail') as string,
      courseName: formData.get('courseName') as string,
      batchName: formData.get('batchName') as string || undefined,
      organizationName: formData.get('organizationName') as string,
      issueDate: formData.get('issueDate') as string,
      expirationDate: formData.get('expirationDate') as string || undefined,
      additionalInfo: formData.get('additionalInfo') as string || undefined,
    };

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/certificates`,
        certificateData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      
      toast({
        title: "Certificate Issued Successfully!",
        description: `Certificate ${response.data.certificate.certificateId} has been created and saved.`,
      });
      
      // Reset form
      form.reset();
      
      // Optionally navigate back to admin page
      // navigate('/admin');
    } catch (error: any) {
      console.error('Error creating certificate:', error);
      
      let errorMessage = "An error occurred while creating the certificate.";
      
      if (error.response) {
        // Server responded with error status
        errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = "Unable to connect to the server. Please make sure the backend server is running on port 5000.";
      } else {
        // Something else happened
        errorMessage = error.message || errorMessage;
      }
      
      toast({
        title: "Certificate Creation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="outline" size="icon">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Issue Certificate</h1>
              <p className="text-muted-foreground">Create and issue a new certificate</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Card className="border-2">
          <CardHeader>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Award className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Certificate Details</CardTitle>
            <CardDescription>
              Fill in the information below to issue a new certificate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="recipientName">Recipient Name *</Label>
                  <Input
                    id="recipientName"
                    name="recipientName"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipientEmail">Recipient Email *</Label>
                  <Input
                    id="recipientEmail"
                    name="recipientEmail"
                    type="email"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="courseName">Course/Program Name *</Label>
                <Input
                  id="courseName"
                  name="courseName"
                  placeholder="MERN Stack Development Bootcamp"
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="batchName">Batch Name</Label>
                  <Input
                    id="batchName"
                    name="batchName"
                    placeholder="Batch 2025-A"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">Issue Date *</Label>
                  <Input
                    id="issueDate"
                    name="issueDate"
                    type="date"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expirationDate">Expiration Date (Optional)</Label>
                <Input
                  id="expirationDate"
                  name="expirationDate"
                  type="date"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationName">Organization Name *</Label>
                <Input
                  id="organizationName"
                  name="organizationName"
                  placeholder="Tech Academy"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  placeholder="Any additional notes or special recognitions..."
                  rows={4}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                  size="lg"
                >
                  {isSubmitting ? "Issuing..." : "Issue Certificate"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  asChild
                  size="lg"
                >
                  <Link to="/admin">Cancel</Link>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IssueCertificate;
