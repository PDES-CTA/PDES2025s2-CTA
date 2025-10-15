import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { authService } from '../services/api';
import { ROUTES } from '../constants';
import AuthForm from '../components/organisms/AuthForm';
import FormField from '../components/atoms/FormField';
import { useAuthForm } from '../hooks/useAuthForm';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { error, loading, getStringValue, handleFormSubmit } = useAuthForm();

  const onSubmit = async (formData: FormData) => {
    const password = getStringValue(formData, 'password');
    const confirmPassword = getStringValue(formData, 'confirmPassword');

    if (password !== confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const firstName = getStringValue(formData, 'firstName');
    const lastName = getStringValue(formData, 'lastName');
    const phone = getStringValue(formData, 'phone');
    const address = getStringValue(formData, 'address');

    const userData = {
      email: getStringValue(formData, 'email'),
      password: password,
      firstName: firstName,
      lastName: lastName,
      phone: phone,
      address: address,
      dni: getStringValue(formData, 'dni'),
      role: 'BUYER' as const,
    };

    await authService.register(userData);
    navigate(ROUTES.LOGIN);
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <FormField
          label="First Name"
          id="firstName"
          name="firstName"
          type="text"
          required
        />
        <FormField
          label="Last Name"
          id="lastName"
          name="lastName"
          type="text"
          required
        />
      </div>

      <FormField
        label="Email"
        id="email"
        name="email"
        type="email"
        placeholder="you@email.com"
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-md)' }}>
        <FormField
          label="ID Number"
          id="dni"
          name="dni"
          type="text"
          pattern="\d{7,8}"
          placeholder="12345678"
          required
        />
        <FormField
          label="Phone"
          id="phone"
          name="phone"
          type="tel"
          placeholder="1123456789"
          required
        />
      </div>

      <FormField
        label="Address"
        id="address"
        name="address"
        type="text"
        placeholder="Street 123"
        required
      />

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