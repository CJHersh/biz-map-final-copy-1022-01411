import { useState, useMemo, useEffect } from "react";
import { Plus, Search, Package, Map } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { DeleteDialog } from "@/components/DeleteDialog";
import { toast } from "@/hooks/use-toast";
import { useBusinessMap } from "@/hooks/use-business-map";
import type { Action } from "@/hooks/use-business-map";
import FlowchartView from "@/components/FlowchartView";

const ActionManager = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { domains, actions, setActions } = useBusinessMap();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDomain, setFilterDomain] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [mapSheetOpen, setMapSheetOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Handle URL params for filtering
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const productId = params.get('productId');
    const domainId = params.get('domainId');
    
    if (productId) {
      setFilterProduct(productId);
      const product = domains.flatMap(d => d.products).find(p => p.id === productId);
      if (product) {
        setFilterDomain(product.domainId);
      }
    } else if (domainId) {
      setFilterDomain(domainId);
      setFilterProduct("all");
    }
  }, [location.search, domains]);

  const handleTogglePublish = (action: Action) => {
    const newStatus = action.status === "published" ? "draft" : "published";
    setActions(actions.map(a => 
      a.id === action.id 
        ? { ...a, status: newStatus, updatedAt: new Date() }
        : a
    ));
    toast({
      title: newStatus === "published" ? "Action Published" : "Action Unpublished",
      description: `${action.name} is now ${newStatus}`,
    });
  };


  const handleDeleteAction = (action: Action) => {
    setDeleteTarget({ id: action.id, name: action.name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    
    setActions(actions.filter(a => a.id !== deleteTarget.id));
    toast({
      title: "Action Deleted",
      description: `${deleteTarget.name} has been deleted successfully`,
    });
    
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };


  // Enrich actions with product and domain names
  const enrichedActions = useMemo(() => {
    return actions.map(action => {
      const product = domains.flatMap(d => d.products).find(p => p.id === action.productId);
      const domain = domains.find(d => d.id === action.domainId);
      return {
        ...action,
        productName: product?.name || "Unknown Product",
        domainName: domain?.name || "Unknown Domain",
      };
    });
  }, [actions, domains]);

  // Filter actions
  const filteredActions = enrichedActions.filter(action => {
    const matchesSearch = action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         action.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDomain = filterDomain === "all" || action.domainId === filterDomain;
    const matchesProduct = filterProduct === "all" || action.productId === filterProduct;
    const matchesStatus = filterStatus === "all" || action.status === filterStatus;
    
    return matchesSearch && matchesDomain && matchesProduct && matchesStatus;
  });

  const availableProducts = filterDomain === "all" 
    ? domains.flatMap(d => d.products)
    : domains.find(d => d.id === filterDomain)?.products || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Actions</h1>
            <p className="text-muted-foreground mt-1">Manage and configure business actions</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setMapSheetOpen(true)}
            >
              <Map className="mr-2 h-4 w-4" />
              View Map
            </Button>
            <Button onClick={() => navigate("/actions/new")} disabled={domains.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Create Action
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-5">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search actions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={filterDomain} onValueChange={(val) => { setFilterDomain(val); setFilterProduct("all"); }}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Domains" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains.map(domain => (
                      <SelectItem key={domain.id} value={domain.id}>{domain.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterProduct} onValueChange={setFilterProduct}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Products" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    {availableProducts.map(product => (
                      <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

        {/* Table View */}
        {domains.length === 0 ? (
              <Card className="border-dashed">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                    <Package className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle>No Business Map Yet</CardTitle>
                  <CardDescription className="max-w-md mx-auto">
                    Before creating actions, you need to set up your business map with domains and products.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-6">
                  <Button onClick={() => navigate("/")}>
                    Go to Business Map
                  </Button>
                </CardContent>
              </Card>
            ) : filteredActions.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || filterStatus !== "all" || filterProduct !== "all"
                      ? "No actions match your filters"
                      : "No actions yet. Create your first action to get started."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="bg-card border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">ACTION NAME</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">DOMAIN / PRODUCT</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">GOAL</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">VALUE</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">VOLUME</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">IMPRESSION</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">CONVERSION</th>
                        <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActions.map((action, index) => (
                        <tr 
                          key={action.id} 
                          className="border-b last:border-b-0 hover:bg-muted/30 transition-colors cursor-pointer" 
                          onClick={() => navigate(`/actions/edit?id=${action.id}`)}
                        >
                          <td className="px-6 py-4">
                            <div className="font-medium text-foreground">{action.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm">
                              <div className="font-medium text-foreground">{action.domainName}</div>
                              <div className="text-muted-foreground">{action.productName}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <div
                                  key={i}
                                  className={`w-2 h-6 rounded-sm ${
                                    i < action.businessGoal ? 'bg-primary' : 'bg-muted'
                                  }`}
                                />
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-foreground font-medium">
                            ${action.financialValue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {action.volume?.toLocaleString() || '-'}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {action.impressionRate ? `${action.impressionRate}%` : '-'}
                          </td>
                          <td className="px-6 py-4 text-foreground">
                            {action.conversionRate ? `${action.conversionRate}%` : '-'}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={action.status === "published" ? "default" : "secondary"}>
                              {action.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
      </div>

      {/* Map Sheet */}
      <Sheet open={mapSheetOpen} onOpenChange={setMapSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl">
          <SheetHeader>
            <SheetTitle>Business Map</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <FlowchartView />
          </div>
        </SheetContent>
      </Sheet>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Action"
        description="Are you sure you want to delete this action? This action cannot be undone."
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
};

export default ActionManager;
