import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import InspectionList from "./pages/InspectionList";
import InspectionDetail from "./pages/InspectionDetail";
import NewInspection from "./pages/NewInspection";
import ImportData from "./pages/ImportData";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/inspections"} component={InspectionList} />
      <Route path={"/inspections/new"} component={NewInspection} />
      <Route path={"/inspections/:id"} component={InspectionDetail} />
      <Route path={"/import"} component={ImportData} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

