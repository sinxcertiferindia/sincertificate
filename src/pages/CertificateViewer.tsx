import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Share2, Image as ImageIcon, Award, CheckCircle2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import axios from "axios";
const API_BASE_URL = import.meta.env.VITE_API_URL;
import sinLogo from "../../Assests/SIN.png";
import accreditationOne from "../../Assests/logo1.png";
import accreditationTwo from "../../Assests/logo2.png";
import accreditationThree from "../../Assests/logo3.png";
import sinSeal from "../../Assests/SIN Seal.jpg";
// Import PNG files with ?url to handle them as assets
import ceoSign from "../../Assests/CEO_Sign (1).PNG?url";
import choSign from "../../Assests/CHO_Sign.PNG?url";

const CertificateViewer = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const certificateRef = useRef<HTMLDivElement>(null);
  const [certificate, setCertificate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [sharingToLinkedIn, setSharingToLinkedIn] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCertificate();
    }
  }, [id]);

  // Update page title and meta tags when certificate loads
  useEffect(() => {
    if (certificate) {
      document.title = `${certificate.recipientName} - Certificate of Completion | CertifyPro`;
      
      // Update Open Graph meta tags for better LinkedIn sharing
      const updateMetaTag = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('property', property);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      updateMetaTag('og:title', `${certificate.recipientName} - Certificate of Completion`);
      updateMetaTag('og:description', `Successfully completed ${certificate.courseName} from ${certificate.organizationName}`);
      updateMetaTag('og:url', window.location.href);
      updateMetaTag('og:type', 'website');
    }
  }, [certificate]);

  const fetchCertificate = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/certificates/${id}`);
      setCertificate(response.data);
    } catch (error: any) {
      console.error('Error fetching certificate:', error);
      setError(error.response?.data?.message || 'Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <div className="text-center">
          <div className="text-muted-foreground">Loading certificate...</div>
        </div>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8 max-w-md">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold text-foreground">Certificate Not Found</h2>
            <p className="text-muted-foreground">{error || "The certificate you're looking for doesn't exist."}</p>
            <div className="flex gap-4 justify-center">
              <Button asChild>
                <Link to="/verify">Verify Another</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/">Home</Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = date.toLocaleDateString('en-US', { month: 'long' }).toUpperCase();
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  const generateCertificateImage = async (): Promise<string | null> => {
    if (!certificateRef.current) return null;

    try {
      setGeneratingImage(true);
      
      // Generate canvas from certificate element
      const canvas = await html2canvas(certificateRef.current, {
        backgroundColor: '#fdfaf4',
        scale: 2, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Convert canvas to data URL (image)
      const imageDataUrl = canvas.toDataURL('image/png', 1.0);
      return imageDataUrl;
    } catch (error) {
      console.error('Error generating certificate image:', error);
      toast({
        title: "Error Generating Image",
        description: "Failed to generate certificate image. Please try again.",
        variant: "destructive",
      });
      return null;
    } finally {
      setGeneratingImage(false);
    }
  };

  const downloadCertificateImage = async () => {
    const imageDataUrl = await generateCertificateImage();
    if (!imageDataUrl) return;

    try {
      // Create download link
      const link = document.createElement('a');
      link.download = `certificate-${certificate.certificateId}.png`;
      link.href = imageDataUrl;
      link.click();

      toast({
        title: "Certificate Downloaded!",
        description: "Your certificate image has been downloaded.",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download certificate image.",
        variant: "destructive",
      });
    }
  };

  const handleLinkedInShare = async () => {
    if (!certificate) return;

    try {
      setSharingToLinkedIn(true);
      const certificateUrl = window.location.href;
      const shareText = `🎓 I'm excited to share that I've successfully completed "${certificate.courseName}" from ${certificate.organizationName}!

✅ Certificate ID: ${certificate.certificateId}
📅 Issued on: ${formatDate(certificate.issueDate)}
${certificate.batchName ? `📚 Batch: ${certificate.batchName}` : ""}

Verify my certificate: ${certificateUrl}

#Certificate #Achievement #${certificate.organizationName.replace(/\s+/g, "")}`;

      try {
        await navigator.clipboard.writeText(shareText);
        toast({
          title: "Details ready!",
          description: "Certificate info copied. Paste it directly in LinkedIn.",
        });
      } catch (clipboardError) {
        console.error("Clipboard error:", clipboardError);
        toast({
          title: "Copy skipped",
          description: "Could not copy details automatically. Copy them manually from the viewer.",
          variant: "destructive",
        });
      }

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
    } catch (err) {
      console.error("Error in LinkedIn share:", err);
      toast({
        title: "LinkedIn unavailable",
        description: "We couldn't open the LinkedIn certificate form. Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setSharingToLinkedIn(false);
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
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Certificate Details</h1>
                <p className="text-sm text-muted-foreground">View and download certificate</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/verify">
                <Button variant="outline">Verify Another</Button>
              </Link>
              <Link to="/">
                <Button variant="outline">Home</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex flex-col items-center">
        {/* Certificate Preview */}
        <div
          ref={certificateRef}
          className="overflow-hidden relative"
          style={{
            width: '794px',
            height: '1123px',
            backgroundColor: '#fdfaf4',
            border: '14px solid #7c0c0c',
          }}
        >
          <div
            className="absolute inset-6 border border-[#7c0c0c]"
            style={{ pointerEvents: 'none' }}
          ></div>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${sinLogo})`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              backgroundSize: '80%',
              opacity: 0.05,
              filter: 'grayscale(1) sepia(1) hue-rotate(330deg) saturate(6) brightness(0.85)',
            }}
          ></div>
          <div className="relative z-10 h-full w-full flex flex-col items-center text-center px-10 py-12">
            {/* Top Logo */}
            <img
              src={sinLogo}
              alt="SIN School of AI"
              className="w-48 h-auto mb-6"
              // style={{ filter: 'invert(14%) sepia(78%) saturate(3704%) hue-rotate(350deg) brightness(82%) contrast(100%)' }}
            />
            <h2
              className="text-3xl font-bold tracking-[0.1em] mb-6"
              style={{ color: '#7c0c0c', fontFamily: 'Cinzel, serif' }}
            >
              SCHOOL OF AI
            </h2>
            <p
              className="text-base leading-relaxed mb-10"
              style={{
                fontFamily: 'Cormorant Garamond, serif',
                color: '#4a3b35',
                maxWidth: '600px',
              }}
            >
              The Department of AI & ML at SIN Education & Technology initiative School of AI hereby certify that
            </p>
            {/* Recipient */}
            <div className="relative mb-6 w-full flex flex-col items-center">
              <h3
                className="text-6xl mb-3"
                style={{
                  fontFamily: 'Great Vibes, cursive',
                  color: '#7c0c0c',
                  fontWeight: 400,
                }}
              >
                {certificate.recipientName}
              </h3>
              <p
                className="text-sm tracking-[0.1em]"
                style={{ fontFamily: 'Cinzel, serif', color: '#4a3b35' }}
              >
                {certificate.certificateId}
              </p>
            </div>
            {/* Description */}
            <p
              className="text-lg mb-6 px-6 leading-relaxed"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: '#4a3b35' }}
            >
              For Successfully completion of the{' '}
              <span className="font-semibold uppercase" style={{ fontFamily: 'Cinzel, serif' }}>
                {certificate.courseName}
              </span>{' '}
              Course and completed all the major and minor projects with full professionalism and dedication
            </p>
            {/* Date */}
            <p
              className="text-xl font-bold  mb-8"
              style={{ fontFamily: 'Cinzel, serif', color: '#4a3b35' }}
            >
              {formatDate(certificate.issueDate)}
            </p>
            {/* Accreditation Logos */}
            <div className="flex items-center justify-center gap-8 mb-20">
              {[accreditationOne, accreditationTwo, accreditationThree].map((logo, index) => (
                <div
                  key={logo + index}
                  className="w-20 h-20 border border-[#4a3b35] rounded-full flex items-center justify-center p-2 bg-white"
                >
                  <img src={logo} alt="Accreditation" className="max-w-full max-h-full object-contain" />
                </div>
              ))}
            </div>
            {/* SIN Seal */}
            <div className="flex items-center justify-center mb-8">
              <img
                src={sinSeal}
                alt="SIN Seal"
                className="w-32 h-32 object-contain"
              />
            </div>
            {/* Signatures */}
            <div className="grid grid-cols-2 gap-10 mt-auto w-full">
              {/* Left Signature - CEO */}
              <div className="text-center">
                <img
                  src={ceoSign}
                  alt="CEO Signature"
                  className="h-16 w-auto mx-auto mb-3 object-contain"
                />
                <div className="border-t border-[#4a3b35] w-48 mx-auto mb-3"></div>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: 'Cinzel, serif', color: '#4a3b35' }}
                >
                  ER HARSHVARDHAN PUROHIT
                </p>
                <p
                  className="text-xs tracking-[0.3em]"
                  style={{ fontFamily: 'Cinzel, serif', color: '#4a3b35' }}
                >
                  DIRECTOR
                </p>
                <p
                  className="text-xs"
                  style={{ fontFamily: 'Cormorant Garamond, serif', color: '#4a3b35' }}
                >
                  SIN SCHOOL OF AI
                </p>
              </div>
              {/* Right Signature - CHO */}
              <div className="text-center">
                <img
                  src={choSign}
                  alt="CHO Signature"
                  className="h-20 w-auto  mx-auto  object-contain"
                />
                <div className="border-t border-[#4a3b35] w-48 mx-auto mb-3"></div>
                <p
                  className="text-sm font-semibold"
                  style={{ fontFamily: 'Cinzel, serif', color: '#4a3b35' }}
                >
                  SHIV PRAKASH BOHRA
                </p>
                <p
                  className="text-xs tracking-[0.3em]"
                  style={{ fontFamily: 'Cinzel, serif', color: '#4a3b35' }}
                >
                  CFO
                </p>
                <p
                  className="text-xs"
                  style={{ fontFamily: 'Cormorant Garamond, serif', color: '#4a3b35' }}
                >
                  SIN TECHNOLOGIES
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full max-w-4xl px-4 mt-8">
          <div className="grid gap-4 md:grid-cols-4">
            <Button 
              size="lg" 
              className="h-auto py-4"
              onClick={downloadCertificateImage}
              disabled={generatingImage || !certificate}
            >
              <ImageIcon className="w-5 h-5 mr-2" />
              {generatingImage ? "Generating..." : "Download Image"}
            </Button>
            <Button 
              size="lg" 
              className="h-auto py-4"
              variant="outline"
            >
              <Download className="w-5 h-5 mr-2" />
              Download PDF
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-auto py-4"
              onClick={handleLinkedInShare}
              disabled={sharingToLinkedIn || !certificate}
            >
              <Share2 className="w-5 h-5 mr-2" />
              {sharingToLinkedIn ? "Opening LinkedIn..." : "Add to LinkedIn"}
            </Button>
            <Button variant="outline" size="lg" asChild className="h-auto py-4">
              <Link to="/verify">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Verify Certificate
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateViewer;
