import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Award, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Upload, 
  Plus,
  Search,
  Download,
  BookOpen
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import { clearAdminSession } from "@/lib/admin-auth";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    {
      label: "Total Issued",
      value: "0",
      icon: Award,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Verified",
      value: "0",
      icon: CheckCircle2,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Revoked",
      value: "0",
      icon: XCircle,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
    },
    {
      label: "Views",
      value: "0",
      icon: Eye,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
  ]);

  const [recentCertificates, setRecentCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, certificatesResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/certificates/stats`),
        axios.get(`${API_BASE_URL}/api/certificates`),
      ]);

      // Update stats
      const statsData = statsResponse.data;
      setStats([
        {
          label: "Total Issued",
          value: statsData.totalIssued.toLocaleString(),
          icon: Award,
          color: "text-primary",
          bgColor: "bg-primary/10",
        },
        {
          label: "Verified",
          value: statsData.verified.toLocaleString(),
          icon: CheckCircle2,
          color: "text-accent",
          bgColor: "bg-accent/10",
        },
        {
          label: "Revoked",
          value: statsData.revoked.toLocaleString(),
          icon: XCircle,
          color: "text-destructive",
          bgColor: "bg-destructive/10",
        },
        {
          label: "Views",
          value: statsData.views.toLocaleString(),
          icon: Eye,
          color: "text-primary",
          bgColor: "bg-primary/10",
        },
      ]);

      // Update certificates
      const certificates = certificatesResponse.data.map((cert: any) => ({
        id: cert.certificateId,
        recipient: cert.recipientName,
        course: cert.courseName,
        date: new Date(cert.issueDate).toLocaleDateString(),
        status: cert.status || 'active',
      }));
      setRecentCertificates(certificates);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCertificates = recentCertificates.filter((cert) =>
    cert.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLogout = () => {
    clearAdminSession();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage and track your certificates</p>
            </div>
            <div className="flex gap-2">
              <Link to="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-sm font-medium">
                    {stat.label}
                  </CardDescription>
                  <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Button asChild size="lg" className="h-auto py-6">
            <Link to="/admin/issue">
              <div className="flex flex-col items-center gap-2">
                <Plus className="w-6 h-6" />
                <span>Issue Certificate</span>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-auto py-6">
            <Link to="/admin/bulk">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6" />
                <span>Bulk Upload</span>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-auto py-6">
            <Link to="/verify">
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                <span>Verify Certificate</span>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-auto py-6">
            <Link to="/admin/courses">
              <div className="flex flex-col items-center gap-2">
                <BookOpen className="w-6 h-6" />
                <span>Courses</span>
              </div>
            </Link>
          </Button>
        </div>

        {/* Recent Certificates */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Certificates</CardTitle>
                <CardDescription>Latest issued certificates</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search certificates..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading certificates...</div>
            ) : filteredCertificates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchTerm ? "No certificates found matching your search." : "No certificates issued yet."}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <p className="font-semibold text-foreground">{cert.id}</p>
                      <Badge variant={cert.status === "active" ? "default" : "destructive"}>
                        {cert.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground">{cert.recipient}</p>
                    <p className="text-sm text-muted-foreground">{cert.course}</p>
                  </div>
                  <div className="text-right space-y-2">
                    <p className="text-sm text-muted-foreground">{cert.date}</p>
                    <Button variant="outline" size="sm" asChild>
                      <Link to={`/certificate/${cert.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
