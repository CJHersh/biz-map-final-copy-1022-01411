import { useState } from "react";
import { CheckCircle2, Circle, Lock, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import SetupPhaseContent from "@/components/SetupPhaseContent";

type PhaseStatus = "completed" | "current" | "not-started" | "locked";

interface SetupPhase {
  id: string;
  number: number;
  title: string;
  status: PhaseStatus;
  progress: number;
}

const setupPhases: SetupPhase[] = [
  { id: "foundation", number: 1, title: "Foundation", status: "completed", progress: 100 },
  { id: "data-integration", number: 2, title: "Data Integration", status: "current", progress: 60 },
  { id: "decision-logic", number: 3, title: "Decision Logic", status: "not-started", progress: 0 },
  { id: "business-config", number: 4, title: "Business Config", status: "locked", progress: 0 },
  { id: "workflows", number: 5, title: "Workflows", status: "locked", progress: 0 },
  { id: "testing", number: 6, title: "Testing", status: "locked", progress: 0 },
  { id: "go-live", number: 7, title: "Go Live", status: "locked", progress: 0 },
];

export default function Setup() {
  const [selectedPhase, setSelectedPhase] = useState<string>("foundation");

  const phase1Data = {
    phaseNumber: 1,
    phaseTitle: "Foundation Setup",
    phaseStatus: "complete" as const,
    phaseDescription: "Build the foundational platform configuration before connecting data and creating decisioning logic.",
    steps: [
      {
        id: "1.1",
        number: "1.1",
        title: "Organizational Structure",
        status: "complete" as const,
        description: "Set up your organizational hierarchy, business units, and access control.",
        configured: [
          "Created 3 Operating Units: Retail Banking, Commercial, Wealth Mgmt",
          "Defined 8 Strategy Units across business lines",
          "Configured SSO via Okta",
          "Set up 6 user roles with RBAC",
        ],
        responsible: "Enterprise Architect, System Admin",
        completedDate: "Jan 15, 2024",
        completedBy: "Sarah Johnson",
        actions: [
          { label: "View Details", onClick: () => console.log("View details") },
          { label: "Edit Configuration", onClick: () => console.log("Edit config") },
          { label: "View Audit Log", onClick: () => console.log("View audit") },
        ],
      },
      {
        id: "1.2",
        number: "1.2",
        title: "Environment Configuration",
        status: "complete" as const,
        description: "Configure development, test, and production environments.",
        configured: [
          "Development environment: dev.nova.yourbank.com",
          "Staging environment: stage.nova.yourbank.com",
          "Production environment: nova.yourbank.com",
          "Set up promotion workflows with approval gates",
        ],
        responsible: "System Admin",
        completedDate: "Jan 18, 2024",
        completedBy: "Mike Chen",
        actions: [
          { label: "View Details", onClick: () => console.log("View details") },
          { label: "Manage Environments", onClick: () => console.log("Manage envs") },
        ],
      },
      {
        id: "1.3",
        number: "1.3",
        title: "Business Hierarchy Definition",
        status: "complete" as const,
        description: "Create your business map: domains, products, and the taxonomy that organizes all NBA decisioning.",
        configured: [
          "4 Business Domains: Acquisition, Retention, Growth, Risk Management",
          "12 Products across domains",
          "Business hierarchy structure approved by stakeholders",
        ],
        note: "Actions will be created in Phase 4 after decision logic is ready",
        responsible: "Product Manager",
        completedDate: "Jan 25, 2024",
        completedBy: "Lisa Wang",
        actions: [
          { label: "View Business Hierarchy", onClick: () => console.log("View hierarchy") },
          { label: "Edit Structure", onClick: () => console.log("Edit structure") },
        ],
      },
      {
        id: "1.4",
        number: "1.4",
        title: "Customer Profile Schema",
        status: "complete" as const,
        description: "Define the internal customer data model that NOVA will use for decisioning. This is your \"single source of truth\" schema.",
        configured: [
          "85 core customer attributes (demographics, products, behaviors)",
          "42 calculated features for decisioning",
          "Extensible object model for custom attributes",
          "Data quality rules and validation logic",
        ],
        note: "This schema will be mapped to your external data sources in Phase 2",
        responsible: "Data Architect, Solution Architect",
        completedDate: "Feb 1, 2024",
        completedBy: "David Park",
        actions: [
          { label: "View Schema", onClick: () => console.log("View schema") },
          { label: "Export Documentation", onClick: () => console.log("Export docs") },
          { label: "Edit Schema", onClick: () => console.log("Edit schema") },
        ],
      },
    ],
    nextPhaseAction: {
      label: "Continue to Phase 2: Data Integration →",
      onClick: () => setSelectedPhase("data-integration"),
    },
  };

  const overallProgress = Math.round(
    setupPhases.reduce((sum, phase) => sum + phase.progress, 0) / setupPhases.length
  );

  const getStatusIcon = (status: PhaseStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "current":
        return <Circle className="h-5 w-5 text-primary fill-primary" />;
      case "locked":
        return <Lock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusText = (phase: SetupPhase) => {
    if (phase.status === "completed") return "100% Complete";
    if (phase.status === "current") return `${phase.progress}% Complete`;
    if (phase.status === "locked") return "Locked";
    return "Not Started";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-4">
            <Rocket className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Platform Setup</h1>
          </div>
          
          <p className="text-muted-foreground mb-8 max-w-3xl">
            Welcome! Let's get your Next Best Action platform configured and ready to deliver personalized customer experiences.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Overall Progress: {overallProgress}% Complete</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm text-muted-foreground">
              <span>Estimated Time Remaining: 8–12 weeks</span>
              <span>Last Activity: 2 hours ago by John Smith</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Setup Phases */}
          <Card className="lg:col-span-1 p-6 h-fit">
            <h2 className="text-lg font-semibold mb-6 text-foreground">SETUP PHASES</h2>
            
            <div className="space-y-1">
              {setupPhases.map((phase) => (
                <button
                  key={phase.id}
                  onClick={() => phase.status !== "locked" && setSelectedPhase(phase.id)}
                  disabled={phase.status === "locked"}
                  className={cn(
                    "w-full text-left p-3 rounded-lg transition-colors",
                    selectedPhase === phase.id && "bg-accent",
                    phase.status === "locked" ? "opacity-50 cursor-not-allowed" : "hover:bg-accent/50 cursor-pointer"
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getStatusIcon(phase.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {phase.number}. {phase.title}
                        </span>
                        {selectedPhase === phase.id && phase.status === "current" && (
                          <Badge variant="secondary" className="text-xs">YOU ARE HERE</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {getStatusText(phase)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t space-y-2">
              <button className="w-full text-left p-2 rounded hover:bg-accent/50 text-sm text-foreground transition-colors">
                📋 View Setup Checklist
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-accent/50 text-sm text-foreground transition-colors">
                👥 Assign Team Members
              </button>
              <button className="w-full text-left p-2 rounded hover:bg-accent/50 text-sm text-foreground transition-colors">
                📥 Import Configuration
              </button>
            </div>
          </Card>

          {/* Right Content Area */}
          <Card className="lg:col-span-3 p-8">
            {selectedPhase === "foundation" ? (
              <SetupPhaseContent {...phase1Data} />
            ) : (
              <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="text-center text-muted-foreground">
                  <p className="text-lg">Content for {setupPhases.find(p => p.id === selectedPhase)?.title} will appear here</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
