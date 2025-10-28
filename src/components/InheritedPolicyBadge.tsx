import { Badge } from "@/components/ui/badge";
import { Globe, Building2, Package } from "lucide-react";

interface InheritedPolicyBadgeProps {
  level: "global" | "domain" | "product";
}

export const InheritedPolicyBadge = ({ level }: InheritedPolicyBadgeProps) => {
  const config = {
    global: {
      icon: Globe,
      label: "Global",
      className: "bg-blue-500/10 text-blue-700 border-blue-200 hover:bg-blue-500/20",
    },
    domain: {
      icon: Building2,
      label: "Domain",
      className: "bg-purple-500/10 text-purple-700 border-purple-200 hover:bg-purple-500/20",
    },
    product: {
      icon: Package,
      label: "Product",
      className: "bg-green-500/10 text-green-700 border-green-200 hover:bg-green-500/20",
    },
  };

  const { icon: Icon, label, className } = config[level];

  return (
    <Badge variant="outline" className={className}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
};
