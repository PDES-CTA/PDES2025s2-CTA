import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { authService } from '../services/api';
import { ROUTES } from '../constants';
import AuthForm from '../components/organisms/AuthForm';
import FormField from '../components/atoms/FormField';
import { useAuthForm } from '../hooks/useAuthForm';

interface LoginPageProps {
  onLogin?: () => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const { error, loading, getStringValue, handleFormSubmit } = useAuthForm();

  const onSubmit = async (formData: FormData) => {
    const credentials = {
      email: getStringValue(formData, 'email'),
      password: getStringValue(formData, 'password'),
    };

    await authService.login(credentials);
    if (onLogin) await onLogin();
    navigate(ROUTES.CARS);
  };

  return (
    <AuthForm
      title="Log In"
      icon={LogIn}
      error={error}
      loading={loading}
      onSubmit={(e) => handleFormSubmit(e, onSubmit)}
      submitButtonText="Log In"
      loadingText="Logging in..."
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkTo={ROUTES.REGISTER}
    >
      <FormField
        label="Email"
        id="email"
        name="email"
        type="email"
        placeholder="you@email.com"
        required
      />
      <FormField
        label="Password"
        id="password"
        name="password"
        type="password"
        placeholder="••••••••"
        required
      />
    </AuthForm>
  );
}