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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useBusinessMap } from "@/hooks/use-business-map";
import { PolicySelector } from "@/components/PolicySelector";
import { PolicyCard } from "@/components/PolicyCard";
import { DeleteDialog } from "@/components/DeleteDialog";
import { BusinessMapTree } from "@/components/BusinessMapTree";
import { ArrowLeft, Save, X, Plus, Info, Edit2, Eye, EyeOff, BarChart3, Trash2, Hash, Calendar, User, Activity, FolderTree, ExternalLink } from "lucide-react";
import type { Product } from "@/hooks/use-business-map";
import type { PolicyArtifact } from "@/pages/ActionForm";

const ProductForm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get("id");
  const defaultDomainId = searchParams.get("domainId");
  
  const { domains, setDomains, actions, setActions } = useBusinessMap();

  const existingProduct = productId 
    ? domains.flatMap(d => d.products).find((p) => p.id === productId) 
    : undefined;
  const isEditMode = !!existingProduct;
  const [isEditing, setIsEditing] = useState(!productId);

  const [name, setName] = useState(existingProduct?.name || "");
  const [description, setDescription] = useState(existingProduct?.description || "");
  const [domainId, setDomainId] = useState(existingProduct?.domainId || defaultDomainId || "");
  const [status, setStatus] = useState<"published" | "draft">(existingProduct?.status || "draft");
  
  const [communicationPolicies, setCommunicationPolicies] = useState<PolicyArtifact[]>([]);
  const [eligibilityPolicies, setEligibilityPolicies] = useState<PolicyArtifact[]>([]);
  const [removedInheritedCommPolicies, setRemovedInheritedCommPolicies] = useState<Set<string>>(new Set());
  const [removedInheritedEligPolicies, setRemovedInheritedEligPolicies] = useState<Set<string>>(new Set());
  const [showPolicySelector, setShowPolicySelector] = useState(false);
  const [policyType, setPolicyType] = useState<"communication" | "eligibility">("communication");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Update form state when product data loads from localStorage
  useEffect(() => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setDomainId(existingProduct.domainId);
      setStatus(existingProduct.status);
      
      // Parse existing policies
      if (existingProduct.communicationPolicy) {
        const commPolicies = existingProduct.communicationPolicy.split(", ").filter(p => p).map(name => ({
          id: `product-comm-${name}`,
          name,
          description: "Product policy",
          type: "ruleset" as const,
          version: "1.0",
          lastUpdated: new Date(),
        }));
        setCommunicationPolicies(commPolicies);
      }
      if (existingProduct.eligibilityPolicy) {
        const eligPolicies = existingProduct.eligibilityPolicy.split(", ").filter(p => p).map(name => ({
          id: `product-elig-${name}`,
          name,
          description: "Product policy",
          type: "ruleset" as const,
          version: "1.0",
          lastUpdated: new Date(),
        }));
        setEligibilityPolicies(eligPolicies);
      }
    }
  }, [existingProduct?.id]);

  const selectedDomain = domains.find(d => d.id === domainId);
  const inheritedCommunicationPolicy = selectedDomain?.communicationPolicy;
  const inheritedEligibilityPolicy = selectedDomain?.eligibilityPolicy;

  // Merge inherited policies with product-specific policies
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
        inheritedFrom: "domain" as const,
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
        inheritedFrom: "domain" as const,
      }));
      policies.push(...inheritedPolicies);
    }
    
    return policies;
  })();

  // Calculate aggregated metrics from all actions in this product
  const productActions = actions.filter(a => a.productId === productId);
  const totalVolume = productActions.reduce((sum, a) => sum + (a.volume || 0), 0);
  const avgImpressionRate = productActions.length > 0 
    ? productActions.reduce((sum, a) => sum + (a.impressionRate || 0), 0) / productActions.length 
    : 0;
  const avgConversionRate = productActions.length > 0
    ? productActions.reduce((sum, a) => sum + (a.conversionRate || 0), 0) / productActions.length
    : 0;

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!domainId) {
      toast({
        title: "Validation Error",
        description: "Please select a domain",
        variant: "destructive",
      });
      return;
    }

    if (existingProduct) {
      // Update existing product
      setDomains(domains.map(d => ({
        ...d,
        products: d.products.map(p => 
          p.id === existingProduct.id
            ? {
                ...p,
                name: name.trim(),
                description: description.trim(),
                domainId,
                status,
                communicationPolicy: communicationPolicies.length > 0 
                  ? allCommunicationPolicies.map(p => p.name).join(", ")
                  : "",
                eligibilityPolicy: eligibilityPolicies.length > 0
                  ? allEligibilityPolicies.map(p => p.name).join(", ")
                  : "",
                updatedAt: new Date(),
              }
            : p
        ),
        updatedAt: new Date(),
      })));
      setIsEditing(false);
      toast({
        title: "Product Updated",
        description: `${name} has been updated successfully`,
      });
    } else {
      // Create new product
      const newProduct: Product = {
        id: crypto.randomUUID(),
        name: name.trim(),
        description: description.trim(),
        domainId,
        status,
        communicationPolicy: communicationPolicies.length > 0 
          ? allCommunicationPolicies.map(p => p.name).join(", ")
          : "",
        eligibilityPolicy: eligibilityPolicies.length > 0
          ? allEligibilityPolicies.map(p => p.name).join(", ")
          : "",
        actionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setDomains(domains.map(d => 
        d.id === domainId
          ? { ...d, products: [...d.products, newProduct], updatedAt: new Date() }
          : d
      ));
      
      toast({
        title: "Product Created",
        description: `${name} has been created successfully`,
      });
      setTimeout(() => navigate("/"), 100);
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

  const handleCancel = () => {
    if (existingProduct) {
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setDomainId(existingProduct.domainId);
      setStatus(existingProduct.status);
      setIsEditing(false);
    } else {
      navigate("/");
    }
  };

  const handleDelete = () => {
    if (!existingProduct) return;
    
    // Delete all actions associated with this product
    setActions(actions.filter(a => a.productId !== existingProduct.id));
    
    // Delete the product from its domain
    setDomains(domains.map(d => ({
      ...d,
      products: d.products.filter(p => p.id !== existingProduct.id),
      updatedAt: new Date(),
    })));
    
    toast({
      title: "Product Deleted",
      description: `${existingProduct.name} and all its actions have been deleted successfully`,
    });
    setTimeout(() => navigate("/"), 120);
  };

  const handleTogglePublish = () => {
    if (!existingProduct) return;
    const newStatus = status === "published" ? "draft" : "published";
    setStatus(newStatus);
    setDomains(domains.map(d => ({
      ...d,
      products: d.products.map(p => 
        p.id === existingProduct.id 
          ? { ...p, status: newStatus, updatedAt: new Date() }
          : p
      ),
      updatedAt: new Date(),
    })));
    toast({
      title: newStatus === "published" ? "Product Published" : "Product Unpublished",
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
                    Edit Product
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
                  Create Product
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                {isEditMode ? (isEditing ? "Edit Product" : name) : "Create New Product"}
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
              <CardDescription>Define the product's core details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="domain">Parent Domain *</Label>
                {isEditing ? (
                  <Select value={domainId} onValueChange={setDomainId}>
                    <SelectTrigger id="domain">
                      <SelectValue placeholder="Select a domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {domains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id}>
                          {domain.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm py-2">{selectedDomain?.name || "-"}</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="name">Product Name *</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Email Campaign, Mobile App Notification"
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
                    placeholder="Describe the purpose and features of this product"
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
                    Override domain policies or add product-specific rules
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
            <CardContent className="space-y-4">
              {allCommunicationPolicies.length > 0 ? (
                <div className="space-y-3">
                   {allCommunicationPolicies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      artifact={policy}
                      onRemove={() => handleRemovePolicy("communication", policy.id)}
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

          {/* Eligibility Policy */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Eligibility Policy</CardTitle>
                  <CardDescription>
                    Override domain policies or add product-specific rules
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
            <CardContent className="space-y-4">
              {allEligibilityPolicies.length > 0 ? (
                <div className="space-y-3">
                   {allEligibilityPolicies.map((policy) => (
                    <PolicyCard
                      key={policy.id}
                      artifact={policy}
                      onRemove={() => handleRemovePolicy("eligibility", policy.id)}
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
          </div>

          {/* Right Sidebar - 1/3 width */}
          <div className="space-y-6">
            {/* Business Map Tree - Only show in create mode */}
            {!isEditMode && (
              <BusinessMapTree 
                domains={domains}
                selectedDomainId={domainId}
                previewProductName={name}
              />
            )}

            {/* System Information */}
            {isEditMode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1">
                  <InfoRow icon={Hash} label="Product ID" value={existingProduct?.id.slice(0, 8) || ""} />
                  <Separator />
                  <InfoRow 
                    icon={FolderTree} 
                    label="Domain" 
                    value={selectedDomain?.name || "Unknown"} 
                  />
                  <InfoRow 
                    icon={Activity} 
                    label="Total Actions" 
                    value={productActions.length.toString()} 
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
                    value={existingProduct?.createdAt.toLocaleDateString() || ""} 
                  />
                  <InfoRow 
                    icon={Calendar} 
                    label="Last Updated" 
                    value={existingProduct?.updatedAt.toLocaleDateString() || ""} 
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
                  <CardDescription>Aggregated across all actions in this product</CardDescription>
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
                  {productActions.length > 0 && (
                    <p className="text-xs text-muted-foreground pt-2 border-t">
                      Based on {productActions.length} action{productActions.length !== 1 ? 's' : ''}
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
                        <p className="text-sm font-medium">Product updated</p>
                        <p className="text-xs text-muted-foreground">
                          {existingProduct?.updatedAt.toLocaleDateString()} at{" "}
                          {existingProduct?.updatedAt.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="h-2 w-2 rounded-full bg-muted mt-1.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Product created</p>
                        <p className="text-xs text-muted-foreground">
                          {existingProduct?.createdAt.toLocaleDateString()}
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
                  <CardDescription>View all actions for this product</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => navigate(`/actions?productId=${productId}`)}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View {productActions.length} Action{productActions.length !== 1 ? 's' : ''}
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
        context="product"
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        title="Delete Product"
        description="Are you sure you want to delete this product? This will also delete all actions within this product. This action cannot be undone."
        itemName={existingProduct?.name || ""}
        actionsCount={productActions.length}
      />
    </div>
  );
};

export default ProductForm;
