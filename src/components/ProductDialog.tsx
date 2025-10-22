import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { toast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string;
  status: "published" | "draft";
  domainId: string;
  communicationPolicy: string;
  eligibilityPolicy: string;
}

interface Domain {
  id: string;
  name: string;
  products: any[];
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product;
  domainId?: string;
  domainName?: string;
  domains?: Domain[];
  onSave: (product: Omit<Product, "id"> & { id?: string }) => void;
  existingProductsCount?: number;
}

export const ProductDialog = ({
  open,
  onOpenChange,
  product,
  domainId,
  domainName,
  domains,
  onSave,
  existingProductsCount,
}: ProductDialogProps) => {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [status, setStatus] = useState<"published" | "draft">(product?.status || "draft");
  const [selectedDomainId, setSelectedDomainId] = useState(domainId || "");
  const [communicationPolicy, setCommunicationPolicy] = useState(product?.communicationPolicy || "");
  const [eligibilityPolicy, setEligibilityPolicy] = useState(product?.eligibilityPolicy || "");

  const selectedDomain = domains?.find(d => d.id === selectedDomainId);
  const currentExistingProductsCount = selectedDomain ? selectedDomain.products.length : (existingProductsCount || 0);
  const currentDomainName = selectedDomain?.name || domainName || "";

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Product name is required",
        variant: "destructive",
      });
      return;
    }

    if (!selectedDomainId && domains) {
      toast({
        title: "Validation Error",
        description: "Please select a domain",
        variant: "destructive",
      });
      return;
    }

    if (!product && currentExistingProductsCount >= 12) {
      toast({
        title: "Limit Reached",
        description: "Maximum of 12 products allowed per domain",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: product?.id,
      name: name.trim(),
      description: description.trim(),
      status,
      domainId: selectedDomainId || domainId || "",
      communicationPolicy,
      eligibilityPolicy,
    });

    toast({
      title: product ? "Product Updated" : "Product Created",
      description: `${name} has been ${product ? "updated" : "created"} successfully`,
    });

    handleClose();
  };

  const handleClose = () => {
    setName(product?.name || "");
    setDescription(product?.description || "");
    setStatus(product?.status || "draft");
    setSelectedDomainId(domainId || "");
    setCommunicationPolicy(product?.communicationPolicy || "");
    setEligibilityPolicy(product?.eligibilityPolicy || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Create New Product"}</DialogTitle>
          <DialogDescription>
            {product ? (
              `Update the product details${currentDomainName ? ` in ${currentDomainName}` : ''}`
            ) : domains ? (
              <>
                Create a new product. You can have up to 12 products per domain.
              </>
            ) : (
              <>
                Create a new product in <strong>{currentDomainName}</strong>. You can have up to 12 products per domain (
                {currentExistingProductsCount}/12 used)
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {domains && (
            <div className="grid gap-2">
              <Label htmlFor="domain">Domain *</Label>
              <Select value={selectedDomainId} onValueChange={setSelectedDomainId}>
                <SelectTrigger id="domain">
                  <SelectValue placeholder="Select a domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map((domain) => (
                    <SelectItem key={domain.id} value={domain.id}>
                      {domain.name} ({domain.products.length}/12 products)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter product name"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter product description"
              rows={3}
              maxLength={500}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="communication">Communication Policy</Label>
            <Input
              id="communication"
              value={communicationPolicy}
              onChange={(e) => setCommunicationPolicy(e.target.value)}
              placeholder="e.g., Ruleset A, Decision Tree B"
            />
            <p className="text-xs text-muted-foreground">
              Inherits from domain if empty. Will be inherited by actions (can be overridden)
            </p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="eligibility">Eligibility Policy</Label>
            <Input
              id="eligibility"
              value={eligibilityPolicy}
              onChange={(e) => setEligibilityPolicy(e.target.value)}
              placeholder="e.g., Scorecard C, ML Model D"
            />
            <p className="text-xs text-muted-foreground">
              Inherits from domain if empty. Will be inherited by actions (can be overridden)
            </p>
          </div>
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
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{product ? "Update" : "Create"} Product</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
