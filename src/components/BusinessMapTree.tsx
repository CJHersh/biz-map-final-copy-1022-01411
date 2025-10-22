import { ChevronDown, ChevronRight, FolderTree, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { cn } from "@/lib/utils";
import type { Domain } from "@/hooks/use-business-map";

interface BusinessMapTreeProps {
  domains: Domain[];
  selectedDomainId?: string;
  previewProductName?: string;
}

export const BusinessMapTree = ({ 
  domains, 
  selectedDomainId,
  previewProductName 
}: BusinessMapTreeProps) => {
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(
    new Set(selectedDomainId ? [selectedDomainId] : [])
  );

  const toggleDomain = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  // Auto-expand the selected domain
  if (selectedDomainId && !expandedDomains.has(selectedDomainId)) {
    setExpandedDomains(new Set([...expandedDomains, selectedDomainId]));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FolderTree className="h-4 w-4" />
          Business Map Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {domains.map((domain) => {
            const isSelected = domain.id === selectedDomainId;
            const isExpanded = expandedDomains.has(domain.id);
            const selectedDomainProducts = domain.products;

            return (
              <div key={domain.id} className="space-y-1">
                <div
                  className={cn(
                    "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors",
                    isSelected 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => toggleDomain(domain.id)}
                >
                  <button
                    className="flex-shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleDomain(domain.id);
                    }}
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                  <FolderTree className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <span className={cn(
                    "text-sm font-medium flex-1 truncate",
                    isSelected && "text-primary"
                  )}>
                    {domain.name}
                  </span>
                  <Badge 
                    variant="secondary" 
                    className="text-xs flex-shrink-0"
                  >
                    {domain.products.length}
                  </Badge>
                </div>

                {isExpanded && (
                  <div className="ml-6 space-y-1 border-l-2 border-muted pl-2">
                    {selectedDomainProducts.map((product) => (
                      <div
                        key={product.id}
                        className="flex items-center gap-2 p-2 rounded-md text-sm"
                      >
                        <Package className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="truncate">{product.name}</span>
                      </div>
                    ))}
                    
                    {/* Preview of new product being created */}
                    {isSelected && previewProductName && (
                      <div
                        className="flex items-center gap-2 p-2 rounded-md text-sm bg-primary/5 border border-primary/20"
                      >
                        <Package className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                        <span className="truncate text-primary font-medium">
                          {previewProductName || "New Product"}
                        </span>
                        <Badge variant="outline" className="text-xs ml-auto">
                          New
                        </Badge>
                      </div>
                    )}

                    {selectedDomainProducts.length === 0 && !previewProductName && (
                      <div className="text-xs text-muted-foreground italic p-2">
                        No products yet
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {domains.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4">
              No domains found
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
