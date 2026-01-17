import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Tasks from "./pages/Tasks";
import Goals from "./pages/Goals";
import CalendarPage from "./pages/CalendarPage";
import Chat from "./pages/Chat";
import Timetables from "./pages/Timetables";
import Team from "./pages/Team";
import TwentyOneTasks from "./pages/TwentyOneTasks";
import Notes from "./pages/Notes";
import Projects from "./pages/Projects";
import WeeklyTasks from "./pages/WeeklyTasks";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/timetables" element={<Timetables />} />
              <Route path="/team" element={<Team />} />
              <Route path="/21-tasks" element={<TwentyOneTasks />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/weekly-tasks" element={<WeeklyTasks />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
