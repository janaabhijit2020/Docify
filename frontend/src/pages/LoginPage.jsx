import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from 'lucide-react';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { loginUser } from '../api/authApi';

function LoginPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setIsLoading(true);

      const response = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      const token =
        response.token ??
        response.accessToken;

      if (!token) {
        throw new Error(
          'Login succeeded, but no authentication token was returned.'
        );
      }

      localStorage.setItem(
        'docify_token',
        token
      );

      navigate('/dashboard', {
        replace: true,
      });

    } catch (requestError) {
      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        requestError?.message ||
        'Unable to sign in. Please check your credentials.';

      setError(message);

    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-wrapper">

        <Link
          to="/"
          className="auth-brand"
        >
          <div className="brand-mark">
            D
          </div>

          <div className="brand-copy">
            <strong>DOCIFY</strong>

            <span>
              AI Document Assistant
            </span>
          </div>
        </Link>

        <div className="auth-card">

          <div className="auth-header">

            <span className="auth-eyebrow">
              WELCOME BACK
            </span>

            <h1>
              Welcome back
            </h1>

            <p>
              Sign in to continue to your workspace
            </p>

          </div>

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >

            <div className="auth-field">

              <label htmlFor="email">
                Email address
              </label>

              <div className="input-wrapper">

                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={isLoading}
                />

              </div>

            </div>

            <div className="auth-field">

              <div className="field-label-row">

                <label htmlFor="password">
                  Password
                </label>

              </div>

              <div className="input-wrapper">

                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {error && (
              <div
                className="auth-error"
                role="alert"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={isLoading}
            >
              {isLoading
                ? 'Signing in...'
                : 'Sign in'}
            </button>

          </form>

          <div className="auth-or">

            <span />

            <p>
              or continue with
            </p>

            <span />

          </div>

          <button
            type="button"
            className="google-button"
            onClick={() =>
              setError(
                'Google sign-in is not available yet.'
              )
            }
          >
            <span className="google-icon">
              G
            </span>

            Sign in with Google
          </button>

          <p className="auth-switch">
            Don't have an account?{' '}

            <Link to="/register">
              Create one
            </Link>
          </p>

        </div>

        <Link
          to="/"
          className="auth-back"
        >
          <ArrowLeft size={15} />
          Back to home
        </Link>

      </div>

    </div>
  );
}

export default LoginPage;