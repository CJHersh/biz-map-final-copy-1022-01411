import { useState, useEffect } from "react";
import { Plus, ChevronRight, Edit, Trash2, FolderTree, ChevronDown } from "lucide-react";
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
import { DomainDialog } from "@/components/DomainDialog";
import { ProductDialog } from "@/components/ProductDialog";
import { DeleteDialog } from "@/components/DeleteDialog";
import { toast } from "@/hooks/use-toast";
import { useBusinessMap } from "@/hooks/use-business-map";
import type { Domain, Product } from "@/hooks/use-business-map";

const MapBuilder = () => {
  const navigate = useNavigate();
  const { domains, setDomains, actions, setActions } = useBusinessMap();
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());
  
  const [domainDialogOpen, setDomainDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | undefined>();
  
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [selectedDomainForProduct, setSelectedDomainForProduct] = useState<string>("");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: "domain" | "product"; id: string; name: string } | null>(null);

  const toggleDomain = (domainId: string) => {
    const newExpanded = new Set(expandedDomains);
    if (newExpanded.has(domainId)) {
      newExpanded.delete(domainId);
    } else {
      newExpanded.add(domainId);
    }
    setExpandedDomains(newExpanded);
  };

  const handleSaveDomain = (domainData: Omit<Domain, "id" | "products" | "createdAt" | "updatedAt"> & { id?: string }) => {
    if (domainData.id) {
      // Update existing domain
      setDomains(domains.map(d => 
        d.id === domainData.id 
          ? { ...d, ...domainData, updatedAt: new Date() }
          : d
      ));
    } else {
      // Create new domain
      const newDomain: Domain = {
        ...domainData,
        id: crypto.randomUUID(),
        products: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDomains([...domains, newDomain]);
      setExpandedDomains(new Set([...expandedDomains, newDomain.id]));
    }
    setEditingDomain(undefined);
  };

  const handleEditDomain = (domain: Domain) => {
    setEditingDomain(domain);
    setDomainDialogOpen(true);
  };

  const handleDeleteDomain = (domain: Domain) => {
    setDeleteTarget({ type: "domain", id: domain.id, name: domain.name });
    setDeleteDialogOpen(true);
  };

  const handleSaveProduct = (productData: Omit<Product, "id" | "actionCount" | "createdAt" | "updatedAt"> & { id?: string }) => {
    if (productData.id) {
      // Update existing product
      setDomains(domains.map(d => ({
        ...d,
        products: d.products.map(p => {
          if (p.id === productData.id) {
            // Update action count based on actions for this product
            const productActionCount = actions.filter(a => a.productId === p.id).length;
            return { ...p, ...productData, actionCount: productActionCount, updatedAt: new Date() };
          }
          return p;
        }),
        updatedAt: new Date(),
      })));
    } else {
      // Create new product
      const newProduct: Product = {
        ...productData,
        id: crypto.randomUUID(),
        actionCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setDomains(domains.map(d => 
        d.id === productData.domainId
          ? { ...d, products: [...d.products, newProduct], updatedAt: new Date() }
          : d
      ));
    }
    setEditingProduct(undefined);
    setSelectedDomainForProduct("");
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

  const handleAddProduct = (domainId?: string) => {
    setSelectedDomainForProduct(domainId || "");
    setEditingProduct(undefined);
    setProductDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setSelectedDomainForProduct(product.domainId);
    setProductDialogOpen(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeleteTarget({ type: "product", id: product.id, name: product.name });
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === "domain") {
      // Delete all actions associated with this domain
      setActions(actions.filter(a => a.domainId !== deleteTarget.id));
      
      // Delete the domain (which contains products)
      setDomains(domains.filter(d => d.id !== deleteTarget.id));
      
      toast({
        title: "Domain Deleted",
        description: `${deleteTarget.name} and all its products and actions have been deleted successfully`,
      });
    } else {
      // Delete all actions associated with this product
      setActions(actions.filter(a => a.productId !== deleteTarget.id));
      
      // Delete the product from its domain
      setDomains(domains.map(d => ({
        ...d,
        products: d.products.filter(p => p.id !== deleteTarget.id),
      })));
      
      toast({
        title: "Product Deleted",
        description: `${deleteTarget.name} and all its actions have been deleted successfully`,
      });
    }
    
    setDeleteDialogOpen(false);
    setDeleteTarget(null);
  };

  const selectedDomain = domains.find(d => d.id === selectedDomainForProduct);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Button variant="ghost" onClick={() => navigate("/")} className="mb-2">
                ← Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-foreground">Business Map Builder</h1>
              <p className="text-muted-foreground mt-1">Create and manage your domain and product structure</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => { setEditingDomain(undefined); setDomainDialogOpen(true); }}>
                  <FolderTree className="mr-2 h-4 w-4" />
                  Create Domain
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAddProduct()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {domains.length === 0 ? (
          <Card className="border-dashed animate-fade-in">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                <FolderTree className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>No Domains Yet</CardTitle>
              <CardDescription className="max-w-md mx-auto">
                Start building your business map by creating your first domain. You can add up to 20 domains, each containing up to 12 products.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pb-6">
              <Button onClick={() => { setEditingDomain(undefined); setDomainDialogOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Domain
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden animate-fade-in">
            <CardHeader className="bg-muted/30 border-b py-5">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">Business Map Hierarchy</CardTitle>
                <div className="text-base text-muted-foreground">
                  {domains.length} {domains.length === 1 ? 'domain' : 'domains'} • {domains.reduce((sum, d) => sum + d.products.length, 0)} products
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {domains.map((domain, index) => (
                  <div key={domain.id} className="animate-fade-in" style={{ animationDelay: `${index * 30}ms` }}>
                    {/* Domain Row */}
                    <div className="group hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-4 px-8 py-5">
                        <button
                          onClick={() => toggleDomain(domain.id)}
                          className="flex items-center gap-3 flex-shrink-0"
                        >
                          <ChevronRight
                            className={`h-5 w-5 text-muted-foreground transition-transform ${
                              expandedDomains.has(domain.id) ? "rotate-90" : ""
                            }`}
                          />
                          <FolderTree className="h-6 w-6 text-primary" />
                        </button>
                        
                        <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                          {/* Name and Description */}
                          <div className="col-span-7 min-w-0">
                            <h3 className="font-semibold text-foreground text-base mb-1">{domain.name}</h3>
                            <p className="text-sm text-muted-foreground truncate">{domain.description}</p>
                          </div>
                          
                          {/* Products Count */}
                          <div className="col-span-2 text-center">
                            <div className="text-base font-medium text-foreground">{domain.products.length}</div>
                            <div className="text-xs text-muted-foreground">products</div>
                          </div>
                          
                          {/* Actions Count */}
                          <div className="col-span-2 text-center">
                            <div className="text-base font-medium text-foreground">{domain.products.reduce((sum, p) => sum + p.actionCount, 0)}</div>
                            <div className="text-xs text-muted-foreground">actions</div>
                          </div>
                          
                          {/* Actions */}
                          <div className="col-span-1 flex justify-end gap-1">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleEditDomain(domain)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleDeleteDomain(domain)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Products */}
                    {expandedDomains.has(domain.id) && (
                      <div className="bg-muted/20 animate-accordion-down">
                        {domain.products.length === 0 ? (
                          <div className="ml-20 mr-8 py-8 border-l-2 border-muted">
                            <div className="ml-8 text-center py-10 text-muted-foreground border border-dashed rounded-lg">
                              <p className="mb-4 text-base">No products in this domain yet</p>
                              <Button variant="outline" onClick={() => handleAddProduct(domain.id)}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add First Product
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {domain.products.map((product, productIndex) => (
                              <div
                                key={product.id}
                                className="ml-20 border-l-2 border-muted group/product hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-4 py-4 pr-8">
                                  <div className="w-8 border-b-2 border-muted flex-shrink-0" />
                                  <div className="h-3 w-3 rounded-full bg-primary flex-shrink-0" />
                                  
                                  <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
                                    {/* Name and Description */}
                                    <div className="col-span-5 min-w-0">
                                      <h4 className="font-medium text-foreground text-base mb-1">{product.name}</h4>
                                      <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                                    </div>
                                    
                                    {/* Status */}
                                    <div className="col-span-2 flex justify-center">
                                      <Badge variant={product.status === "published" ? "default" : "secondary"} className="text-sm px-3 py-1">
                                        {product.status}
                                      </Badge>
                                    </div>
                                    
                                    {/* Empty column for alignment */}
                                    <div className="col-span-2" />
                                    
                                    {/* Actions Count */}
                                    <div className="col-span-2 text-center">
                                      <div className="text-base font-medium text-foreground">{product.actionCount}</div>
                                      <div className="text-xs text-muted-foreground">actions</div>
                                    </div>
                                    
                                    {/* Actions */}
                                    <div className="col-span-1 flex justify-end gap-1">
                                      <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 text-sm opacity-0 group-hover/product:opacity-100 transition-opacity"
                                        onClick={() => navigate(`/actions?productId=${product.id}`)}
                                      >
                                        View Actions
                                      </Button>
                                      <Button 
                                        variant="default" 
                                        size="sm" 
                                        className="h-8 text-sm opacity-0 group-hover/product:opacity-100 transition-opacity"
                                        onClick={() => navigate(`/actions?productId=${product.id}&new=true`)}
                                      >
                                        <Plus className="h-4 w-4 mr-1" />
                                        New Action
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 opacity-0 group-hover/product:opacity-100 transition-opacity" onClick={() => handleEditProduct(product)}>
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-9 w-9 p-0 opacity-0 group-hover/product:opacity-100 transition-opacity" onClick={() => handleDeleteProduct(product)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="ml-20 border-l-2 border-muted">
                              <div className="py-4 pr-8 flex items-center">
                                <div className="w-8 border-b-2 border-muted flex-shrink-0" />
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="ml-3 h-9 text-sm text-muted-foreground hover:text-foreground"
                                  onClick={() => handleAddProduct(domain.id)}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Product
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <DomainDialog
        open={domainDialogOpen}
        onOpenChange={setDomainDialogOpen}
        domain={editingDomain}
        onSave={handleSaveDomain}
        existingDomainsCount={domains.length}
      />

      <ProductDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        product={editingProduct}
        domainId={selectedDomainForProduct || undefined}
        domainName={selectedDomain?.name}
        domains={selectedDomainForProduct ? undefined : domains}
        onSave={handleSaveProduct}
        existingProductsCount={selectedDomain?.products.length}
      />

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={deleteTarget?.type === "domain" ? "Delete Domain" : "Delete Product"}
        description={
          deleteTarget?.type === "domain"
            ? "Are you sure you want to delete this domain? All products and actions within it will also be deleted. This action cannot be undone."
            : "Are you sure you want to delete this product? All actions within it will also be deleted. This action cannot be undone."
        }
        itemName={deleteTarget?.name || ""}
      />
    </div>
  );
};

export default MapBuilder;
