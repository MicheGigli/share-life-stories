import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import ExperienceDetail from '@/pages/ExperienceDetail';
import CreateExperience from '@/pages/CreateExperience';
import ExperiencesByCategory from '@/pages/ExperiencesByCategory';
import Search from '@/pages/Search';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/create" element={<CreateExperience />} />
            <Route path="/categoria/:category" element={<ExperiencesByCategory />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;