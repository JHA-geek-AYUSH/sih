import { useState } from "react";
import { Header } from "@/components/Header";
import { PatientInterface } from "@/components/PatientInterface";
import { PharmacyDashboard } from "@/components/PharmacyDashboard";
import { AdminDashboard } from "@/components/AdminDashboard";

const Index = () => {
  const [currentRole, setCurrentRole] = useState<'patient' | 'pharmacy' | 'admin'>('patient');

  const renderContent = () => {
    switch (currentRole) {
      case 'patient':
        return <PatientInterface />;
      case 'pharmacy':
        return <PharmacyDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <PatientInterface />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-background dark:bg-gradient-to-br dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header currentRole={currentRole} onRoleChange={setCurrentRole} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderContent()}
      </main>
      
      {/* Footer */}
      <footer className="bg-card dark:bg-gray-800 mt-12 border-t dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-muted-foreground">
            <p className="mb-2">Rural Healthcare Management System (RHMS)</p>
            <p className="text-sm">Powered by AI • Connecting Rural Communities • Saving Lives</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
