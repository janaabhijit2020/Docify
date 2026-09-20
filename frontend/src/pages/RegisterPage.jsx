import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  UserRound,
  ArrowLeft,
  LoaderCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { registerUser } from '../api/authApi';

function RegisterPage() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');

    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      setError('Please enter your full name.');
      return;
    }

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!formData.password) {
      setError('Please create a password.');
      return;
    }

    if (formData.password.length < 6) {
      setError(
        'Password must be at least 6 characters long.'
      );
      return;
    }

    if (
      formData.password !== formData.confirmPassword
    ) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeToTerms) {
      setError(
        'Please agree to the Terms of Service and Privacy Policy.'
      );
      return;
    }

    try {
      setLoading(true);

      const data = await registerUser({
        name,
        email,
        password: formData.password,
      });

      localStorage.setItem('docify_token', data.token);

      localStorage.setItem(
        'docify_user',
        JSON.stringify({
          userId: data.userId,
          name: data.name,
          email: data.email,
        })
      );

      navigate('/dashboard');
    } catch (requestError) {
      const responseMessage =
        requestError.response?.data?.message;

      if (responseMessage) {
        setError(responseMessage);
      } else if (requestError.response?.status === 409) {
        setError(
          'An account with this email already exists.'
        );
      } else if (!requestError.response) {
        setError(
          'Unable to connect to the DOCIFY server.'
        );
      } else {
        setError(
          'Registration failed. Please check your details and try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-decoration auth-decoration-one" />
      <div className="auth-decoration auth-decoration-two" />

      <div className="auth-wrapper register-wrapper">
        <Link to="/" className="auth-brand">
          <div className="brand-mark">D</div>

          <div className="brand-copy">
            <strong>DOCIFY</strong>
            <span>AI Document Assistant</span>
          </div>
        </Link>

        <div className="auth-card">
          <div className="auth-header">
            <span className="auth-eyebrow">
              GET STARTED
            </span>

            <h1>Create your account</h1>

            <p>
              Build your personal AI-powered workspace
            </p>
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <form
            className="auth-form"
            onSubmit={handleSubmit}
          >
            <div className="auth-field">
              <label htmlFor="name">
                Full name
              </label>

              <div className="input-wrapper">
                <UserRound size={18} />

                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-email">
                Email address
              </label>

              <div className="input-wrapper">
                <Mail size={18} />

                <input
                  id="register-email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="register-password">
                Password
              </label>

              <div className="input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="register-password"
                  name="password"
                  type={
                    showPassword ? 'text' : 'password'
                  }
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="auth-field">
              <label htmlFor="confirm-password">
                Confirm password
              </label>

              <div className="input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Repeat your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                  disabled={loading}
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      (value) => !value
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showConfirmPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <label className="terms-checkbox">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(event) =>
                  setAgreeToTerms(event.target.checked)
                }
                disabled={loading}
              />

              <span>
                I agree to the{' '}
                <a href="#terms">Terms of Service</a>{' '}
                and{' '}
                <a href="#privacy">
                  Privacy Policy
                </a>
              </span>
            </label>

            <button
              type="submit"
              className="auth-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="spin"
                  />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>

          <div className="auth-or">
            <span />
            <p>or continue with</p>
            <span />
          </div>

          <button
            type="button"
            className="google-button"
          >
            <span className="google-icon">G</span>
            Sign up with Google
          </button>

          <p className="auth-switch">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </p>
        </div>

        <Link to="/" className="auth-back">
          <ArrowLeft size={15} />
          Back to home
        </Link>
      </div>
    </div>
  );
}

export default RegisterPage;