import { RoleGuard } from '@/components/RoleGuard';
import { AdminDashboard } from '@/components/AdminDashboard';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const Admin = () => {
  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <AdminDashboard />
        </main>
        <Footer />
      </div>
    </RoleGuard>
  );
};

export default Admin;
