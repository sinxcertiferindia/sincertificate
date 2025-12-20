import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, FileText, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Papa from "papaparse";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;

const BulkUpload = () => {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template with headers and example rows using Papa Parse
    const data = [
      {
        recipient_name: 'John Doe',
        recipient_email: 'john.doe@example.com',
        course_name: 'MERN Stack Development Bootcamp',
        organization_name: 'Tech Academy',
        issue_date: '2025-01-15',
        batch_name: 'Batch 2025-A',
        expiration_date: '2026-01-15',
        additional_info: 'Successfully completed the comprehensive program'
      },
      {
        recipient_name: 'Jane Smith',
        recipient_email: 'jane.smith@example.com',
        course_name: 'React Advanced Course',
        organization_name: 'Tech Academy',
        issue_date: '2025-01-16',
        batch_name: 'Batch 2025-A',
        expiration_date: '',
        additional_info: ''
      }
    ];

    const csvContent = Papa.unparse(data, {
      header: true,
      delimiter: ','
    });

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'certificate_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a CSV or Excel file to upload.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      
      // Remove BOM if present
      const cleanCsvData = csvData.replace(/^\uFEFF/, '');
      
      Papa.parse(cleanCsvData, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => {
          // Normalize headers: trim, lowercase, replace spaces with underscores
          return header.trim().toLowerCase().replace(/\s+/g, '_');
        },
        complete: async (results) => {
          console.log('CSV Parse Results:', results);
          console.log('Found columns:', results.meta?.fields || Object.keys(results.data[0] || {}));
          console.log('Total rows:', results.data.length);
          
          if (!results.data || results.data.length === 0) {
            toast({
              title: "Empty CSV File",
              description: "Your CSV file appears to be empty or has no data rows.",
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }

          // Helper function to get field value (case-insensitive, handles variations)
          const getField = (row: any, fieldName: string, alternatives: string[] = []) => {
            const normalizedField = fieldName.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
            
            // Try exact match first
            if (row[normalizedField] !== undefined) {
              return row[normalizedField];
            }
            
            // Try all alternatives
            const allVariations = [fieldName, ...alternatives].map(f => 
              f.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_')
            );
            
            // Try variations in row keys
            for (const key in row) {
              const normalizedKey = key.toLowerCase().replace(/\s+/g, '_').replace(/\//g, '_');
              if (allVariations.includes(normalizedKey)) {
                return row[key];
              }
            }
            
            return null;
          };

          // Helper function to normalize date format
          const normalizeDate = (dateStr: string | null | undefined): string | null => {
            if (!dateStr) return null;
            
            const trimmed = dateStr.trim();
            
            // Already in YYYY-MM-DD format
            if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
              return trimmed;
            }
            
            // Try to match DD-MM-YYYY or MM-DD-YYYY format
            const dateMatch = trimmed.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})$/);
            if (dateMatch) {
              const [, part1, part2, year] = dateMatch;
              const num1 = parseInt(part1, 10);
              const num2 = parseInt(part2, 10);
              
              // If first part > 12, it must be DD-MM-YYYY (day-month-year)
              if (num1 > 12) {
                return `${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
              }
              // If second part > 12, it must be MM-DD-YYYY (month-day-year)
              else if (num2 > 12) {
                return `${year}-${part1.padStart(2, '0')}-${part2.padStart(2, '0')}`;
              }
              // Ambiguous case (both <= 12), assume DD-MM-YYYY (more common internationally)
              else {
                return `${year}-${part2.padStart(2, '0')}-${part1.padStart(2, '0')}`;
              }
            }
            
            return trimmed; // Return as-is if can't parse
          };

          // Filter out empty rows and validate required fields
          const validCertificates = results.data
            .map((row: any, index: number) => {
              // Get all field values with alternative column name variations
              const recipientName = getField(row, 'recipient_name', ['recipient', 'name'])?.toString().trim();
              const recipientEmail = getField(row, 'recipient_email', ['email', 'recipientemail'])?.toString().trim();
              const courseName = getField(row, 'course_name', ['course/program_name', 'course_program_name', 'course', 'program_name', 'program'])?.toString().trim();
              const organizationName = getField(row, 'organization_name', ['organization', 'org_name', 'issuing_organization'])?.toString().trim();
              const issueDateRaw = getField(row, 'issue_date', ['date', 'issue_date', 'issued_date'])?.toString().trim();
              const issueDate = normalizeDate(issueDateRaw);
              
              // Check if all required fields are present and not empty
              if (!recipientName || !recipientEmail || !courseName || !organizationName || !issueDate) {
                console.log(`Row ${index + 1} skipped - missing fields:`, {
                  recipientName: !!recipientName,
                  recipientEmail: !!recipientEmail,
                  courseName: !!courseName,
                  organizationName: !!organizationName,
                  issueDate: !!issueDate,
                  issueDateRaw: issueDateRaw,
                  row: row
                });
                return null;
              }
              
              const expirationDateRaw = getField(row, 'expiration_date', ['expiry_date', 'exp_date'])?.toString().trim();
              
              return {
                certificateId: getField(row, 'certificate_id', ['cert_id', 'id'])?.toString().trim() || 
                  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                recipientName,
                recipientEmail,
                courseName,
                batchName: getField(row, 'batch_name', ['batch'])?.toString().trim() || undefined,
                organizationName,
                issueDate,
                expirationDate: normalizeDate(expirationDateRaw) || undefined,
                additionalInfo: getField(row, 'additional_info', ['additional_info', 'notes', 'description'])?.toString().trim() || undefined,
                status: getField(row, 'status')?.toString().toLowerCase() === 'revoked' ? 'revoked' : 'active',
              };
            })
            .filter((cert: any) => cert !== null);

          if (validCertificates.length === 0) {
            const foundColumns = results.meta?.fields || (results.data[0] ? Object.keys(results.data[0]) : []);
            toast({
              title: "No Valid Certificates",
              description: `Found columns: ${foundColumns.join(', ')}. Required: recipient_name, recipient_email, course_name, organization_name, issue_date. Check browser console for details.`,
              variant: "destructive",
            });
            setIsUploading(false);
            return;
          }

          if (validCertificates.length < results.data.length) {
            const skipped = results.data.length - validCertificates.length;
            toast({
              title: "Some rows skipped",
              description: `${skipped} row(s) were skipped due to missing required fields.`,
              variant: "default",
            });
          }

          try {
            const response = await axios.post(`${API_BASE_URL}/certificates/bulk`, validCertificates);
            toast({
              title: "Bulk Upload Successful!",
              description: `${response.data.length} certificates have been issued.`,
            });
            setFile(null);
          } catch (error: any) {
            console.error('Bulk upload error:', error);
            let errorMessage = "An error occurred during upload.";
            
            if (error.response?.data?.message) {
              errorMessage = error.response.data.message;
            } else if (error.response?.data?.errors) {
              // Handle validation errors
              const errors = error.response.data.errors;
              errorMessage = `Validation errors: ${errors.map((e: any) => e.message || e).join(', ')}`;
            }
            
            toast({
              title: "Bulk Upload Failed",
              description: errorMessage,
              variant: "destructive",
            });
          } finally {
            setIsUploading(false);
          }
        },
        error: (error: any) => {
          toast({
            title: "CSV Parsing Error",
            description: error.message,
            variant: "destructive",
          });
          setIsUploading(false);
        },
      });
    };

    reader.readAsText(file);
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
              <h1 className="text-2xl font-bold text-foreground">Bulk Certificate Upload</h1>
              <p className="text-muted-foreground">Issue multiple certificates at once</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Instructions Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Download Template</p>
                    <p className="text-sm text-muted-foreground">Get the CSV template with required fields</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Fill in Details</p>
                    <p className="text-sm text-muted-foreground">Add recipient information to the template</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Upload & Process</p>
                    <p className="text-sm text-muted-foreground">Upload the file and certificates will be generated</p>
                  </div>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={downloadTemplate}
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* Upload Card */}
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-primary" />
                Upload File
              </CardTitle>
              <CardDescription>
                Upload your completed CSV file to issue certificates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm font-medium text-foreground mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    CSV or Excel files (max 5MB)
                  </p>
                </label>
              </div>

              {file && (
                <Alert className="border-accent/50 bg-accent/5">
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                  <AlertDescription>
                    <strong>{file.name}</strong> selected ({(file.size / 1024).toFixed(2)} KB)
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleUpload} 
                disabled={!file || isUploading}
                className="w-full"
                size="lg"
              >
                {isUploading ? "Processing..." : "Upload & Issue Certificates"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Required Fields Info */}
        <Card>
          <CardHeader>
            <CardTitle>Required CSV Fields</CardTitle>
            <CardDescription>
              Your CSV file must include these columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">recipient_name *</p>
                <p className="text-sm text-muted-foreground">Full name of the recipient (Required)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">recipient_email *</p>
                <p className="text-sm text-muted-foreground">Email address of the recipient (Required)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">course_name *</p>
                <p className="text-sm text-muted-foreground">Name of the course/program (Required)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">organization_name *</p>
                <p className="text-sm text-muted-foreground">Name of the issuing organization (Required)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">issue_date *</p>
                <p className="text-sm text-muted-foreground">Date of issuance (YYYY-MM-DD) (Required)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">batch_name</p>
                <p className="text-sm text-muted-foreground">Batch name (Optional)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">expiration_date</p>
                <p className="text-sm text-muted-foreground">Expiration date (YYYY-MM-DD) (Optional)</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="font-semibold text-foreground mb-1">additional_info</p>
                <p className="text-sm text-muted-foreground">Additional information (Optional)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BulkUpload;
