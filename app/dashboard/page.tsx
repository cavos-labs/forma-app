'use client'

import { useState, useRef } from 'react';
import { useTheme } from '@/lib/theme-context';
import Sidebar from '@/app/components/Sidebar';
import Memberships, { type MembershipsRef } from '@/app/components/Memberships';
import Payments from '@/app/components/Payments';
import CreateUserModal from '@/app/components/CreateUserModal';

export default function AdminDashboard() {
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState('memberships');
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const membershipsRef = useRef<MembershipsRef>(null);

  const handleCreateUser = () => {
    setIsCreateUserModalOpen(true);
  };

  const handleSaveUser = () => {
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