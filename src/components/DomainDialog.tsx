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

interface Domain {
  id: string;
  name: string;
  description: string;
  communicationPolicy: string;
  eligibilityPolicy: string;
}

interface DomainDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  domain?: Domain;
  onSave: (domain: Omit<Domain, "id"> & { id?: string }) => void;
  existingDomainsCount: number;
}

export const DomainDialog = ({
  open,
  onOpenChange,
  domain,
  onSave,
  existingDomainsCount,
}: DomainDialogProps) => {
  const [name, setName] = useState(domain?.name || "");
  const [description, setDescription] = useState(domain?.description || "");
  const [communicationPolicy, setCommunicationPolicy] = useState(domain?.communicationPolicy || "");
  const [eligibilityPolicy, setEligibilityPolicy] = useState(domain?.eligibilityPolicy || "");

  const handleSave = () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Domain name is required",
        variant: "destructive",
      });
      return;
    }

    if (!domain && existingDomainsCount >= 20) {
      toast({
        title: "Limit Reached",
        description: "Maximum of 20 domains allowed",
        variant: "destructive",
      });
      return;
    }

    onSave({
      id: domain?.id,
      name: name.trim(),
      description: description.trim(),
      communicationPolicy,
      eligibilityPolicy,
    });

    toast({
      title: domain ? "Domain Updated" : "Domain Created",
      description: `${name} has been ${domain ? "updated" : "created"} successfully`,
    });

    handleClose();
  };

  const handleClose = () => {
    setName(domain?.name || "");
    setDescription(domain?.description || "");
    setCommunicationPolicy(domain?.communicationPolicy || "");
    setEligibilityPolicy(domain?.eligibilityPolicy || "");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{domain ? "Edit Domain" : "Create New Domain"}</DialogTitle>
          <DialogDescription>
            {domain
              ? "Update the domain details below"
              : `Create a new domain. You can have up to 20 domains (${existingDomainsCount}/20 used)`}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter domain name"
              maxLength={100}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter domain description"
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
              Will be inherited by all products and actions (can be overridden)
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
              Will be inherited by all products and actions (can be overridden)
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{domain ? "Update" : "Create"} Domain</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
