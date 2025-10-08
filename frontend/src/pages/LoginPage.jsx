import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { ROUTES } from '../constants';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const credentials = {
      email: formData.get('email'),
      password: formData.get('password'),
    };

    try {
      setLoading(true);
      setError('');
      await authService.login(credentials);
      if (onLogin) await onLogin();
      navigate(ROUTES.CARS);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>Iniciar Sesión</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              name="email"
              type="email"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p>
          ¿No tenés cuenta? <Link to={ROUTES.REGISTER}>Registrate</Link>
        </p>
      </div>
    </div>
  );
}