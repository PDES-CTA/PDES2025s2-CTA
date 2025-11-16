import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { dealershipService, buyerService } from '../services/api';
import { ROUTES } from '../constants';
import AuthForm from '../components/organisms/AuthForm';
import FormField from '../components/atoms/FormField';
import { useAuthForm } from '../hooks/useAuthForm';
import React from 'react';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { error, loading, getStringValue, handleFormSubmit } = useAuthForm();
  const [userType, setUserType] = useState<'BUYER' | 'DEALERSHIP'>('BUYER');
  const [dniValue, setDniValue] = useState('');
  const [cuitValue, setCuitValue] = useState('');

  const formatDNI = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 5) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 5)}.${numbers.slice(5, 8)}`;
  };

  const formatCUIT = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 10) return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 10)}-${numbers.slice(10, 11)}`;
  };

  const handleDNIChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatDNI(e.target.value);
    setDniValue(formatted);
  };

  const handleCUITChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCUIT(e.target.value);
    setCuitValue(formatted);
  };

  const onSubmit = async (formData: FormData) => {
     try {
      const password = getStringValue(formData, 'password');
      const confirmPassword = getStringValue(formData, 'confirmPassword');

      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }

      const registerData = {
        email: getStringValue(formData, 'email'),
        password: password,
        firstName: getStringValue(formData, 'firstName'),
        lastName: getStringValue(formData, 'lastName'),
        phone: getStringValue(formData, 'phone'),
        address: getStringValue(formData, 'address'),
        role: userType,
      };

      if (userType === 'BUYER') {
        const buyerData = {
          ...registerData,
          dni: dniValue.replace(/\D/g, ''), // Remove dots and convert to integer
        };
        await buyerService.createBuyer(buyerData);
      } else {
        const dealershipData = {
          ...registerData,
          businessName: getStringValue(formData, 'businessName'),
          cuit: cuitValue.replace(/\D/g, ''), // Remove dashes
          city: getStringValue(formData, 'city') || undefined,
          province: getStringValue(formData, 'province') || undefined,
          description: getStringValue(formData, 'description') || undefined,
        };
        await dealershipService.createDealership(dealershipData);
      }

      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      // Parse backend error messages
      const errorMessage = error.response?.data?.message || error.message || '';
      
      // The backend returns messages like "duplicate key: this email is already registered"
      if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('duplicate key')) {
        throw new Error('This email is already registered. Please use a different email or try logging in.');
      } else if (errorMessage.toLowerCase().includes('dni') && errorMessage.toLowerCase().includes('duplicate key')) {
        throw new Error('This DNI is already registered.');
      } else if (errorMessage.toLowerCase().includes('cuit') && errorMessage.toLowerCase().includes('duplicate key')) {
        throw new Error('This CUIT is already registered.');
      } else if (errorMessage) {
        throw new Error(errorMessage);
      } else {
        throw new Error('An error occurred during registration. Please try again.');
      }
    }
  };

  return (
    <AuthForm
      title="Create Account"
      icon={UserPlus}
      error={error}
      loading={loading}
      onSubmit={(e) => handleFormSubmit(e, onSubmit)}
      submitButtonText="Sign Up"
      loadingText="Creating account..."
      footerText="Already have an account?"
      footerLinkText="Log in"
      footerLinkTo={ROUTES.LOGIN}
    >
      {/* Toggle Button */}
      <div style={{ 
        display: 'flex', 
        gap: 'var(--spacing-sm)', 
        marginBottom: 'var(--spacing-lg)',
        padding: '4px',
        backgroundColor: 'var(--color-gray-100)',
        borderRadius: '8px'
      }}>
        <button
          type="button"
          onClick={() => setUserType('BUYER')}
          style={{
            flex: 1,
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: userType === 'BUYER' ? 'white' : 'transparent',
            color: userType === 'BUYER' ? 'var(--color-primary)' : 'var(--color-gray-600)',
            boxShadow: userType === 'BUYER' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Buyer
        </button>
        <button
          type="button"
          onClick={() => setUserType('DEALERSHIP')}
          style={{
            flex: 1,
            padding: 'var(--spacing-sm) var(--spacing-md)',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: userType === 'DEALERSHIP' ? 'white' : 'transparent',
            color: userType === 'DEALERSHIP' ? 'var(--color-primary)' : 'var(--color-gray-600)',
            boxShadow: userType === 'DEALERSHIP' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
          }}
        >
          Dealership
        </button>
      </div>

      {/* Buyer Form Fields */}
      {userType === 'BUYER' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <FormField
              label="First Name"
              id="firstName"
              name="firstName"
              type="text"
              required
              minLength={2}
              maxLength={50}
            />
            <FormField
              label="Last Name"
              id="lastName"
              name="lastName"
              type="text"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <FormField
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="buyer-user@gmail.com"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <FormField
              label="DNI"
              id="dni"
              name="dni"
              type="text"
              placeholder="12.345.678"
              required
              value={dniValue}
              onChange={handleDNIChange}
              maxLength={10}
            />
            <FormField
              label="Phone"
              id="phone"
              name="phone"
              type="tel"
              placeholder="1112341234"
              required
            />
          </div>

          <FormField
            label="Address"
            id="address"
            name="address"
            type="text"
            placeholder="24 Main Street, BA"
            required
            maxLength={40}
          />
        </>
      )}

      {/* Dealership Form Fields */}
      {userType === 'DEALERSHIP' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <FormField
              label="First Name"
              id="firstName"
              name="firstName"
              type="text"
              required
              minLength={2}
              maxLength={50}
            />
            <FormField
              label="Last Name"
              id="lastName"
              name="lastName"
              type="text"
              required
              minLength={2}
              maxLength={50}
            />
          </div>

          <FormField
            label="Email"
            id="email"
            name="email"
            type="email"
            placeholder="my-dealership@gmail.com"
            required
          />

          <FormField
            label="Business Name"
            id="businessName"
            name="businessName"
            type="text"
            placeholder="CTA Cars"
            required
            minLength={2}
            maxLength={100}
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <FormField
              label="CUIT"
              id="cuit"
              name="cuit"
              type="text"
              placeholder="12-12345678-1"
              pattern="\d{2}-\d{8}-\d{1}"
              required
              value={cuitValue}
              onChange={handleCUITChange}
              minLength={13}
              maxLength={13}
            />
            <FormField
              label="Phone"
              id="phone"
              name="phone"
              type="tel"
              placeholder="1112341234"
              required
            />
          </div>

          <FormField
            label="Address"
            id="address"
            name="address"
            type="text"
            placeholder="12 Main Street, BA"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
            <FormField
              label="City"
              id="city"
              name="city"
              type="text"
              placeholder="Bernal"
            />
            <FormField
              label="Province"
              id="province"
              name="province"
              type="text"
              placeholder="Buenos Aires"
            />
          </div>

          <FormField
            label="Description"
            id="description"
            name="description"
            type="text"
            placeholder="Brief description of your dealership"
          />
        </>
      )}

      {/* Password Fields (common to both) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <FormField
          label="Password"
          id="password"
          name="password"
          type="password"
          placeholder="••••••••"
          minLength={8}
          required
        />
        <FormField
          label="Confirm Password"
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          placeholder="••••••••"
          minLength={8}
          required
        />
      </div>
    </AuthForm>
  );
}