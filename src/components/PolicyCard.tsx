import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X, Info } from "lucide-react";
import type { PolicyArtifact } from "@/pages/ActionForm";

interface PolicyCardProps {
  artifact: PolicyArtifact;
  onRemove: () => void;
  showRemove?: boolean;
  inheritedFrom?: "domain" | "product" | null;
}

export const PolicyCard = ({ artifact, onRemove, showRemove = true, inheritedFrom = null }: PolicyCardProps) => {
  const getTypeColor = (type: PolicyArtifact["type"]) => {
    switch (type) {
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

  const formatType = (type: PolicyArtifact["type"]) => {
    return type.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  return (
    <Card className="relative">
      <CardContent className="p-4">
        {showRemove && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 h-8 w-8 p-0"
            onClick={onRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        
        <div className={showRemove ? "pr-8" : ""}>
          <div className="flex items-start gap-2 mb-2">
            <h4 className="font-medium text-sm flex-1">{artifact.name}</h4>
            <div className="flex items-center gap-2">
              {inheritedFrom && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge variant="secondary" className="text-xs">
                        <Info className="h-3 w-3 mr-1" />
                        Inherited
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Inherited from {inheritedFrom}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Badge variant="outline" className={getTypeColor(artifact.type)}>
                {formatType(artifact.type)}
              </Badge>
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3">{artifact.description}</p>
          
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">v{artifact.version}</span>
            <span>•</span>
            <span>Updated {artifact.lastUpdated.toLocaleDateString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
