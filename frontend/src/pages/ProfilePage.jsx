import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Save,
  User,
  X,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCurrentUser } from '../api/authApi';
import {
  updateProfile,
  changePassword,
} from '../api/profileApi';

function ProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    name: '',
    email: '',
  });

  const [name, setName] = useState('');

  const [currentPassword, setCurrentPassword] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [savingName, setSavingName] =
    useState(false);

  const [changingPassword, setChangingPassword] =
    useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setError('');

      const data = await getCurrentUser();

      const currentUser = {
        name: data?.name || '',
        email: data?.email || '',
      };

      setUser(currentUser);
      setName(currentUser.name);

      localStorage.setItem(
        'docify_user',
        JSON.stringify(currentUser)
      );
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError?.response?.data?.message ||
          'Unable to load your profile.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('docify_token');
    localStorage.removeItem('docify_user');

    navigate('/login', {
      replace: true,
    });
  }

  async function handleNameUpdate(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Name cannot be empty.');
      return;
    }

    if (trimmedName.length < 2) {
      setError('Name must contain at least 2 characters.');
      return;
    }

    if (trimmedName.length > 100) {
      setError('Name cannot exceed 100 characters.');
      return;
    }

    if (trimmedName === user.name) {
      setSuccess('Your profile is already up to date.');
      return;
    }

    try {
      setSavingName(true);

      const data = await updateProfile(trimmedName);

      const updatedUser = {
        name: data?.name || trimmedName,
        email: data?.email || user.email,
      };

      setUser(updatedUser);
      setName(updatedUser.name);

      localStorage.setItem(
        'docify_user',
        JSON.stringify(updatedUser)
      );

      setSuccess('Your name has been updated successfully.');
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError?.response?.data?.message ||
          'Unable to update your name.'
      );
    } finally {
      setSavingName(false);
    }
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!newPassword) {
      setError('Please enter a new password.');
      return;
    }

    if (newPassword.length < 8) {
      setError(
        'New password must contain at least 8 characters.'
      );
      return;
    }

    if (!confirmPassword) {
      setError('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(
        'New password and confirmation password do not match.'
      );
      return;
    }

    try {
      setChangingPassword(true);

      await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      setSuccess(
        'Your password has been changed successfully.'
      );
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError?.response?.data?.message ||
          'Unable to change your password.'
      );
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingCard}>
          <div style={styles.loadingMark}>D</div>

          <p style={styles.loadingText}>
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>

      <header style={styles.header}>
        <button
          type="button"
          style={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          <ArrowLeft size={18} />
          Back to dashboard
        </button>

        <div style={styles.headerBrand}>
          <div style={styles.brandMark}>D</div>

          <div>
            <strong style={styles.brandTitle}>
              DOCIFY
            </strong>

            <span style={styles.brandSubtitle}>
              AI Document Assistant
            </span>
          </div>
        </div>

        <div style={styles.headerSpacer} />
      </header>

      <main style={styles.main}>

        <section style={styles.pageHeading}>
          <span style={styles.eyebrow}>
            ACCOUNT
          </span>

          <h1 style={styles.title}>
            Your profile
          </h1>

          <p style={styles.subtitle}>
            Manage your personal information and account
            security.
          </p>
        </section>

        {(error || success) && (
          <div
            style={{
              ...styles.alert,
              ...(error
                ? styles.errorAlert
                : styles.successAlert),
            }}
          >
            {error ? (
              <X size={18} />
            ) : (
              <CheckCircle2 size={18} />
            )}

            <span>
              {error || success}
            </span>

            <button
              type="button"
              style={styles.alertClose}
              onClick={() => {
                setError('');
                setSuccess('');
              }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        <div style={styles.profileGrid}>

          {/* PROFILE INFORMATION */}

          <section style={styles.card}>

            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <User size={20} />
              </div>

              <div>
                <h2 style={styles.cardTitle}>
                  Personal information
                </h2>

                <p style={styles.cardDescription}>
                  Update the name associated with your
                  DOCIFY account.
                </p>
              </div>
            </div>

            <form onSubmit={handleNameUpdate}>

              <div style={styles.field}>
                <label style={styles.label}>
                  Full name
                </label>

                <div style={styles.inputWrapper}>
                  <User
                    size={18}
                    style={styles.inputIcon}
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Your name"
                    disabled={savingName}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Email address
                </label>

                <div
                  style={{
                    ...styles.inputWrapper,
                    ...styles.disabledInput,
                  }}
                >
                  <Mail
                    size={18}
                    style={styles.inputIcon}
                  />

                  <input
                    type="email"
                    value={user.email}
                    disabled
                    style={styles.input}
                  />
                </div>

                <p style={styles.fieldHint}>
                  Your email address cannot be changed
                  from your profile.
                </p>
              </div>

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={savingName}
              >
                <Save size={17} />

                {savingName
                  ? 'Saving...'
                  : 'Save changes'}
              </button>

            </form>
          </section>

          {/* PASSWORD */}

          <section style={styles.card}>

            <div style={styles.cardHeader}>
              <div style={styles.cardIcon}>
                <LockKeyhole size={20} />
              </div>

              <div>
                <h2 style={styles.cardTitle}>
                  Change password
                </h2>

                <p style={styles.cardDescription}>
                  Use a strong password to keep your
                  account secure.
                </p>
              </div>
            </div>

            <form onSubmit={handlePasswordChange}>

              <div style={styles.field}>
                <label style={styles.label}>
                  Current password
                </label>

                <div style={styles.inputWrapper}>
                  <LockKeyhole
                    size={18}
                    style={styles.inputIcon}
                  />

                  <input
                    type={
                      showCurrentPassword
                        ? 'text'
                        : 'password'
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter current password"
                    autoComplete="current-password"
                    disabled={changingPassword}
                    style={styles.input}
                  />

                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value
                      )
                    }
                    disabled={changingPassword}
                    aria-label={
                      showCurrentPassword
                        ? 'Hide current password'
                        : 'Show current password'
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  New password
                </label>

                <div style={styles.inputWrapper}>
                  <LockKeyhole
                    size={18}
                    style={styles.inputIcon}
                  />

                  <input
                    type={
                      showNewPassword
                        ? 'text'
                        : 'password'
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value
                      )
                    }
                    placeholder="Enter new password"
                    autoComplete="new-password"
                    disabled={changingPassword}
                    style={styles.input}
                  />

                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value
                      )
                    }
                    disabled={changingPassword}
                    aria-label={
                      showNewPassword
                        ? 'Hide new password'
                        : 'Show new password'
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>
                  Confirm new password
                </label>

                <div style={styles.inputWrapper}>
                  <LockKeyhole
                    size={18}
                    style={styles.inputIcon}
                  />

                  <input
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value
                      )
                    }
                    placeholder="Confirm new password"
                    autoComplete="new-password"
                    disabled={changingPassword}
                    style={styles.input}
                  />

                  <button
                    type="button"
                    style={styles.passwordToggle}
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value
                      )
                    }
                    disabled={changingPassword}
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirmation password'
                        : 'Show confirmation password'
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

              <p style={styles.passwordHint}>
                Your password must contain at least
                8 characters.
              </p>

              <button
                type="submit"
                style={styles.primaryButton}
                disabled={changingPassword}
              >
                <LockKeyhole size={17} />

                {changingPassword
                  ? 'Updating password...'
                  : 'Change password'}
              </button>

            </form>
          </section>

        </div>

      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh',
    background: '#F7F5EF',
    color: '#2F332E',
  },

  header: {
    minHeight: '76px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 6%',
    borderBottom: '1px solid #E4E1D8',
    background: '#FFFFFF',
    gap: '28px',
  },

  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    background: 'transparent',
    color: '#6F8068',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px 0',
  },

  headerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  brandMark: {
    width: '34px',
    height: '34px',
    borderRadius: '10px',
    background: '#6F8068',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '16px',
  },

  brandTitle: {
    display: 'block',
    fontSize: '15px',
    letterSpacing: '0.08em',
  },

  brandSubtitle: {
    display: 'block',
    fontSize: '10px',
    color: '#899086',
    marginTop: '2px',
  },

  headerSpacer: {
    flex: 1,
  },

  main: {
    width: 'min(1100px, 92%)',
    margin: '0 auto',
    padding: '54px 0 80px',
  },

  pageHeading: {
    marginBottom: '30px',
  },

  eyebrow: {
    display: 'block',
    fontSize: '11px',
    fontWeight: 800,
    letterSpacing: '0.14em',
    color: '#6F8068',
    marginBottom: '8px',
  },

  title: {
    margin: 0,
    fontSize: 'clamp(30px, 4vw, 44px)',
    lineHeight: 1.1,
    letterSpacing: '-0.03em',
  },

  subtitle: {
    margin: '12px 0 0',
    color: '#72786F',
    fontSize: '15px',
    lineHeight: 1.6,
    maxWidth: '620px',
  },

  alert: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '13px 15px',
    borderRadius: '12px',
    marginBottom: '22px',
    fontSize: '14px',
  },

  errorAlert: {
    background: '#FBEDEC',
    color: '#A54842',
    border: '1px solid #EBCFCD',
  },

  successAlert: {
    background: '#EEF4EC',
    color: '#587052',
    border: '1px solid #D5E2D0',
  },

  alertClose: {
    marginLeft: 'auto',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    cursor: 'pointer',
    display: 'flex',
  },

  profileGrid: {
    display: 'grid',
    gridTemplateColumns:
      'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '22px',
    alignItems: 'start',
  },

  card: {
    background: '#FFFFFF',
    border: '1px solid #E4E1D8',
    borderRadius: '20px',
    padding: '28px',
    boxShadow: '0 8px 30px rgba(47, 51, 46, 0.04)',
  },

  cardHeader: {
    display: 'flex',
    gap: '14px',
    alignItems: 'flex-start',
    marginBottom: '28px',
  },

  cardIcon: {
    width: '42px',
    height: '42px',
    flexShrink: 0,
    borderRadius: '12px',
    background: '#EEF2EB',
    color: '#6F8068',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardTitle: {
    margin: '2px 0 5px',
    fontSize: '18px',
  },

  cardDescription: {
    margin: 0,
    color: '#7A8077',
    fontSize: '13px',
    lineHeight: 1.5,
  },

  field: {
    marginBottom: '20px',
  },

  label: {
    display: 'block',
    fontSize: '13px',
    fontWeight: 700,
    marginBottom: '8px',
  },

  inputWrapper: {
    minHeight: '48px',
    display: 'flex',
    alignItems: 'center',
    border: '1px solid #DCD9D0',
    borderRadius: '11px',
    background: '#FFFFFF',
    padding: '0 13px',
    gap: '10px',
    transition: 'border-color 0.2s ease',
  },

  inputIcon: {
    color: '#8B9188',
    flexShrink: 0,
  },

  input: {
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    color: '#2F332E',
    fontSize: '14px',
    minWidth: 0,
  },

  disabledInput: {
    background: '#F4F3EE',
    color: '#8A8F87',
  },

  passwordToggle: {
    border: 'none',
    background: 'transparent',
    color: '#7C8379',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '3px',
  },

  fieldHint: {
    margin: '7px 0 0',
    color: '#8A9087',
    fontSize: '12px',
    lineHeight: 1.4,
  },

  passwordHint: {
    margin: '-4px 0 20px',
    color: '#8A9087',
    fontSize: '12px',
  },

  primaryButton: {
    width: '100%',
    minHeight: '46px',
    border: 'none',
    borderRadius: '11px',
    background: '#6F8068',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 700,
    cursor: 'pointer',
  },

  loadingCard: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingMark: {
    width: '46px',
    height: '46px',
    borderRadius: '13px',
    background: '#6F8068',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '20px',
  },

  loadingText: {
    marginTop: '14px',
    color: '#72786F',
    fontSize: '14px',
  },
};

export default ProfilePage;