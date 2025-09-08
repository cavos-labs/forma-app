"use client";

import React, { useState } from "react";
import { useTheme } from "@/lib/theme-context";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { authApi, ApiError } from "@/lib/api";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (userData: UserFormData) => void;
  onSuccess?: (userData: UserFormData) => void;
}

export interface UserFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  monthly_fee: number;
  start_date: string;
}

interface FormErrors {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  monthly_fee?: string;
  start_date?: string;
}

export default function CreateUserModal({
  isOpen,
  onClose,
  onSave,
  onSuccess,
}: CreateUserModalProps) {
  const { theme, colors } = useTheme();
  const { language } = useLanguage();
  const { gym } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMessage, setSuccessMessage] = useState<string>("");

  const [formData, setFormData] = useState<UserFormData>(() => ({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    monthly_fee: gym?.monthly_fee || 25000,
    start_date: new Date().toISOString().split("T")[0],
  }));

  // Update monthly_fee when gym changes or modal opens
  React.useEffect(() => {
    if (gym?.monthly_fee && isOpen) {
      setFormData((prev) => ({ ...prev, monthly_fee: gym.monthly_fee }));
    }
  }, [gym?.monthly_fee, isOpen]);

  if (!isOpen) return null;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name =
        language === "es" ? "El nombre es requerido" : "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name =
        language === "es"
          ? "El apellido es requerido"
          : "Last name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email =
        language === "es" ? "El email es requerido" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email =
        language === "es" ? "Email inválido" : "Invalid email format";
    }

    if (formData.phone && !/^\+?[0-9\s-]{8,}$/.test(formData.phone)) {
      newErrors.phone =
        language === "es"
          ? "Número de teléfono inválido"
          : "Invalid phone number";
    }

    if (formData.date_of_birth) {
      const birthDate = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (age < 16) {
        newErrors.date_of_birth =
          language === "es"
            ? "Debe ser mayor de 16 años"
            : "Must be at least 16 years old";
      }
    }

    if (!formData.monthly_fee || formData.monthly_fee <= 0) {
      newErrors.monthly_fee =
        language === "es"
          ? "La mensualidad debe ser mayor a 0"
          : "Monthly fee must be greater than 0";
    }

    if (!formData.start_date) {
      newErrors.start_date =
        language === "es"
          ? "La fecha de inicio es requerida"
          : "Start date is required";
    } else {
      const startDate = new Date(formData.start_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (startDate < today) {
        newErrors.start_date =
          language === "es"
            ? "La fecha de inicio no puede ser anterior a hoy"
            : "Start date cannot be before today";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const processedValue =
      name === "monthly_fee" ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));

    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (!gym?.id) {
      setErrors({
        email:
          language === "es"
            ? "Error: No se encontró información del gimnasio"
            : "Error: Gym information not found",
      });
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await authApi.createUser({
        email: formData.email,
        firstName: formData.first_name,
        lastName: formData.last_name,
        phone: formData.phone || undefined,
        dateOfBirth: formData.date_of_birth || undefined,
        gymId: gym.id,
        monthlyFee: formData.monthly_fee,
        startDate: formData.start_date,
      });

      if (response.success) {
        const successMsg =
          language === "es"
            ? `Usuario ${response.user?.firstName} ${response.user?.lastName} creado exitosamente. Se ha enviado un email con los detalles de pago.`
            : `User ${response.user?.firstName} ${response.user?.lastName} created successfully. Payment details email has been sent.`;

        setSuccessMessage(successMsg);

        onSave?.({
          ...formData,
          email: response.user?.email || formData.email,
          first_name: response.user?.firstName || formData.first_name,
          last_name: response.user?.lastName || formData.last_name,
        });

        onSuccess?.({
          ...formData,
          email: response.user?.email || formData.email,
          first_name: response.user?.firstName || formData.first_name,
          last_name: response.user?.lastName || formData.last_name,
        });

        setTimeout(() => {
          setFormData({
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            date_of_birth: "",
            monthly_fee: gym?.monthly_fee || 25000,
            start_date: new Date().toISOString().split("T")[0],
          });
          setSuccessMessage("");
          onClose();
        }, 2000);
      } else {
        throw new Error(response.error || "Failed to create user");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      let errorMessage =
        language === "es" ? "Error al crear el usuario" : "Error creating user";

      if (error instanceof ApiError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CR", {
      style: "currency",
      currency: "CRC",
    }).format(amount);
  };

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Modal */}
      <div
        className="rounded-3xl p-0 text-left overflow-hidden shadow-2xl transform transition-all max-w-4xl w-full relative animate-in fade-in-0 zoom-in-95 duration-300"
        style={{
          backgroundColor: colors.background,
          border: `1px solid ${theme === "dark" ? "#2a2a2a" : "#e5e7eb"}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with gradient background */}
        <div
          className="px-8 py-6 border-b"
          style={{
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            borderColor: theme === "dark" ? "#2a2a2a" : "#e5e7eb",
          }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: colors.buttonBackground }}
              >
                <svg
                  className="w-6 h-6"
                  style={{ color: colors.buttonText }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <div>
                <h3
                  className="text-2xl font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "Romagothic, sans-serif",
                    color: colors.foreground,
                    letterSpacing: "0.1em",
                  }}
                >
                  {language === "es" ? "NUEVO MIEMBRO" : "NEW MEMBER"}
                </h3>
                <p className="text-sm mt-1" style={{ color: colors.muted }}>
                  {language === "es"
                    ? "Agrega un nuevo miembro al gimnasio"
                    : "Add a new member to the gym"}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl transition-all duration-200 group hover:scale-105"
              style={{
                backgroundColor: "transparent",
                color: colors.muted,
                border: `1px solid ${theme === "dark" ? "#2a2a2a" : "#e5e7eb"}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#ef444420";
                e.currentTarget.style.color = "#ef4444";
                e.currentTarget.style.borderColor = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = colors.muted;
                e.currentTarget.style.borderColor =
                  theme === "dark" ? "#2a2a2a" : "#e5e7eb";
              }}
            >
              <svg
                className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
          {/* Success Message */}
          {successMessage && (
            <div
              className="mb-6 p-4 rounded-xl border-l-4 animate-in slide-in-from-top-2 duration-300"
              style={{
                backgroundColor: "#10B98115",
                borderColor: "#10B981",
                color: "#065F46",
              }}
            >
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <p className="text-sm font-medium">{successMessage}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.buttonBackground }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: colors.buttonText }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h4
                  className="text-lg font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "Romagothic, sans-serif",
                    color: colors.foreground,
                    letterSpacing: "0.05em",
                  }}
                >
                  {language === "es"
                    ? "INFORMACIÓN PERSONAL"
                    : "PERSONAL INFORMATION"}
                </h4>
              </div>

              {/* Name fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-semibold uppercase tracking-wider"
                    style={{
                      color: colors.foreground,
                      fontFamily: "Romagothic, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {language === "es" ? "NOMBRE" : "FIRST NAME"} *
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={formData.first_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `2px solid ${
                        errors.first_name ? "#ef4444" : colors.inputBorder
                      }`,
                      fontSize: "16px",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.buttonBackground;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.buttonBackground}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.first_name
                        ? "#ef4444"
                        : colors.inputBorder;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder={
                      language === "es"
                        ? "Ingresa el nombre"
                        : "Enter first name"
                    }
                  />
                  {errors.first_name && (
                    <p
                      className="text-sm font-medium flex items-center"
                      style={{ color: "#ef4444" }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.first_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-semibold uppercase tracking-wider"
                    style={{
                      color: colors.foreground,
                      fontFamily: "Romagothic, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {language === "es" ? "APELLIDO" : "LAST NAME"} *
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={formData.last_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `2px solid ${
                        errors.last_name ? "#ef4444" : colors.inputBorder
                      }`,
                      fontSize: "16px",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.buttonBackground;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.buttonBackground}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.last_name
                        ? "#ef4444"
                        : colors.inputBorder;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder={
                      language === "es"
                        ? "Ingresa el apellido"
                        : "Enter last name"
                    }
                  />
                  {errors.last_name && (
                    <p
                      className="text-sm font-medium flex items-center"
                      style={{ color: "#ef4444" }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.last_name}
                    </p>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold uppercase tracking-wider"
                    style={{
                      color: colors.foreground,
                      fontFamily: "Romagothic, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {language === "es" ? "CORREO ELECTRÓNICO" : "EMAIL ADDRESS"}{" "}
                    *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `2px solid ${
                        errors.email ? "#ef4444" : colors.inputBorder
                      }`,
                      fontSize: "16px",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.buttonBackground;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.buttonBackground}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.email
                        ? "#ef4444"
                        : colors.inputBorder;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder={
                      language === "es"
                        ? "ejemplo@email.com"
                        : "example@email.com"
                    }
                  />
                  {errors.email && (
                    <p
                      className="text-sm font-medium flex items-center"
                      style={{ color: "#ef4444" }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold uppercase tracking-wider"
                    style={{
                      color: colors.foreground,
                      fontFamily: "Romagothic, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {language === "es" ? "TELÉFONO" : "PHONE NUMBER"}
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `2px solid ${
                        errors.phone ? "#ef4444" : colors.inputBorder
                      }`,
                      fontSize: "16px",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.buttonBackground;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.buttonBackground}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.phone
                        ? "#ef4444"
                        : colors.inputBorder;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    placeholder={
                      language === "es" ? "+506 8888-1234" : "+506 8888-1234"
                    }
                  />
                  {errors.phone && (
                    <p
                      className="text-sm font-medium flex items-center"
                      style={{ color: "#ef4444" }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Date of Birth */}
              <div className="space-y-2">
                <label
                  htmlFor="date_of_birth"
                  className="block text-sm font-semibold uppercase tracking-wider"
                  style={{
                    color: colors.foreground,
                    fontFamily: "Romagothic, sans-serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  {language === "es" ? "FECHA DE NACIMIENTO" : "DATE OF BIRTH"}
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                  style={{
                    backgroundColor: colors.inputBackground,
                    color: colors.inputText,
                    border: `2px solid ${
                      errors.date_of_birth ? "#ef4444" : colors.inputBorder
                    }`,
                    fontSize: "16px",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.buttonBackground;
                    e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.buttonBackground}20`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = errors.date_of_birth
                      ? "#ef4444"
                      : colors.inputBorder;
                    e.currentTarget.style.boxShadow = "none";
                  }}
                />
                {errors.date_of_birth && (
                  <p
                    className="text-sm font-medium flex items-center"
                    style={{ color: "#ef4444" }}
                  >
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.date_of_birth}
                  </p>
                )}
              </div>
            </div>

            {/* Membership Information Section */}
            <div
              className="space-y-6 pt-6 border-t"
              style={{ borderColor: theme === "dark" ? "#2a2a2a" : "#e5e7eb" }}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: colors.buttonBackground }}
                >
                  <svg
                    className="w-4 h-4"
                    style={{ color: colors.buttonText }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <h4
                  className="text-lg font-bold uppercase tracking-wider"
                  style={{
                    fontFamily: "Romagothic, sans-serif",
                    color: colors.foreground,
                    letterSpacing: "0.05em",
                  }}
                >
                  {language === "es"
                    ? "INFORMACIÓN DE MEMBRESÍA"
                    : "MEMBERSHIP INFORMATION"}
                </h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Fee */}
                <div className="space-y-2">
                  <label
                    htmlFor="monthly_fee"
                    className="block text-sm font-semibold uppercase tracking-wider"
                    style={{
                      color: colors.foreground,
                      fontFamily: "Romagothic, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {language === "es" ? "MENSUALIDAD" : "MONTHLY FEE"} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      id="monthly_fee"
                      name="monthly_fee"
                      value={formData.monthly_fee}
                      onChange={handleInputChange}
                      min="0"
                      step="1000"
                      placeholder="25000"
                      className="w-full px-4 py-3 pr-24 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                      style={{
                        backgroundColor: colors.inputBackground,
                        color: colors.inputText,
                        border: `2px solid ${
                          errors.monthly_fee ? "#ef4444" : colors.inputBorder
                        }`,
                        fontSize: "16px",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor =
                          colors.buttonBackground;
                        e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.buttonBackground}20`;
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = errors.monthly_fee
                          ? "#ef4444"
                          : colors.inputBorder;
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    <div className="absolute right-3 top-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({
                            ...prev,
                            monthly_fee: gym?.monthly_fee || 25000,
                          }));
                          if (errors.monthly_fee) {
                            setErrors((prev) => ({
                              ...prev,
                              monthly_fee: undefined,
                            }));
                          }
                        }}
                        className="text-xs px-2 py-1 rounded-lg transition-colors hover:opacity-80 font-medium"
                        style={{
                          backgroundColor: colors.buttonBackground,
                          color: colors.buttonText,
                        }}
                        title={
                          language === "es"
                            ? "Restablecer al valor por defecto"
                            : "Reset to default value"
                        }
                      >
                        {language === "es" ? "Por defecto" : "Default"}
                      </button>
                      <span
                        className="text-sm font-medium"
                        style={{ color: colors.muted }}
                      >
                        CRC
                      </span>
                    </div>
                  </div>
                  {errors.monthly_fee && (
                    <p
                      className="text-sm font-medium flex items-center"
                      style={{ color: "#ef4444" }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.monthly_fee}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: colors.muted }}>
                    {language === "es"
                      ? `Mensualidad por defecto: ${formatCurrency(
                          gym?.monthly_fee || 0
                        )}`
                      : `Default monthly fee: ${formatCurrency(
                          gym?.monthly_fee || 0
                        )}`}
                  </p>
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                  <label
                    htmlFor="start_date"
                    className="block text-sm font-semibold uppercase tracking-wider"
                    style={{
                      color: colors.foreground,
                      fontFamily: "Romagothic, sans-serif",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {language === "es" ? "FECHA DE INICIO" : "START DATE"} *
                  </label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200"
                    style={{
                      backgroundColor: colors.inputBackground,
                      color: colors.inputText,
                      border: `2px solid ${
                        errors.start_date ? "#ef4444" : colors.inputBorder
                      }`,
                      fontSize: "16px",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        colors.buttonBackground;
                      e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.buttonBackground}20`;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = errors.start_date
                        ? "#ef4444"
                        : colors.inputBorder;
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  />
                  {errors.start_date && (
                    <p
                      className="text-sm font-medium flex items-center"
                      style={{ color: "#ef4444" }}
                    >
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.start_date}
                    </p>
                  )}
                  <p className="text-xs" style={{ color: colors.muted }}>
                    {language === "es"
                      ? "Fecha cuando el usuario comenzará su membresía"
                      : "Date when the user will start their membership"}
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div
          className="px-8 py-6 border-t flex justify-end space-x-4"
          style={{
            borderColor: theme === "dark" ? "#2a2a2a" : "#e5e7eb",
            background:
              theme === "dark"
                ? "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)"
                : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          }}
        >
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl font-semibold uppercase tracking-wider transition-all duration-200 hover:scale-105"
            style={{
              backgroundColor: "transparent",
              color: colors.muted,
              border: `2px solid ${colors.inputBorder}`,
              fontFamily: "Romagothic, sans-serif",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                theme === "dark" ? "#2a2a2a" : "#f3f4f6";
              e.currentTarget.style.color = colors.foreground;
              e.currentTarget.style.borderColor = colors.foreground;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = colors.muted;
              e.currentTarget.style.borderColor = colors.inputBorder;
            }}
          >
            {language === "es" ? "CANCELAR" : "CANCEL"}
          </button>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-6 py-3 rounded-xl font-semibold uppercase tracking-wider transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 group"
            style={{
              backgroundColor: colors.buttonBackground,
              color: colors.buttonText,
              fontFamily: "Romagothic, sans-serif",
              letterSpacing: "0.05em",
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = colors.buttonHover;
                e.currentTarget.style.boxShadow =
                  theme === "dark"
                    ? "0 8px 25px rgba(255, 255, 255, 0.1)"
                    : "0 8px 25px rgba(0, 0, 0, 0.15)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = colors.buttonBackground;
                e.currentTarget.style.boxShadow = "none";
              }
            }}
          >
            <span className="flex items-center space-x-2">
              {isLoading && (
                <svg
                  className="animate-spin h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              <span>
                {isLoading
                  ? language === "es"
                    ? "CREANDO..."
                    : "CREATING..."
                  : language === "es"
                  ? "CREAR USUARIO"
                  : "CREATE USER"}
              </span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
