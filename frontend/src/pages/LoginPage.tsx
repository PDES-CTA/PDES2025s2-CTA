import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LogIn } from 'lucide-react';
import { authService } from '../services/api';
import { ROUTES } from '../constants';
import AuthForm from '../components/organisms/AuthForm';
import FormField from '../components/atoms/FormField';
import { useAuthForm } from '../hooks/useAuthForm';

interface LoginPageProps {
  readonly onLogin?: () => Promise<void>;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const navigate = useNavigate();
  const { error, loading, getStringValue, handleFormSubmit } = useAuthForm();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('authorization_token');
    const userRole = localStorage.getItem('user_role');
    
    if (token) {
      // Redirect to appropriate page based on role
      if (userRole === 'ADMINISTRATOR') {
        navigate(ROUTES.ADMIN);
      } else if (userRole === 'DEALERSHIP') {
        navigate(ROUTES.DEALERSHIP_OFFERS);
      } else {
        navigate(ROUTES.CARS);
      }
    }
  }, [navigate]);

  const onSubmit = async (formData: FormData) => {
    const credentials = {
      email: getStringValue(formData, 'email'),
      password: getStringValue(formData, 'password'),
    };

    await authService.login(credentials);
    if (onLogin) await onLogin();

    const user = await authService.getLoggedUser();
    localStorage.setItem('user_role', user.role);    
    if (user.role === 'DEALERSHIP') {
      navigate(ROUTES.DEALERSHIP_OFFERS);
    } else if (user.role === 'ADMINISTRATOR') {
      navigate(ROUTES.ADMIN);
    } else {
      navigate(ROUTES.CARS);
    }
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