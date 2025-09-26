import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { store } from "./store/store";
import { theme } from "./theme/theme";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ProjectDetails from "./pages/ProjectDetails";
import AddProject from "./pages/AddProject";
import MyProjects from "./pages/MyProjects";
import Explore from "./pages/Explore";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/project/:id" element={<ProjectDetails />} />
              <Route path="/add-project" element={<AddProject />} />
              <Route path="/my-projects" element={<MyProjects />} />
              <Route path="/profile" element={<Profile />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              <Route path="/explore" element={<Explore />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </Provider>
);

export default App;
