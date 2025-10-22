import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, CheckCircle2, Circle, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import type { PolicyArtifact } from "@/pages/ActionForm";

// Mock data for demonstration
const MOCK_ARTIFACTS: PolicyArtifact[] = [
  {
    id: "1",
    name: "Credit Score Ruleset",
    description: "Rules for evaluating customer credit scores and determining eligibility",
    type: "ruleset",
    version: "2.1.0",
    lastUpdated: new Date("2024-01-15"),
  },
  {
    id: "2",
    name: "Customer Segmentation Tree",
    description: "Decision tree for categorizing customers based on behavior and demographics",
    type: "decision-tree",
    version: "1.5.2",
    lastUpdated: new Date("2024-02-01"),
  },
  {
    id: "3",
    name: "Risk Assessment Scorecard",
    description: "Comprehensive scorecard for assessing customer risk profiles",
    type: "scorecard",
    version: "3.0.1",
    lastUpdated: new Date("2024-01-20"),
  },
  {
    id: "4",
    name: "Churn Prediction Model",
    description: "ML model for predicting customer churn likelihood",
    type: "ml-model",
    version: "1.2.0",
    lastUpdated: new Date("2024-02-10"),
  },
  {
    id: "5",
    name: "Offer Timing Optimization",
    description: "ML model for determining optimal timing for customer offers",
    type: "ml-model",
    version: "2.0.0",
    lastUpdated: new Date("2024-02-15"),
  },
  {
    id: "6",
    name: "Income Verification Rules",
    description: "Ruleset for verifying and validating customer income information",
    type: "ruleset",
    version: "1.8.0",
    lastUpdated: new Date("2024-01-25"),
  },
];

interface PolicySelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (artifacts: PolicyArtifact[]) => void;
  type: "communication" | "eligibility";
  context: "domain" | "product" | "action";
}

type ArtifactType = "all" | PolicyArtifact["type"];

export const PolicySelector = ({ open, onOpenChange, onSelect, type, context }: PolicySelectorProps) => {
  const [selectedType, setSelectedType] = useState<ArtifactType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtifacts, setSelectedArtifacts] = useState<Set<string>>(new Set());

  const filteredArtifacts = MOCK_ARTIFACTS.filter((artifact) => {
    const matchesType = selectedType === "all" || artifact.type === selectedType;
    const matchesSearch =
      searchQuery === "" ||
      artifact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artifact.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleToggleArtifact = (artifactId: string) => {
    const newSelected = new Set(selectedArtifacts);
    if (newSelected.has(artifactId)) {
      newSelected.delete(artifactId);
    } else {
      newSelected.add(artifactId);
    }
    setSelectedArtifacts(newSelected);
  };

  const handleConfirm = () => {
    const artifacts = MOCK_ARTIFACTS.filter((a) => selectedArtifacts.has(a.id));
    onSelect(artifacts);
    setSelectedArtifacts(new Set());
    setSearchQuery("");
    setSelectedType("all");
    onOpenChange(false);
  };

  const handleClose = () => {
    setSelectedArtifacts(new Set());
    setSearchQuery("");
    setSelectedType("all");
    onOpenChange(false);
  };

  const getTypeColor = (artifactType: PolicyArtifact["type"]) => {
    switch (artifactType) {
      case "ruleset":
        return "bg-blue-500/10 text-blue-700 border-blue-200";
      case "decision-tree":
        return "bg-green-500/10 text-green-700 border-green-200";
      case "scorecard":
        return "bg-purple-500/10 text-purple-700 border-purple-200";
      case "ml-model":
        return "bg-orange-500/10 text-orange-700 border-orange-200";
    }
  };

  const formatType = (artifactType: PolicyArtifact["type"]) => {
    return artifactType.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select {type === "communication" ? "Communication" : "Eligibility"} Policies</DialogTitle>
          <DialogDescription>
            {context === "domain" ? (
              <>
                Choose artifacts to define {type === "communication" ? "how to communicate" : "who is eligible for"} this domain.{" "}
                <strong>These policies will be inherited by all child products and actions.</strong>
              </>
            ) : context === "product" ? (
              <>
                Choose artifacts to define {type === "communication" ? "how to communicate" : "who is eligible for"} this product.{" "}
                <strong>These policies will be inherited by all child actions.</strong>
              </>
            ) : (
              <>
                Choose artifacts to define {type === "communication" ? "how to communicate" : "who is eligible for"} this action.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artifacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
            >
              All
            </Button>
            <Button
              size="sm"
              variant={selectedType === "ruleset" ? "default" : "outline"}
              onClick={() => setSelectedType("ruleset")}
            >
              Rulesets
            </Button>
            <Button
              size="sm"
              variant={selectedType === "decision-tree" ? "default" : "outline"}
              onClick={() => setSelectedType("decision-tree")}
            >
              Decision Trees
            </Button>
            <Button
              size="sm"
              variant={selectedType === "scorecard" ? "default" : "outline"}
              onClick={() => setSelectedType("scorecard")}
            >
              Scorecards
            </Button>
            <Button
              size="sm"
              variant={selectedType === "ml-model" ? "default" : "outline"}
              onClick={() => setSelectedType("ml-model")}
            >
              ML Models
            </Button>
          </div>

          {/* Artifacts List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-2">
              {/* Add New Option */}
              <button
                onClick={() => {
                  toast({
                    title: "Coming Soon",
                    description: "Create new artifact functionality will be available soon",
                  });
                }}
                className="w-full text-left p-4 rounded-lg border-2 border-dashed border-primary/50 hover:border-primary hover:bg-primary/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-primary">Add New Artifact</h4>
                    <p className="text-xs text-muted-foreground">Create a custom {type === "communication" ? "communication" : "eligibility"} policy artifact</p>
                  </div>
                </div>
              </button>

              {/* Existing Artifacts */}
              {filteredArtifacts.map((artifact) => (
                <button
                  key={artifact.id}
                  onClick={() => handleToggleArtifact(artifact.id)}
                  className="w-full text-left p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {selectedArtifacts.has(artifact.id) ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{artifact.name}</h4>
                        <Badge variant="outline" className={getTypeColor(artifact.type)}>
                          {formatType(artifact.type)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{artifact.description}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>v{artifact.version}</span>
                        <span>•</span>
                        <span>Updated {artifact.lastUpdated.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredArtifacts.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No artifacts found</p>
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {selectedArtifacts.size} artifact{selectedArtifacts.size !== 1 ? "s" : ""} selected
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm} disabled={selectedArtifacts.size === 0}>
                Add Selected
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
