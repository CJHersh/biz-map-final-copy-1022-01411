import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useBusinessMap } from "@/hooks/use-business-map";
import { PolicySelector } from "@/components/PolicySelector";
import { PolicyCard } from "@/components/PolicyCard";
import { DeleteDialog } from "@/components/DeleteDialog";
import { ArrowLeft, Info, Edit2, Save, X, Eye, EyeOff, Calendar, User, Hash, FolderTree, BarChart3, Trash2, Activity } from "lucide-react";
import type { Action } from "@/hooks/use-business-map";

export interface PolicyArtifact {
  id: string;
  name: string;
  description: string;
  type: "ruleset" | "decision-tree" | "scorecard" | "ml-model";
  version: string;
  lastUpdated: Date;
}

const ActionForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionId = searchParams.get("id");
  const { domains, actions, setActions } = useBusinessMap();

  const existingAction = actionId ? actions.find((a) => a.id === actionId) : undefined;
  const isEditMode = !!existingAction;
  const [isEditing, setIsEditing] = useState(!actionId);

  const [name, setName] = useState(existingAction?.name || "");
  const [description, setDescription] = useState(existingAction?.description || "");
  const [domainId, setDomainId] = useState(existingAction?.domainId || "");
  const [productId, setProductId] = useState(existingAction?.productId || "");
  const [businessGoal, setBusinessGoal] = useState<1 | 2 | 3 | 4 | 5>(existingAction?.businessGoal || 3);
  const [financialValue, setFinancialValue] = useState(existingAction?.financialValue?.toString() || "");
  const [availability, setAvailability] = useState<"always" | "not-available" | "date-range">(
    existingAction?.availability || "always"
  );
  const [availabilityStart, setAvailabilityStart] = useState(
    existingAction?.availabilityStart ? new Date(existingAction.availabilityStart).toISOString().split("T")[0] : ""
  );
  const [availabilityEnd, setAvailabilityEnd] = useState(
    existingAction?.availabilityEnd ? new Date(existingAction.availabilityEnd).toISOString().split("T")[0] : ""
  );
  const [status, setStatus] = useState<"published" | "draft">(existingAction?.status || "draft");

  // Performance data
  const [volume, setVolume] = useState(existingAction?.volume?.toString() || "");
  const [impressionRate, setImpressionRate] = useState(existingAction?.impressionRate?.toString() || "");
  const [conversionRate, setConversionRate] = useState(existingAction?.conversionRate?.toString() || "");

  // Policy artifacts
  const [communicationPolicies, setCommunicationPolicies] = useState<PolicyArtifact[]>([]);
  const [eligibilityPolicies, setEligibilityPolicies] = useState<PolicyArtifact[]>([]);
  const [removedInheritedCommPolicies, setRemovedInheritedCommPolicies] = useState<Set<string>>(new Set());
  const [removedInheritedEligPolicies, setRemovedInheritedEligPolicies] = useState<Set<string>>(new Set());
  const [showPolicySelector, setShowPolicySelector] = useState(false);
  const [policyType, setPolicyType] = useState<"communication" | "eligibility">("communication");
  const [inheritedPoliciesInitialized, setInheritedPoliciesInitialized] = useState(false);
  
  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update form state when action data loads from localStorage
  useEffect(() => {
    if (existingAction) {
      setName(existingAction.name);
      setDescription(existingAction.description);
      setDomainId(existingAction.domainId);
      setProductId(existingAction.productId);
      setBusinessGoal(existingAction.businessGoal);
      setFinancialValue(existingAction.financialValue?.toString() || "");
      setAvailability(existingAction.availability);
      setAvailabilityStart(existingAction.availabilityStart ? new Date(existingAction.availabilityStart).toISOString().split("T")[0] : "");
      setAvailabilityEnd(existingAction.availabilityEnd ? new Date(existingAction.availabilityEnd).toISOString().split("T")[0] : "");
      setStatus(existingAction.status);
      setVolume(existingAction.volume?.toString() || "");
      setImpressionRate(existingAction.impressionRate?.toString() || "");
      setConversionRate(existingAction.conversionRate?.toString() || "");
      
      // Parse existing policies from action
      const actionCommPolicies: PolicyArtifact[] = [];
      const actionEligPolicies: PolicyArtifact[] = [];
      
      if (existingAction.communicationPolicy) {
        const policies = existingAction.communicationPolicy.split(", ").filter(p => p).map(name => ({
          id: `action-comm-${name}`,
          name,
          description: "Action policy",
          type: "ruleset" as const,
          version: "1.0",
          lastUpdated: new Date(),
        }));
        actionCommPolicies.push(...policies);
      }
      if (existingAction.eligibilityPolicy) {
        const policies = existingAction.eligibilityPolicy.split(", ").filter(p => p).map(name => ({
          id: `action-elig-${name}`,
          name,
          description: "Action policy",
          type: "ruleset" as const,
          version: "1.0",
          lastUpdated: new Date(),
        }));
        actionEligPolicies.push(...policies);
      }
      
      setCommunicationPolicies(actionCommPolicies);
      setEligibilityPolicies(actionEligPolicies);
      setInheritedPoliciesInitialized(true);
    }
  }, [existingAction?.id]);

  const selectedDomain = domains.find((d) => d.id === domainId);
  const selectedProduct = selectedDomain?.products.find((p) => p.id === productId);

  // Get inherited policies
  const inheritedCommunicationPolicy = selectedProduct?.communicationPolicy || selectedDomain?.communicationPolicy;
  const inheritedEligibilityPolicy = selectedProduct?.eligibilityPolicy || selectedDomain?.eligibilityPolicy;
  const communicationInheritedFrom = selectedProduct?.communicationPolicy ? "product" : selectedDomain?.communicationPolicy ? "domain" : null;
  const eligibilityInheritedFrom = selectedProduct?.eligibilityPolicy ? "product" : selectedDomain?.eligibilityPolicy ? "domain" : null;

  // Merge inherited policies with action-specific policies
  const allCommunicationPolicies = (() => {
    const policies = [...communicationPolicies];
    const policyNames = new Set(policies.map(p => p.name));
    
    if (inheritedCommunicationPolicy) {
      const inheritedPolicies = inheritedCommunicationPolicy.split(", ").filter(p => p && !policyNames.has(p) && !removedInheritedCommPolicies.has(p)).map(name => ({
        id: `inherited-comm-${name}`,
        name,
        description: "Communication policy configuration and rules",
        type: "ruleset" as const,
        version: "1.0",
        lastUpdated: new Date(),
        inheritedFrom: communicationInheritedFrom,
      }));
      policies.push(...inheritedPolicies);
    }
    
    return policies;
  })();

  const allEligibilityPolicies = (() => {
    const policies = [...eligibilityPolicies];
    const policyNames = new Set(policies.map(p => p.name));
    
    if (inheritedEligibilityPolicy) {
      const inheritedPolicies = inheritedEligibilityPolicy.split(", ").filter(p => p && !policyNames.has(p) && !removedInheritedEligPolicies.has(p)).map(name => ({
        id: `inherited-elig-${name}`,
        name,
        description: "Eligibility policy configuration and rules",
        type: "ruleset" as const,
        version: "1.0",
        lastUpdated: new Date(),
        inheritedFrom: eligibilityInheritedFrom,
      }));
      policies.push(...inheritedPolicies);
    }
    
    return policies;
  })();

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Action name is required",
        variant: "destructive",
      });
      return;
    }

    if (!domainId || !productId) {
      toast({
        title: "Validation Error",
        description: "Please select both domain and product",
        variant: "destructive",
      });
      return;
    }

    const newAction: Action = {
      id: existingAction?.id || crypto.randomUUID(),
      name: name.trim(),
      description: description.trim(),
      domainId,
      productId,
      businessGoal,
      financialValue: parseFloat(financialValue) || 0,
      availability,
      availabilityStart: availability === "date-range" ? new Date(availabilityStart) : undefined,
      availabilityEnd: availability === "date-range" ? new Date(availabilityEnd) : undefined,
      communicationPolicy: communicationPolicies.length > 0 
        ? allCommunicationPolicies.map(p => p.name).join(", ")
        : "",
      eligibilityPolicy: eligibilityPolicies.length > 0
        ? allEligibilityPolicies.map(p => p.name).join(", ")
        : "",
      status,
      volume: volume ? parseFloat(volume) : undefined,
      impressionRate: impressionRate ? parseFloat(impressionRate) : undefined,
      conversionRate: conversionRate ? parseFloat(conversionRate) : undefined,
      createdAt: existingAction?.createdAt || new Date(),
      updatedAt: new Date(),
      createdBy: existingAction?.createdBy || "Current User",
    };

    if (existingAction) {
      setActions(actions.map((a) => (a.id === existingAction.id ? newAction : a)));
      setIsEditing(false);
      toast({
        title: "Action Updated",
        description: `${name} has been updated successfully`,
      });
    } else {
      setActions([...actions, newAction]);
      toast({
        title: "Action Created",
        description: `${name} has been created successfully`,
      });
      setTimeout(() => navigate("/actions"), 100);
    }
  };

  const handleCancel = () => {
    if (existingAction) {
      // Reset to existing values
      setName(existingAction.name);
      setDescription(existingAction.description);
      setDomainId(existingAction.domainId);
      setProductId(existingAction.productId);
      setBusinessGoal(existingAction.businessGoal);
      setFinancialValue(existingAction.financialValue.toString());
      setAvailability(existingAction.availability);
      setAvailabilityStart(existingAction.availabilityStart ? new Date(existingAction.availabilityStart).toISOString().split("T")[0] : "");
      setAvailabilityEnd(existingAction.availabilityEnd ? new Date(existingAction.availabilityEnd).toISOString().split("T")[0] : "");
      setStatus(existingAction.status);
      setVolume(existingAction.volume?.toString() || "");
      setImpressionRate(existingAction.impressionRate?.toString() || "");
      setConversionRate(existingAction.conversionRate?.toString() || "");
      setIsEditing(false);
    } else {
      navigate("/actions");
    }
  };

  const handleAddPolicy = (artifacts: PolicyArtifact[]) => {
    if (policyType === "communication") {
      setCommunicationPolicies([...communicationPolicies, ...artifacts]);
    } else {
      setEligibilityPolicies([...eligibilityPolicies, ...artifacts]);
    }
  };

  const handleRemovePolicy = (type: "communication" | "eligibility", artifactId: string) => {
    if (type === "communication") {
      if (artifactId.startsWith('inherited-comm-')) {
        // Remove inherited policy by tracking its name
        const policyName = artifactId.replace('inherited-comm-', '');
        setRemovedInheritedCommPolicies(new Set([...removedInheritedCommPolicies, policyName]));
      } else {
        setCommunicationPolicies(communicationPolicies.filter(p => p.id !== artifactId));
      }
    } else {
      if (artifactId.startsWith('inherited-elig-')) {
        // Remove inherited policy by tracking its name
        const policyName = artifactId.replace('inherited-elig-', '');
        setRemovedInheritedEligPolicies(new Set([...removedInheritedEligPolicies, policyName]));
      } else {
        setEligibilityPolicies(eligibilityPolicies.filter(p => p.id !== artifactId));
      }
    }
  };

  const handleDelete = () => {
    if (!existingAction) return;
    setActions(actions.filter(a => a.id !== existingAction.id));
    toast({
      title: "Action Deleted",
      description: `${existingAction.name} has been deleted successfully`,
    });
    navigate("/actions");
  };

  const handleTogglePublish = () => {
    if (!existingAction) return;
    const newStatus = status === "published" ? "draft" : "published";
    setStatus(newStatus);
    setActions(actions.map(a => 
      a.id === existingAction.id 
        ? { ...a, status: newStatus, updatedAt: new Date() }
        : a
    ));
    toast({
      title: newStatus === "published" ? "Action Published" : "Action Unpublished",
      description: `${name} is now ${newStatus}`,
    });
  };

  const handleViewAnalytics = () => {
    toast({
      title: "Analytics",
      description: "Analytics view coming soon",
    });
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <div className="flex items-start gap-3 py-2">
      <Icon className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/actions")} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Actions
          </Button>
          
          <div className="flex gap-2">
            {isEditMode ? (
              // Existing action - show different buttons based on editing state
              !isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Action
                  </Button>
                  <Button 
                    onClick={handleTogglePublish} 
                    size="sm"
                    variant="outline"
                  >
                    {status === "published" ? (
                      <>
                        <EyeOff className="mr-2 h-4 w-4" />
                        Unpublish
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        Publish
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleViewAnalytics} 
                    size="sm"
                    variant="outline"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                  <Button 
                    onClick={() => setShowDeleteDialog(true)} 
                    size="sm"
                    variant="outline"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" onClick={handleCancel} size="sm">
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave} size="sm">
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </>
              )
            ) : (
              // New action - show Cancel/Create buttons
              <>
                <Button variant="outline" onClick={() => navigate("/actions")} size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Create Action
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? (isEditing ? "Edit Action" : name) : "Create New Action"}
              </h1>
              {isEditMode && !isEditing && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
            {isEditMode && (
              <Badge variant={status === "published" ? "default" : "secondary"} className="text-sm">
                {status === "published" ? (
                  <>
                    <Eye className="mr-1 h-3 w-3" />
                    Published
                  </>
                ) : (
                  "Draft"
                )}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>Define the action's core details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name *</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter action name"
                      maxLength={100}
                    />
                  ) : (
                    <p className="text-sm py-2">{name}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  {isEditing ? (
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter action description"
                      rows={3}
                      maxLength={500}
                    />
                  ) : (
                    <p className="text-sm py-2 text-muted-foreground">{description || "No description"}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="domain">Domain *</Label>
                      <Select value={domainId} onValueChange={setDomainId}>
                        <SelectTrigger id="domain">
                          <SelectValue placeholder="Select domain" />
                        </SelectTrigger>
                        <SelectContent>
                          {domains.map((domain) => (
                            <SelectItem key={domain.id} value={domain.id}>
                              {domain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="product">Product *</Label>
                      <Select value={productId} onValueChange={setProductId} disabled={!domainId}>
                        <SelectTrigger id="product">
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedDomain?.products.map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="goal">Business Goal</Label>
                    {isEditing ? (
                      <Select value={businessGoal.toString()} onValueChange={(v) => setBusinessGoal(parseInt(v) as 1 | 2 | 3 | 4 | 5)}>
                        <SelectTrigger id="goal">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((val) => (
                            <SelectItem key={val} value={val.toString()}>
                              {val} - {val <= 2 ? "Low" : val <= 3 ? "Medium" : "High"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="flex gap-0.5 py-2">
                        {[...Array(5)].map((_, i) => (
                          <div
                            key={i}
                            className={`w-3 h-7 rounded-sm ${
                              i < businessGoal ? 'bg-primary' : 'bg-muted'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="value">Financial Value ($)</Label>
                    {isEditing ? (
                      <Input
                        id="value"
                        type="number"
                        value={financialValue}
                        onChange={(e) => setFinancialValue(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <p className="text-sm py-2 font-medium">${parseFloat(financialValue || "0").toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="availability">Availability</Label>
                  {isEditing ? (
                    <Select value={availability} onValueChange={(v: any) => setAvailability(v)}>
                      <SelectTrigger id="availability">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="always">Always Available</SelectItem>
                        <SelectItem value="not-available">Not Available</SelectItem>
                        <SelectItem value="date-range">Date Range</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm py-2 capitalize">{availability.replace("-", " ")}</p>
                  )}
                </div>

                {availability === "date-range" && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="start">Start Date</Label>
                      {isEditing ? (
                        <Input
                          id="start"
                          type="date"
                          value={availabilityStart}
                          onChange={(e) => setAvailabilityStart(e.target.value)}
                        />
                      ) : (
                        <p className="text-sm py-2">{availabilityStart ? new Date(availabilityStart).toLocaleDateString() : "-"}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="end">End Date</Label>
                      {isEditing ? (
                        <Input
                          id="end"
                          type="date"
                          value={availabilityEnd}
                          onChange={(e) => setAvailabilityEnd(e.target.value)}
                        />
                      ) : (
                        <p className="text-sm py-2">{availabilityEnd ? new Date(availabilityEnd).toLocaleDateString() : "-"}</p>
                      )}
                    </div>
                  </div>
                )}

                {isEditing && (
                  <div className="grid gap-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={status} onValueChange={(value: "published" | "draft") => setStatus(value)}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Communication Policies */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Communication Policies</CardTitle>
                    <CardDescription>Define how and when to communicate this action</CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPolicyType("communication");
                        setShowPolicySelector(true);
                      }}
                    >
                      Add Policy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {allCommunicationPolicies.length > 0 ? (
                  <div className="space-y-3">
                     {allCommunicationPolicies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        artifact={policy}
                        onRemove={() => isEditing && handleRemovePolicy("communication", policy.id)}
                        showRemove={isEditing}
                        inheritedFrom={(policy as any).inheritedFrom}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No communication policies assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Eligibility Policies */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>Eligibility Policies</CardTitle>
                    <CardDescription>Define who is eligible for this action</CardDescription>
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      onClick={() => {
                        setPolicyType("eligibility");
                        setShowPolicySelector(true);
                      }}
                    >
                      Add Policy
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {allEligibilityPolicies.length > 0 ? (
                  <div className="space-y-3">
                     {allEligibilityPolicies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        artifact={policy}
                        onRemove={() => isEditing && handleRemovePolicy("eligibility", policy.id)}
                        showRemove={isEditing}
                        inheritedFrom={(policy as any).inheritedFrom}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No eligibility policies assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Action Buttons for New Action */}
            {!isEditMode && (
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  Create Action
                </Button>
              </div>
            )}
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* System Information */}
            {isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow icon={Hash} label="Action ID" value={existingAction?.id.slice(0, 8) || ""} />
                  <Separator />
                  <InfoRow 
                    icon={FolderTree} 
                    label="Domain" 
                    value={selectedDomain?.name || "Unknown"} 
                  />
                  <InfoRow 
                    icon={FolderTree} 
                    label="Product" 
                    value={selectedProduct?.name || "Unknown"} 
                  />
                  <Separator />
                  <InfoRow 
                    icon={User} 
                    label="Created By" 
                    value={existingAction?.createdBy || "Unknown"} 
                  />
                  <InfoRow 
                    icon={Calendar} 
                    label="Created" 
                    value={existingAction?.createdAt.toLocaleDateString() || ""} 
                  />
                  <InfoRow 
                    icon={Calendar} 
                    label="Last Updated" 
                    value={existingAction?.updatedAt.toLocaleDateString() || ""} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            {!isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Track action performance data</CardDescription>
                </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="volume">Volume</Label>
                  <p className="text-2xl font-bold">{volume ? parseFloat(volume).toLocaleString() : "-"}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="impression">Impression Rate</Label>
                  <p className="text-2xl font-bold">{impressionRate ? `${impressionRate}%` : "-"}</p>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="conversion">Conversion Rate</Label>
                  <p className="text-2xl font-bold">{conversionRate ? `${conversionRate}%` : "-"}</p>
                </div>
              </CardContent>
              </Card>
            )}

            {/* Activity Panel */}
            {isEditMode && !isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Action updated</p>
                        <p className="text-xs text-muted-foreground">
                          {existingAction?.updatedAt.toLocaleDateString()} at{" "}
                          {existingAction?.updatedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-muted mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Action created</p>
                        <p className="text-xs text-muted-foreground">
                          {existingAction?.createdAt.toLocaleDateString()} by{" "}
                          {existingAction?.createdBy}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <PolicySelector
        open={showPolicySelector}
        onOpenChange={setShowPolicySelector}
        onSelect={handleAddPolicy}
        type={policyType}
        context="action"
      />

      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Action"
        description="Are you sure you want to delete this action? This action cannot be undone."
        itemName={existingAction?.name || ""}
      />
    </div>
  );
};

export default ActionForm;
