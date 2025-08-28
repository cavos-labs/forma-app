"use client";

import { useState, useRef } from "react";
import { useTheme } from "@/lib/theme-context";
import Sidebar from "@/app/components/Sidebar";
import Memberships, { type MembershipsRef } from "@/app/components/Memberships";
import Payments from "@/app/components/Payments";
import Classes, { type ClassesRef } from "@/app/components/Classes";
import CreateUserModal from "@/app/components/CreateUserModal";
import EditUserModal from "@/app/components/EditUserModal";
import ReceiptModal from "@/app/components/ReceiptModal";
import { MembershipData } from "@/lib/types";

export default function AdminDashboard() {
  const { colors } = useTheme();
  const [activeSection, setActiveSection] = useState("memberships");
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);

  // Add missing state variables for EditUserModal
  const [editUserModalOpen, setEditUserModalOpen] = useState(false);
  const [selectedMembership, setSelectedMembership] =
    useState<MembershipData | null>(null);

  // Add missing state variables for ReceiptModal
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<{
    imageUrl: string;
    paymentInfo: {
      amount: number;
      date: string;
      reference?: string;
      phone?: string;
    };
  } | null>(null);

  const membershipsRef = useRef<MembershipsRef>(null);
  const classesRef = useRef<ClassesRef>(null);

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
      case "memberships":
        return (
          <Memberships
            ref={membershipsRef}
            onCreateUser={handleCreateUser}
            onEditUser={(membership) => {
              setSelectedMembership(membership);
              setEditUserModalOpen(true);
            }}
            onViewReceipt={(receiptData) => {
              setSelectedReceipt(receiptData);
              setReceiptModalOpen(true);
            }}
          />
        );
      case "payments":
        return <Payments />;
      case "classes":
        return <Classes ref={classesRef} />;
      default:
        return (
          <Memberships
            ref={membershipsRef}
            onCreateUser={handleCreateUser}
            onEditUser={(membership) => {
              setSelectedMembership(membership);
              setEditUserModalOpen(true);
            }}
            onViewReceipt={(receiptData) => {
              setSelectedReceipt(receiptData);
              setReceiptModalOpen(true);
            }}
          />
        );
    }
  };

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      {/* Main Content - responsive layout */}
      <div className="md:ml-72 lg:ml-80 min-h-screen">
        {/* Mobile padding and safe area */}
        <div className="pt-16 md:pt-0 pb-4 px-4 md:px-0">
          <div className="overflow-auto">{renderContent()}</div>
        </div>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        isOpen={isCreateUserModalOpen}
        onClose={() => setIsCreateUserModalOpen(false)}
        onSave={handleSaveUser}
      />

      {/* Edit User Modal */}
      <EditUserModal
        isOpen={editUserModalOpen}
        onClose={() => {
          setEditUserModalOpen(false);
          setSelectedMembership(null);
        }}
        membership={selectedMembership}
        onSave={handleSaveUser}
        onSuccess={handleSaveUser}
      />

      {/* Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          isOpen={receiptModalOpen}
          onClose={() => {
            setReceiptModalOpen(false);
            setSelectedReceipt(null);
          }}
          imageUrl={selectedReceipt.imageUrl}
          paymentInfo={selectedReceipt.paymentInfo}
        />
      )}
    </div>
  );
}
