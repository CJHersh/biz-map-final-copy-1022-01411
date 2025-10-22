import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemName: string;
  productsCount?: number;
  actionsCount?: number;
}

export const DeleteDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  title, 
  description, 
  itemName,
  productsCount,
  actionsCount
}: DeleteDialogProps) => {
  const [confirmText, setConfirmText] = useState("");
  const isConfirmed = confirmText === itemName;

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setConfirmText("");
    }
    onOpenChange(newOpen);
  };

  const handleConfirm = () => {
    if (isConfirmed) {
      onConfirm();
      setConfirmText("");
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>{description}</div>
            
            {(productsCount !== undefined || actionsCount !== undefined) && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>
                  <div className="font-semibold mb-2">Impact:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {productsCount !== undefined && (
                      <li>{productsCount} product{productsCount !== 1 ? 's' : ''} will be deleted</li>
                    )}
                    {actionsCount !== undefined && (
                      <li>{actionsCount} action{actionsCount !== 1 ? 's' : ''} will be deleted</li>
                    )}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2 mt-4">
              <Label htmlFor="confirm-name" className="text-foreground">
                Type <strong className="font-mono">{itemName}</strong> to confirm:
              </Label>
              <Input
                id="confirm-name"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={`Type "${itemName}" to confirm`}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setConfirmText("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            disabled={!isConfirmed}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
