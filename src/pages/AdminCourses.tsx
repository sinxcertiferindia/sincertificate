import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { GraduationCap, Users, RefreshCw } from "lucide-react";

type StudentEntry = {
  id: string;
  name: string;
  issueDate: string;
  status: string;
};

const AdminCourses = () => {
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCertificates = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("http://localhost:5000/api/certificates");
      setCertificates(data);
      setError(null);
    } catch (err: any) {
      console.error("Failed to load courses:", err);
      setError(err.response?.data?.message || "Unable to load course data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const groupedCourses = useMemo(() => {
    const groups: Record<
      string,
      {
        organization?: string;
        students: StudentEntry[];
      }
    > = {};

    certificates.forEach((cert) => {
      const courseName = cert.courseName || "Untitled Course";
      if (!groups[courseName]) {
        groups[courseName] = {
          organization: cert.organizationName,
          students: [],
        };
      }

      groups[courseName].students.push({
        id: cert.certificateId,
        name: cert.recipientName,
        issueDate: cert.issueDate,
        status: cert.status || "active",
      });
    });

    return Object.entries(groups)
      .map(([course, details]) => ({
        course,
        organization: details.organization,
        students: details.students.sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .filter(({ course }) => course.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [certificates, searchTerm]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Admin &gt; Courses</p>
            <h1 className="text-2xl font-bold text-foreground">Courses Overview</h1>
            <p className="text-muted-foreground">Click a course to view enrolled students.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchCertificates} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button asChild>
              <Link to="/admin">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">All Courses</h2>
            <p className="text-sm text-muted-foreground">
              Data is generated directly from issued student certificates.
            </p>
          </div>
          <Input
            placeholder="Search courses..."
            className="md:max-w-sm"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">Loading course information...</CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-destructive">Something went wrong</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={fetchCertificates}>Retry</Button>
            </CardContent>
          </Card>
        ) : groupedCourses.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted-foreground">
              No courses available yet. Issue certificates to see student courses here.
            </CardContent>
          </Card>
        ) : (
          <Accordion type="single" collapsible className="space-y-3">
            {groupedCourses.map(({ course, organization, students }, index) => (
              <AccordionItem key={`${course}-${index}`} value={`${course}-${index}`}>
                <AccordionTrigger className="px-4">
                  <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-foreground">{course}</p>
                        {organization && (
                          <p className="text-xs text-muted-foreground">Offered by {organization}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      <Users className="h-4 w-4 mr-1" />
                      {students.length} students
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <Card className="border-l-4 border-primary/40">
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {students.map((student) => (
                          <div
                            key={student.id}
                            className="flex flex-col gap-2 rounded-lg border px-4 py-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="font-medium text-foreground">{student.name}</p>
                              <p className="text-xs text-muted-foreground">Cert ID: {student.id}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 md:items-center">
                              <Badge variant={student.status === "active" ? "default" : "destructive"}>
                                {student.status}
                              </Badge>
                              <p className="text-sm text-muted-foreground">
                                Issued on {new Date(student.issueDate).toLocaleDateString()}
                              </p>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/certificate/${student.id}`}>View certificate</Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;

