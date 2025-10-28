import { useState, useEffect } from "react";
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
import type { Action, Domain } from "@/hooks/use-business-map";

interface ActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action?: Action;
  domains: Domain[];
  onSave: (action: Omit<Action, "id" | "createdAt" | "updatedAt"> & { id?: string }) => void;
}

export const ActionDialog = ({ open, onOpenChange, action, domains, onSave }: ActionDialogProps) => {
  const [name, setName] = useState(action?.name || "");
  const [description, setDescription] = useState(action?.description || "");
  const [domainId, setDomainId] = useState(action?.domainId || "");
  const [productId, setProductId] = useState(action?.productId || "");
  const [businessGoal, setBusinessGoal] = useState<1 | 2 | 3 | 4 | 5>(action?.businessGoal || 3);
  const [financialValue, setFinancialValue] = useState(action?.financialValue?.toString() || "");
  const [availability, setAvailability] = useState<"always" | "not-available" | "date-range">(
    action?.availability || "always"
  );
  const [availabilityStart, setAvailabilityStart] = useState(
    action?.availabilityStart ? new Date(action.availabilityStart).toISOString().split("T")[0] : ""
  );
  const [availabilityEnd, setAvailabilityEnd] = useState(
    action?.availabilityEnd ? new Date(action.availabilityEnd).toISOString().split("T")[0] : ""
  );
  const [communicationPolicy, setCommunicationPolicy] = useState(action?.communicationPolicy || "");
  const [eligibilityPolicy, setEligibilityPolicy] = useState(action?.eligibilityPolicy || "");
  const [status, setStatus] = useState<"published" | "draft">(action?.status || "draft");

  // Update form when action changes
  useEffect(() => {
    if (action) {
      setName(action.name);
      setDescription(action.description);
      setDomainId(action.domainId);
      setProductId(action.productId);
      setBusinessGoal(action.businessGoal);
      setFinancialValue(action.financialValue?.toString() || "");
      setAvailability(action.availability);
      setAvailabilityStart(action.availabilityStart ? new Date(action.availabilityStart).toISOString().split("T")[0] : "");
      setAvailabilityEnd(action.availabilityEnd ? new Date(action.availabilityEnd).toISOString().split("T")[0] : "");
      setCommunicationPolicy(action.communicationPolicy || "");
      setEligibilityPolicy(action.eligibilityPolicy || "");
      setStatus(action.status);
    }
  }, [action]);

  const selectedDomain = domains.find((d) => d.id === domainId);
  const availableProducts = selectedDomain?.products || [];

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

    const productActionCount =
      domains
        .find((d) => d.id === domainId)
        ?.products.find((p) => p.id === productId)
        ?.actionCount || 0;

    if (!action && productActionCount >= 25) {
      toast({
        title: "Limit Reached",
        description: "Maximum of 25 actions allowed per product",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: action?.id,
      name: name.trim(),
      description: description.trim(),
      domainId,
      productId,
      businessGoal,
      financialValue: parseFloat(financialValue) || 0,
      availability,
      availabilityStart: availability === "date-range" ? new Date(availabilityStart) : undefined,
      availabilityEnd: availability === "date-range" ? new Date(availabilityEnd) : undefined,
      communicationPolicy,
      eligibilityPolicy,
      triggerLogic: "",
      status,
      createdBy: action?.createdBy || "Current User",
    });

    toast({
      title: action ? "Action Updated" : "Action Created",
      description: `${name} has been ${action ? "updated" : "created"} successfully`,
    });

    handleClose();
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{action ? "Edit Action" : "Create New Action"}</DialogTitle>
          <DialogDescription>
            {action ? "Update the action details below" : "Create a new action with business goals and policies"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter action name"
              maxLength={100}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter action description"
              rows={2}
              maxLength={500}
            />
          </div>

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
                  {availableProducts.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="goal">Business Goal (1-5)</Label>
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
            </div>

            <div className="grid gap-2">
              <Label htmlFor="value">Financial Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={financialValue}
                onChange={(e) => setFinancialValue(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="availability">Availability</Label>
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
          </div>

          {availability === "date-range" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="start">Start Date</Label>
                <Input
                  id="start"
                  type="date"
                  value={availabilityStart}
                  onChange={(e) => setAvailabilityStart(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="end">End Date</Label>
                <Input
                  id="end"
                  type="date"
                  value={availabilityEnd}
                  onChange={(e) => setAvailabilityEnd(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="communication">Communication Policy</Label>
            <Input
              id="communication"
              value={communicationPolicy}
              onChange={(e) => setCommunicationPolicy(e.target.value)}
              placeholder="e.g., Ruleset A, Decision Tree B"
            />
            <p className="text-xs text-muted-foreground">Select pre-created ruleset, decision tree, scorecard, or ML model</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="eligibility">Eligibility Policy</Label>
            <Input
              id="eligibility"
              value={eligibilityPolicy}
              onChange={(e) => setEligibilityPolicy(e.target.value)}
              placeholder="e.g., Scorecard C, ML Model D"
            />
            <p className="text-xs text-muted-foreground">Select pre-created ruleset, decision tree, scorecard, or ML model</p>
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
          <Button onClick={handleSave}>{action ? "Update" : "Create"} Action</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
