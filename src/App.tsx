import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import Index from '@/pages/Index';
import Auth from '@/pages/Auth';
import Profile from '@/pages/Profile';
import ExperienceDetail from '@/pages/ExperienceDetail';
import CreateExperience from '@/pages/CreateExperience';
import EditExperience from '@/pages/EditExperience';
import ExperiencesByCategory from '@/pages/ExperiencesByCategory';
import Search from '@/pages/Search';
import NotFound from '@/pages/NotFound';
import PasswordReset from '@/pages/PasswordReset';
import CreateExperienceFromCategory from '@/pages/CreateExperienceFromCategory';
import { Privacy } from '@/pages/Privacy';
import { Terms } from '@/pages/Terms';
import { GDPR } from '@/pages/GDPR';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-background text-foreground">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/search" element={<Search />} />
            <Route path="/create" element={<CreateExperience />} />
            <Route path="/create/:category" element={<CreateExperienceFromCategory />} />
            <Route path="/edit/:id" element={<EditExperience />} />
            <Route path="/categoria/:category" element={<ExperiencesByCategory />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/gdpr" element={<GDPR />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;