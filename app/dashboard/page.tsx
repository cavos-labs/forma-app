'use client'

import { useState, useRef } from 'react';
import { useTheme } from '@/lib/theme-context';
import { useAuth } from '@/lib/auth-context';
import Sidebar from '@/app/components/Sidebar';
import UserManagement from '@/app/components/UserManagement';
import Memberships, { type MembershipsRef } from '@/app/components/Memberships';
import Payments from '@/app/components/Payments';
import CreateUserModal, { type UserFormData } from '@/app/components/CreateUserModal';
import { mockUsers } from '@/lib/mock-data';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const { gym } = useAuth();
  const [activeSection, setActiveSection] = useState('memberships');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [users, setUsers] = useState(mockUsers);
  const membershipsRef = useRef<MembershipsRef>(null);

  const handleCreateUser = () => {
    setIsCreateUserModalOpen(true);
  };

  const handleSaveUser = (userData: UserFormData) => {
    // The user creation is already handled by CreateUserModal with the real API
    // Close the modal and refresh the memberships list
    setIsCreateUserModalOpen(false);
    membershipsRef.current?.refresh();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'memberships':
        return <Memberships ref={membershipsRef} onCreateUser={handleCreateUser} />;
      case 'payments':
        return <Payments />;
      case 'analytics':
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4" style={{ color: colors.foreground }}>
              Analytics
            </h1>
            <p style={{ color: colors.muted }}>
              Analytics dashboard coming soon...
            </p>
          </div>
        );
      default:
        return <Memberships ref={membershipsRef} onCreateUser={handleCreateUser} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.background }}>
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content - responsive layout */}
      <div className="md:ml-72 lg:ml-80 min-h-screen">
        {/* Mobile padding and safe area */}
        <div className="pt-16 md:pt-0 pb-4 px-4 md:px-0">
          <div className="overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSave={handleSaveUser}
      />
    </div>
  );
}