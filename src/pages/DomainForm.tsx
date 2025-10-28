import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useBusinessMap } from "@/hooks/use-business-map";
import { PolicySelector } from "@/components/PolicySelector";
import { PolicyCard } from "@/components/PolicyCard";
import { DeleteDialog } from "@/components/DeleteDialog";
import { InheritedPolicyBadge } from "@/components/InheritedPolicyBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Save, X, Plus, Edit2, Eye, EyeOff, BarChart3, Trash2, Hash, Calendar, User, Activity, ExternalLink, Layers } from "lucide-react";
import type { Domain } from "@/hooks/use-business-map";
import type { PolicyArtifact } from "@/pages/ActionForm";

const DomainForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const domainId = searchParams.get("id");
  const { domains, setDomains, actions, setActions, globalPolicies } = useBusinessMap();

  const existingDomain = domainId ? domains.find((d) => d.id === domainId) : undefined;
  const isEditMode = !!existingDomain;
  const [isEditing, setIsEditing] = useState(!domainId);

  const [name, setName] = useState(existingDomain?.name || "");
  const [description, setDescription] = useState(existingDomain?.description || "");
  const [status, setStatus] = useState<"published" | "draft">(existingDomain?.status || "draft");
  
  const [communicationPolicies, setCommunicationPolicies] = useState<PolicyArtifact[]>([]);
  const [eligibilityPolicies, setEligibilityPolicies] = useState<PolicyArtifact[]>([]);
  const [triggerLogic, setTriggerLogic] = useState<PolicyArtifact[]>([]);
  const [showPolicySelector, setShowPolicySelector] = useState(false);
  const [policyType, setPolicyType] = useState<"communication" | "eligibility" | "trigger">("communication");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update form state when domain data loads from localStorage
  useEffect(() => {
    if (existingDomain) {
      setName(existingDomain.name);
      setDescription(existingDomain.description);
      setStatus(existingDomain.status);
      
      // Parse existing policies
      if (existingDomain.communicationPolicy) {
        const commPolicies = existingDomain.communicationPolicy.split(", ").filter(p => p).map(name => ({
          id: `domain-comm-${name}`,
          name,
          description: "Domain policy",
          type: "ruleset" as const,
          version: "1.0",
          lastUpdated: new Date(),
        }));
        setCommunicationPolicies(commPolicies);
      }
      if (existingDomain.eligibilityPolicy) {
        const eligPolicies = existingDomain.eligibilityPolicy.split(", ").filter(p => p).map(name => ({
          id: `domain-elig-${name}`,
          name,
          description: "Domain policy",
          type: "ruleset" as const,
          version: "1.0",
          lastUpdated: new Date(),
        }));
        setEligibilityPolicies(eligPolicies);
      }
      if (existingDomain.triggerLogic) {
        const triggerPolicies = existingDomain.triggerLogic.split(", ").filter(p => p).map(name => ({
          id: `domain-trigger-${name}`,
          name,
          description: "Domain trigger logic",
          type: "ruleset" as const,
          version: "1.0",
          lastUpdated: new Date(),
        }));
        setTriggerLogic(triggerPolicies);
      }
    }
  }, [existingDomain?.id]);

  // Calculate aggregated metrics from all actions in this domain
  const domainActions = actions.filter(a => a.domainId === domainId);
  const totalVolume = domainActions.reduce((sum, a) => sum + (a.volume || 0), 0);
  const avgImpressionRate = domainActions.length > 0 
    ? domainActions.reduce((sum, a) => sum + (a.impressionRate || 0), 0) / domainActions.length 
    : 0;
  const avgConversionRate = domainActions.length > 0
    ? domainActions.reduce((sum, a) => sum + (a.conversionRate || 0), 0) / domainActions.length
    : 0;

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Domain name is required",
        variant: "destructive",
      });
      return;
    }

    if (existingDomain) {
      // Update existing domain
      setDomains(domains.map(d => 
        d.id === existingDomain.id 
          ? { 
              ...d, 
              name: name.trim(),
              description: description.trim(),
              status,
              communicationPolicy: communicationPolicies.map(p => p.name).join(", "),
              eligibilityPolicy: eligibilityPolicies.map(p => p.name).join(", "),
              triggerLogic: triggerLogic.map(p => p.name).join(", "),
              updatedAt: new Date()
            }
          : d
      ));
      setIsEditing(false);
      toast({
        title: "Domain Updated",
        description: `${name} has been updated successfully`,
      });
    } else {
      // Create new domain
      const newDomain: Domain = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        status,
        communicationPolicy: communicationPolicies.map(p => p.name).join(", "),
        eligibilityPolicy: eligibilityPolicies.map(p => p.name).join(", "),
        triggerLogic: triggerLogic.map(p => p.name).join(", "),
        products: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDomains([...domains, newDomain]);
      toast({
        title: "Domain Created",
        description: `${name} has been created successfully`,
      });
      setTimeout(() => navigate("/"), 100);
    }
  };

  const handleAddPolicy = (artifacts: PolicyArtifact[]) => {
    if (policyType === "communication") {
      setCommunicationPolicies([...communicationPolicies, ...artifacts]);
    } else if (policyType === "eligibility") {
      setEligibilityPolicies([...eligibilityPolicies, ...artifacts]);
    } else {
      setTriggerLogic([...triggerLogic, ...artifacts]);
    }
  };

  const handleRemovePolicy = (type: "communication" | "eligibility" | "trigger", artifactId: string) => {
    if (type === "communication") {
      setCommunicationPolicies(communicationPolicies.filter(p => p.id !== artifactId));
    } else if (type === "eligibility") {
      setEligibilityPolicies(eligibilityPolicies.filter(p => p.id !== artifactId));
    } else {
      setTriggerLogic(triggerLogic.filter(p => p.id !== artifactId));
    }
  };

  const handleCancel = () => {
    if (existingDomain) {
      setName(existingDomain.name);
      setDescription(existingDomain.description);
      setStatus(existingDomain.status || "draft");
      setIsEditing(false);
    } else {
      navigate("/");
    }
  };

  const handleDelete = () => {
    if (!existingDomain) return;
    
    // Delete all actions associated with this domain
    setActions(actions.filter(a => a.domainId !== existingDomain.id));
    
    // Delete the domain (which contains products)
    setDomains(domains.filter(d => d.id !== existingDomain.id));
    
    toast({
      title: "Domain Deleted",
      description: `${existingDomain.name} and all its products and actions have been deleted successfully`,
    });
    setTimeout(() => navigate("/"), 120);
  };

  const handleTogglePublish = () => {
    if (!existingDomain) return;
    const newStatus = status === "published" ? "draft" : "published";
    setStatus(newStatus);
    setDomains(domains.map(d => 
      d.id === existingDomain.id 
        ? { ...d, status: newStatus, updatedAt: new Date() }
        : d
    ));
    toast({
      title: newStatus === "published" ? "Domain Published" : "Domain Unpublished",
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
          <Button variant="ghost" onClick={() => navigate("/")} size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Business Map
          </Button>
          
          <div className="flex gap-2">
            {isEditMode ? (
              !isEditing ? (
                <>
                  <Button onClick={() => setIsEditing(true)} size="sm">
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit Domain
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
              <>
                <Button variant="outline" onClick={() => navigate("/")} size="sm">
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
                <Button onClick={handleSave} size="sm">
                  <Save className="mr-2 h-4 w-4" />
                  Create Domain
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? (isEditing ? "Edit Domain" : name) : "Create New Domain"}
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
          {isEditMode && !isEditing ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Domain Details</TabsTrigger>
                <TabsTrigger value="products" className="flex-1">
                  Products ({existingDomain?.products.length || 0})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-6 mt-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the domain's core details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Domain Name *</Label>
                <p className="text-sm py-2">{name}</p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <p className="text-sm py-2">{description || "-"}</p>
              </div>
            </CardContent>
          </Card>

          {/* Communication Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Communication Policy</CardTitle>
                  <CardDescription>
                    Define how and when communications can be sent
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Global Policies */}
              {globalPolicies.communicationPolicy && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <InheritedPolicyBadge level="global" />
                    <span className="text-sm text-muted-foreground">Inherited from global settings</span>
                  </div>
                  <div className="space-y-3">
                    {globalPolicies.communicationPolicy.split(", ").filter(p => p).map((name, index) => (
                      <PolicyCard
                        key={`global-comm-${index}`}
                        artifact={{
                          id: `global-comm-${name}`,
                          name,
                          description: "Global communication policy",
                          type: "ruleset",
                          version: "1.0",
                          lastUpdated: new Date(),
                        }}
                        onRemove={() => {}}
                        showRemove={false}
                      />
                    ))}
                  </div>
                  {communicationPolicies.length > 0 && <div className="my-4 border-t" />}
                </div>
              )}
              {/* Domain-Specific Policies */}
              {communicationPolicies.length === 0 && !globalPolicies.communicationPolicy ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No communication policies assigned yet
                  </p>
                </div>
              ) : (
                communicationPolicies.length > 0 && (
                  <div className="space-y-3">
                    {communicationPolicies.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        artifact={policy}
                        onRemove={() => handleRemovePolicy("communication", policy.id)}
                        showRemove={false}
                      />
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>

          {/* Eligibility Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Eligibility Policy</CardTitle>
                  <CardDescription>
                    Define who is eligible for this domain's actions
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {eligibilityPolicies.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No eligibility policies assigned yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eligibilityPolicies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      artifact={policy}
                      onRemove={() => handleRemovePolicy("eligibility", policy.id)}
                      showRemove={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trigger Logic */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Trigger Logic</CardTitle>
                  <CardDescription>
                    Define when NBA calculations should be triggered
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Global Trigger Logic */}
              {globalPolicies.triggerLogic && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <InheritedPolicyBadge level="global" />
                    <span className="text-sm text-muted-foreground">Inherited from global settings</span>
                  </div>
                  <div className="space-y-3">
                    {globalPolicies.triggerLogic.split(", ").filter(p => p).map((name, index) => (
                      <PolicyCard
                        key={`global-trigger-${index}`}
                        artifact={{
                          id: `global-trigger-${name}`,
                          name,
                          description: "Global trigger logic",
                          type: "ruleset",
                          version: "1.0",
                          lastUpdated: new Date(),
                        }}
                        onRemove={() => {}}
                        showRemove={false}
                      />
                    ))}
                  </div>
                  {triggerLogic.length > 0 && <div className="my-4 border-t" />}
                </div>
              )}
              {/* Domain-Specific Trigger Logic */}
              {triggerLogic.length === 0 && !globalPolicies.triggerLogic ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No trigger logic assigned yet
                  </p>
                </div>
              ) : (
                triggerLogic.length > 0 && (
                  <div className="space-y-3">
                    {triggerLogic.map((policy) => (
                      <PolicyCard
                        key={policy.id}
                        artifact={policy}
                        onRemove={() => handleRemovePolicy("trigger", policy.id)}
                        showRemove={false}
                      />
                    ))}
                  </div>
                )
              )}
            </CardContent>
          </Card>
              </TabsContent>

              <TabsContent value="products" className="space-y-6 mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Products in this Domain</CardTitle>
                    <CardDescription>
                      View and manage all products under {name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {existingDomain?.products.length === 0 ? (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg">
                        <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground mb-4">
                          No products in this domain yet
                        </p>
                        <Button onClick={() => navigate(`/products/new?domainId=${domainId}`)}>
                          <Plus className="mr-2 h-4 w-4" />
                          Add Product
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {existingDomain?.products.map((product) => {
                          const productActionCount = actions.filter(a => a.productId === product.id).length;
                          return (
                            <div
                              key={product.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                            >
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-foreground">{product.name}</h4>
                                <p className="text-sm text-muted-foreground">{product.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant={product.status === "published" ? "default" : "secondary"} className="text-xs">
                                    {product.status}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {productActionCount} action{productActionCount !== 1 ? 's' : ''}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => navigate(`/products/edit?id=${product.id}`)}
                                >
                                  View Details
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => navigate(`/actions?productId=${product.id}`)}
                                >
                                  <Activity className="mr-2 h-4 w-4" />
                                  View Actions
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Define the domain's core details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Domain Name *</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Customer Acquisition, Product Growth"
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
                    placeholder="Describe the purpose and scope of this domain"
                    rows={3}
                    maxLength={500}
                  />
                ) : (
                  <p className="text-sm py-2">{description || "-"}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Communication Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Communication Policy</CardTitle>
                  <CardDescription>
                    Define how and when communications can be sent
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPolicyType("communication");
                      setShowPolicySelector(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Policy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {communicationPolicies.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No communication policies assigned yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {communicationPolicies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      artifact={policy}
                      onRemove={() => handleRemovePolicy("communication", policy.id)}
                      showRemove={isEditing}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Eligibility Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Eligibility Policy</CardTitle>
                  <CardDescription>
                    Define who is eligible for this domain's actions
                  </CardDescription>
                </div>
                {isEditing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPolicyType("eligibility");
                      setShowPolicySelector(true);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Policy
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {eligibilityPolicies.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    No eligibility policies assigned yet
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eligibilityPolicies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      artifact={policy}
                      onRemove={() => handleRemovePolicy("eligibility", policy.id)}
                      showRemove={isEditing}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
            </>
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
                  <InfoRow icon={Hash} label="Domain ID" value={existingDomain?.id.slice(0, 8) || ""} />
                  <Separator />
                  <InfoRow 
                    icon={Layers} 
                    label="Products" 
                    value={existingDomain?.products.length.toString() || "0"} 
                  />
                  <InfoRow 
                    icon={Activity} 
                    label="Total Actions" 
                    value={domainActions.length.toString()} 
                  />
                  <Separator />
                  <InfoRow 
                    icon={User} 
                    label="Created By" 
                    value="System" 
                  />
                  <InfoRow 
                    icon={Calendar} 
                    label="Created" 
                    value={existingDomain?.createdAt.toLocaleDateString() || ""} 
                  />
                  <InfoRow 
                    icon={Calendar} 
                    label="Last Updated" 
                    value={existingDomain?.updatedAt.toLocaleDateString() || ""} 
                  />
                </CardContent>
              </Card>
            )}

            {/* Performance Metrics */}
            {isEditMode && !isEditing && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Performance Metrics
                  </CardTitle>
                  <CardDescription>Aggregated across all actions in this domain</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Total Volume</Label>
                    <p className="text-2xl font-bold">{totalVolume ? totalVolume.toLocaleString() : "-"}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Avg Impression Rate</Label>
                    <p className="text-2xl font-bold">{avgImpressionRate ? `${avgImpressionRate.toFixed(1)}%` : "-"}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Avg Conversion Rate</Label>
                    <p className="text-2xl font-bold">{avgConversionRate ? `${avgConversionRate.toFixed(1)}%` : "-"}</p>
                  </div>
                  {domainActions.length > 0 && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Based on {domainActions.length} action{domainActions.length !== 1 ? 's' : ''}
                    </p>
                  )}
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
                        <p className="text-sm font-medium">Domain updated</p>
                        <p className="text-xs text-muted-foreground">
                          {existingDomain?.updatedAt.toLocaleDateString()} at{" "}
                          {existingDomain?.updatedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-muted mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Domain created</p>
                        <p className="text-xs text-muted-foreground">
                          {existingDomain?.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions Link */}
            {isEditMode && !isEditing && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base">Actions</CardTitle>
                  <CardDescription>View all actions in this domain</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate(`/actions?domainId=${domainId}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View {domainActions.length} Action{domainActions.length !== 1 ? 's' : ''}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Policy Selector Dialog */}
      <PolicySelector
        open={showPolicySelector}
        onOpenChange={setShowPolicySelector}
        onSelect={handleAddPolicy}
        type={policyType}
        context="domain"
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Domain"
        description="Are you sure you want to delete this domain? This will also delete all products and actions within this domain. This action cannot be undone."
        itemName={existingDomain?.name || ""}
        productsCount={existingDomain?.products.length || 0}
        actionsCount={domainActions.length}
      />
    </div>
  );
};

export default DomainForm;
