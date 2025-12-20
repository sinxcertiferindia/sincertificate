import { FormEvent, useMemo, useState } from "react";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Copy, Loader2, Search, Share2, ShieldCheck, Download, Award } from "lucide-react";

type CertificateRecord = {
  certificateId: string;
  recipientName: string;
  recipientEmail: string;
  courseName: string;
  batchName?: string;
  organizationName: string;
  issueDate: string;
  status: string;
};

const StudentCertificates = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [course, setCourse] = useState("");
  const [results, setResults] = useState<CertificateRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const hasSearchParams = useMemo(() => Boolean(name || email || course), [name, email, course]);

  const handleSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSearchParams) {
      setError("Enter at least one field (name, email, or course).");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (name) params.append("name", name.trim());
      if (email) params.append("email", email.trim());
      if (course) params.append("course", course.trim());

      const { data } = await axios.get<CertificateRecord[]>(`${API_BASE_URL}/certificates/search?${params.toString()}`);
      setResults(data);

      if (data.length === 0) {
        toast({
          title: "No certificates found",
          description: "Try refining your search terms or check with your admin.",
        });
      }
    } catch (err: any) {
      console.error("Student search failed:", err);
      setError(err.response?.data?.message || "Unable to search certificates right now.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = async (certificateId: string) => {
    try {
      await navigator.clipboard.writeText(certificateId);
      toast({
        title: "Password copied",
        description: "Use this password on the verification page or when asked by your admin.",
      });
    } catch {
      toast({
        title: "Copy failed",
        description: "Select the password text manually and copy it.",
        variant: "destructive",
      });
    }
  };

  const handleShareToLinkedIn = (certificate: CertificateRecord) => {
    const certificateUrl = `${window.location.origin}/certificate/${certificate.certificateId}`;

    const shareText = `🎓 Proud to announce I completed "${certificate.courseName}" with ${certificate.organizationName}!

Certificate ID: ${certificate.certificateId}
Issued on: ${new Date(certificate.issueDate).toLocaleDateString()}
${certificate.batchName ? `Batch: ${certificate.batchName}\n` : ""}
Verify here: ${certificateUrl}

#Certificate #${certificate.organizationName.replace(/\s+/g, "")}`;

    navigator.clipboard.writeText(shareText).catch(() => undefined);

    const issueDate = new Date(certificate.issueDate);
    const linkedInUrl = new URL("https://www.linkedin.com/profile/add");
    linkedInUrl.searchParams.set("startTask", "CERTIFICATION_NAME");
    linkedInUrl.searchParams.set("name", certificate.courseName);
    linkedInUrl.searchParams.set("organizationName", certificate.organizationName || "");
    linkedInUrl.searchParams.set("certUrl", certificateUrl);
    linkedInUrl.searchParams.set("certId", certificate.certificateId);
    linkedInUrl.searchParams.set("issueYear", issueDate.getFullYear().toString());
    linkedInUrl.searchParams.set("issueMonth", (issueDate.getMonth() + 1).toString());

    window.open(
      linkedInUrl.toString(),
      "linkedin-certification",
      "width=900,height=700,menubar=no,toolbar=no,resizable=yes,scrollbars=yes"
    );

    toast({
      title: "LinkedIn ready",
      description: "We copied a caption. Just paste it into the LinkedIn form that opened.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Student Portal</p>
            <h1 className="text-3xl font-bold text-foreground">Find Your Certificate</h1>
            <p className="text-muted-foreground">
              Search using your name, registered email, or course title to download and share your certificate.
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/">Home</Link>
            </Button>
            <Button asChild>
              <Link to="/verify">Verify Certificate</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-10 space-y-8 max-w-5xl">
        <Card>
          <CardHeader>
            <CardTitle>Search your certificate</CardTitle>
            <CardDescription>Provide any combination of the fields below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSearch}>
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
              <Input
                type="email"
                placeholder="Email used on certificate"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <Input
                placeholder="Course Name"
                value={course}
                onChange={(event) => setCourse(event.target.value)}
              />
              <div className="md:col-span-3 flex flex-wrap gap-3">
                <Button type="submit" disabled={loading} className="flex items-center gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  {loading ? "Searching..." : "Search Certificates"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setName("");
                    setEmail("");
                    setCourse("");
                    setResults([]);
                    setError(null);
                  }}
                >
                  Clear
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            </form>
          </CardContent>
        </Card>

        {hasSearchParams && !loading && results.length === 0 && !error && (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No certificates match your query yet. Double-check the spelling or reach out to your training admin.
            </CardContent>
          </Card>
        )}

        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((certificate) => (
              <Card key={certificate.certificateId} className="border-2 border-primary/10">
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Award className="h-5 w-5 text-primary" />
                      {certificate.courseName}
                    </CardTitle>
                    <CardDescription>
                      Issued to <span className="font-semibold text-foreground">{certificate.recipientName}</span>
                    </CardDescription>
                  </div>
                  <Badge variant={certificate.status === "active" ? "default" : "destructive"}>
                    {certificate.status === "active" ? "Active" : "Revoked"}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Email</p>
                      <p className="font-medium text-foreground">{certificate.recipientEmail}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Issued On</p>
                      <p className="font-medium text-foreground">
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border bg-muted/50 p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      Certificate Password
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <code className="rounded bg-background px-3 py-1 text-sm font-semibold text-foreground">
                        {certificate.certificateId}
                      </code>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleCopyPassword(certificate.certificateId)}
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Use this password/ID whenever you need to verify or download your certificate.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button asChild className="flex items-center gap-2">
                      <Link to={`/certificate/${certificate.certificateId}`}>
                        <Download className="h-4 w-4" />
                        View & Download
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleShareToLinkedIn(certificate)}
                    >
                      <Share2 className="h-4 w-4" />
                      Add to LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCertificates;

