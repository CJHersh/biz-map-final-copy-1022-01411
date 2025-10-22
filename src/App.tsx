import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/AppLayout";
import Dashboard from "./pages/Dashboard";
import DomainForm from "./pages/DomainForm";
import ProductForm from "./pages/ProductForm";
import ActionManager from "./pages/ActionManager";
import ActionForm from "./pages/ActionForm";
import Setup from "./pages/Setup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/setup" element={<Setup />} />
            <Route path="/domains/new" element={<DomainForm />} />
            <Route path="/domains/edit" element={<DomainForm />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit" element={<ProductForm />} />
            <Route path="/actions" element={<ActionManager />} />
            <Route path="/actions/new" element={<ActionForm />} />
            <Route path="/actions/edit" element={<ActionForm />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
