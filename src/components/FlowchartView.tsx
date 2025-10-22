import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useBusinessMap, type Domain, type Product, type Action } from "@/hooks/use-business-map";

const FlowchartView = () => {
  const { domains, actions } = useBusinessMap();

  const getProductActions = (productId: string) => {
    return actions.filter(a => a.productId === productId);
  };

  return (
    <div className="w-full overflow-x-auto pb-8">
      <div className="min-w-max p-8">
        {/* Domains Layer */}
        <div className="flex gap-8 justify-center mb-12">
          {domains.map((domain) => (
            <div key={domain.id} className="flex flex-col items-center">
              <Card className="p-6 bg-card border-2 shadow-lg min-w-[280px]">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-foreground">{domain.name}</h3>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    Domain
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{domain.description}</p>
              </Card>

              {/* Connection Lines from Domain to Products */}
              {domain.products.length > 0 && (
                <div className="relative h-16 w-full">
                  <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                    <circle cx="50%" cy="8" r="4" fill="hsl(var(--primary))" />
                    <line 
                      x1="50%" 
                      y1="12" 
                      x2="50%" 
                      y2="64" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth="2"
                    />
                  </svg>
                </div>
              )}

              {/* Products Layer */}
              <div className="flex gap-6">
                {domain.products.map((product, pIndex) => (
                  <div key={product.id} className="flex flex-col items-center relative">
                    {/* Horizontal connector for multiple products */}
                    {domain.products.length > 1 && (
                      <svg 
                        className="absolute w-full h-16" 
                        style={{ 
                          top: '-64px',
                          left: pIndex === 0 ? '50%' : pIndex === domain.products.length - 1 ? '-50%' : '-50%',
                          width: pIndex === 0 ? '50%' : pIndex === domain.products.length - 1 ? '50%' : '100%',
                          overflow: 'visible'
                        }}
                      >
                        {pIndex > 0 && (
                          <line 
                            x1="0" 
                            y1="0" 
                            x2={pIndex === domain.products.length - 1 ? "100%" : "50%"}
                            y2="0" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth="2"
                          />
                        )}
                        {pIndex < domain.products.length - 1 && (
                          <line 
                            x1={pIndex === 0 ? "100%" : "50%"}
                            y1="0" 
                            x2="100%" 
                            y2="0" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth="2"
                          />
                        )}
                        <circle cx="50%" cy="0" r="4" fill="hsl(var(--primary))" />
                      </svg>
                    )}

                    <Card className="p-5 bg-card border shadow-md min-w-[240px]">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="text-lg font-semibold text-foreground">{product.name}</h4>
                        <Badge variant="outline" className="bg-secondary/50 text-secondary-foreground">
                          Product
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{product.description}</p>
                      <div className="text-xs text-muted-foreground">
                        {getProductActions(product.id).length} action{getProductActions(product.id).length !== 1 ? 's' : ''}
                      </div>
                    </Card>

                    {/* Connection Lines from Product to Actions */}
                    {getProductActions(product.id).length > 0 && (
                      <div className="relative h-16 w-full">
                        <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
                          <circle cx="50%" cy="8" r="4" fill="hsl(var(--primary))" />
                          <line 
                            x1="50%" 
                            y1="12" 
                            x2="50%" 
                            y2="64" 
                            stroke="hsl(var(--primary))" 
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Actions Layer */}
                    <div className="flex flex-col gap-4">
                      {getProductActions(product.id).map((action, aIndex) => (
                        <div key={action.id} className="flex flex-col items-center relative">
                          {/* Horizontal connector for multiple actions */}
                          {getProductActions(product.id).length > 1 && (
                            <svg 
                              className="absolute w-0.5 h-16" 
                              style={{ 
                                top: '-64px',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                overflow: 'visible'
                              }}
                            >
                              {aIndex > 0 && (
                                <line 
                                  x1="0" 
                                  y1="0" 
                                  x2="0" 
                                  y2={aIndex === getProductActions(product.id).length - 1 ? "100%" : "50%"}
                                  stroke="hsl(var(--primary))" 
                                  strokeWidth="2"
                                />
                              )}
                              <circle cx="0" cy="0" r="4" fill="hsl(var(--primary))" />
                            </svg>
                          )}

                          <Card className="p-4 bg-card border shadow-sm min-w-[220px]">
                            <div className="flex items-start justify-between mb-2">
                              <h5 className="text-base font-medium text-foreground">{action.name}</h5>
                              <Badge 
                                variant={action.status === "published" ? "default" : "secondary"}
                                className="text-xs"
                              >
                                Action
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{action.description}</p>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-4 rounded-sm ${
                                      i < action.businessGoal ? 'bg-primary' : 'bg-muted'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-medium text-foreground">
                                ${action.financialValue.toLocaleString()}
                              </span>
                            </div>
                            {action.availability !== 'always' && (
                              <div className="mt-2 text-xs text-muted-foreground">
                                {action.availability === 'not-available' ? '⏸ Not Available' : '📅 Date Range'}
                              </div>
                            )}
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {domains.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No domains found. Create your business map first.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FlowchartView;
