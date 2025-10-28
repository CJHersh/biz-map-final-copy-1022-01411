import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Globe } from "lucide-react";
import { PolicySelector } from "@/components/PolicySelector";
import { PolicyCard } from "@/components/PolicyCard";
import { toast } from "@/hooks/use-toast";
import type { GlobalPolicies } from "@/hooks/use-business-map";
import type { PolicyArtifact } from "@/pages/ActionForm";

interface GlobalPoliciesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  globalPolicies: GlobalPolicies;
  onSave: (policies: GlobalPolicies) => void;
}

export const GlobalPoliciesSheet = ({
  open,
  onOpenChange,
  globalPolicies,
  onSave,
}: GlobalPoliciesSheetProps) => {
  const [communicationPolicies, setCommunicationPolicies] = useState<PolicyArtifact[]>([]);
  const [triggerLogic, setTriggerLogic] = useState<PolicyArtifact[]>([]);
  const [showPolicySelector, setShowPolicySelector] = useState(false);
  const [policyType, setPolicyType] = useState<"communication" | "trigger">("communication");

  // Parse global policies when sheet opens
  useEffect(() => {
    if (open) {
      // Parse communication policies
      if (globalPolicies.communicationPolicy) {
        const commPolicies = globalPolicies.communicationPolicy
          .split(", ")
          .filter((p) => p)
          .map((name) => ({
            id: `global-comm-${name}`,
            name,
            description: "Global communication policy",
            type: "ruleset" as const,
            version: "1.0",
            lastUpdated: new Date(),
          }));
        setCommunicationPolicies(commPolicies);
      }
      // Parse trigger logic
      if (globalPolicies.triggerLogic) {
        const triggerPolicies = globalPolicies.triggerLogic
          .split(", ")
          .filter((p) => p)
          .map((name) => ({
            id: `global-trigger-${name}`,
            name,
            description: "Global trigger logic",
            type: "ruleset" as const,
            version: "1.0",
            lastUpdated: new Date(),
          }));
        setTriggerLogic(triggerPolicies);
      }
    }
  }, [open, globalPolicies]);

  const handleAddPolicy = (artifacts: PolicyArtifact[]) => {
    if (policyType === "communication") {
      setCommunicationPolicies([...communicationPolicies, ...artifacts]);
    } else {
      setTriggerLogic([...triggerLogic, ...artifacts]);
    }
  };

  const handleRemovePolicy = (type: "communication" | "trigger", artifactId: string) => {
    if (type === "communication") {
      setCommunicationPolicies(communicationPolicies.filter((p) => p.id !== artifactId));
    } else {
      setTriggerLogic(triggerLogic.filter((p) => p.id !== artifactId));
    }
  };

  const handleSave = () => {
    onSave({
      communicationPolicy: communicationPolicies.map((p) => p.name).join(", "),
      triggerLogic: triggerLogic.map((p) => p.name).join(", "),
      updatedAt: new Date(),
    });
    toast({
      title: "Global Policies Updated",
      description: "Your global policies have been saved and will be inherited by all domains, products, and actions.",
    });
    onOpenChange(false);
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <SheetTitle>Global Policies</SheetTitle>
              </div>
            </div>
            <SheetDescription>
              Configure policies and trigger logic that apply to all domains, products, and actions.
              These settings will be inherited throughout your business map.
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            {/* Global Communication Policies */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Global Communication Policies
                      <Badge variant="outline" className="ml-2">
                        <Globe className="h-3 w-3 mr-1" />
                        Applies to all domains
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Define global communication policies that apply across all domains
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPolicyType("communication");
                      setShowPolicySelector(true);
                    }}
                  >
                    Add Policy
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {communicationPolicies.length > 0 ? (
                  <div className="space-y-3">
                    {communicationPolicies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        artifact={policy}
                        onRemove={() => handleRemovePolicy("communication", policy.id)}
                        showRemove={true}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No global communication policies configured yet</p>
                )}
              </CardContent>
            </Card>

            {/* Global Trigger Logic */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      Global Trigger Logic
                      <Badge variant="outline" className="ml-2">
                        <Globe className="h-3 w-3 mr-1" />
                        Applies to all domains
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Define global trigger logic that applies across all domains
                    </CardDescription>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setPolicyType("trigger");
                      setShowPolicySelector(true);
                    }}
                  >
                    Add Trigger
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {triggerLogic.length > 0 ? (
                  <div className="space-y-3">
                    {triggerLogic.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        artifact={policy}
                        onRemove={() => handleRemovePolicy("trigger", policy.id)}
                        showRemove={true}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No global trigger logic configured yet</p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t sticky bottom-0 bg-background pb-4">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Global Policies</Button>
          </div>
        </SheetContent>
      </Sheet>

      <PolicySelector
        open={showPolicySelector}
        onOpenChange={setShowPolicySelector}
        onSelect={handleAddPolicy}
        type={policyType as any}
        context="domain"
      />
    </>
  );
};
