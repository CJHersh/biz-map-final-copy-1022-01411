import { useState, useEffect } from "react";
import { Plus, FolderTree, ListChecks, BarChart3, ChevronRight, ChevronDown, Package, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useBusinessMap } from "@/hooks/use-business-map";
import { GlobalPoliciesSheet } from "@/components/GlobalPoliciesSheet";
import type { Domain, Product } from "@/hooks/use-business-map";

const Dashboard = () => {
  const navigate = useNavigate();
  const { domains, setDomains, actions, setActions, globalPolicies, setGlobalPolicies } = useBusinessMap();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  const [compactMode, setCompactMode] = useState(false);
  const [globalPoliciesDialogOpen, setGlobalPoliciesDialogOpen] = useState(false);

  const stats = {
    totalDomains: domains.length,
    totalProducts: domains.reduce((sum, d) => sum + d.products.length, 0),
    totalActions: actions.length,
  };

  // Expand all domains by default on initial load
  useEffect(() => {
    if (domains.length > 0 && expandedDomains.size === 0) {
      setExpandedDomains(new Set(domains.map(d => d.id)));
    }
  }, [domains]);

  const toggleDomain = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const handleAddProduct = (domainId?: string) => {
    if (domainId) {
      navigate(`/products/new?domainId=${domainId}`);
    } else {
      navigate("/products/new");
    }
  };

  // Update action counts when actions change
  useEffect(() => {
    setDomains(prevDomains => 
      prevDomains.map(d => ({
        ...d,
        products: d.products.map(p => ({
          ...p,
          actionCount: actions.filter(a => a.productId === p.id).length,
        })),
      }))
    );
  }, [actions]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Domains</CardTitle>
              <FolderTree className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDomains}</div>
              <p className="text-xs text-muted-foreground">Business domains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <FolderTree className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">Across all domains</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Actions</CardTitle>
              <ListChecks className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalActions}</div>
              <p className="text-xs text-muted-foreground">Total configured</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Map Hierarchy */}
        {domains.length === 0 ? (
          <Card className="border-dashed">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <FolderTree className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>No Business Map Yet</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Start building your business map by creating your first domain. You can add up to 20 domains, each containing up to 12 products.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button onClick={() => navigate("/domains/new")}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Domain
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Business Map Hierarchy</h2>
              <div className="flex gap-2">
                <div className="flex items-center gap-2 border rounded-md px-3 py-2">
                  <label htmlFor="compact-toggle" className="text-sm font-medium cursor-pointer">
                    Compact
                  </label>
                  <input
                    id="compact-toggle"
                    type="checkbox"
                    checked={compactMode}
                    onChange={(e) => setCompactMode(e.target.checked)}
                    className="w-4 h-4 cursor-pointer"
                  />
                </div>
                <Button variant="outline" onClick={() => setGlobalPoliciesDialogOpen(true)}>
                  <Globe className="mr-2 h-4 w-4" />
                  Global Policies
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Create New
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => navigate("/domains/new")}>
                      <FolderTree className="mr-2 h-4 w-4" />
                      Create Domain
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/products/new")}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Product
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Domain Cards */}
            {domains.map((domain) => (
              <Card key={domain.id} className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Domain Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div 
                        className="flex-1 cursor-pointer"
                        onClick={() => navigate(`/domains/edit?id=${domain.id}`)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-xl">{domain.name}</h3>
                          <Badge 
                            variant="secondary" 
                            className="bg-green-100 text-green-700 hover:bg-green-100 border-0"
                          >
                            published
                          </Badge>
                        </div>
                        {!compactMode && (
                          <>
                            <p className="text-muted-foreground mb-3">{domain.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1.5">
                                <Package className="h-4 w-4" />
                                <span>{domain.products.length} products</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <ListChecks className="h-4 w-4" />
                                <span>{actions.filter(a => a.domainId === domain.id).length} actions</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="h-4 w-4" />
                                <span>{domain.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button 
                          onClick={() => handleAddProduct(domain.id)}
                          className="gap-2"
                        >
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleDomain(domain.id)}
                        >
                          <ChevronRight
                            className={`h-5 w-5 transition-transform ${
                              expandedDomains.has(domain.id) ? "rotate-90" : ""
                            }`}
                          />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Products Section */}
                    {expandedDomains.has(domain.id) && (
                      <div className="space-y-3 mt-4">
                        {domain.products.length === 0 ? (
                          <div className="text-center py-16 text-muted-foreground bg-muted/30 rounded-lg">
                            <p className="text-sm">No products yet. Add your first product to get started.</p>
                          </div>
                        ) : (
                          domain.products.map((product) => (
                            <Card 
                              key={product.id} 
                              className="bg-muted/30 border-muted hover:bg-muted/50 transition-colors cursor-pointer"
                              onClick={() => navigate(`/products/edit?id=${product.id}`)}
                            >
                              <CardContent className={compactMode ? "p-3" : "p-6"}>
                                <div className={`flex items-center gap-2 ${compactMode ? "" : "mb-2"}`}>
                                  <h4 className={`font-medium ${compactMode ? "text-base" : "text-lg"}`}>{product.name}</h4>
                                  <Badge 
                                    variant={product.status === "published" ? "secondary" : "secondary"} 
                                    className={product.status === "published" 
                                      ? "bg-green-100 text-green-700 hover:bg-green-100 border-0"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-100 border-0"
                                    }
                                  >
                                    {product.status}
                                  </Badge>
                                </div>
                                {!compactMode && (
                                  <>
                                    <p className="text-muted-foreground mb-3">{product.description}</p>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                      <button 
                                        className="flex items-center gap-1.5 hover:text-primary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          navigate(`/actions?productId=${product.id}`);
                                        }}
                                      >
                                        <ListChecks className="h-4 w-4" />
                                        <span>{product.actionCount}</span>
                                      </button>
                                      <div className="flex items-center gap-1.5">
                                        <Clock className="h-4 w-4" />
                                        <span>{product.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                      </div>
                                    </div>
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <GlobalPoliciesSheet
        open={globalPoliciesDialogOpen}
        onOpenChange={setGlobalPoliciesDialogOpen}
        globalPolicies={globalPolicies}
        onSave={setGlobalPolicies}
      />
    </div>
  );
};

export default Dashboard;
