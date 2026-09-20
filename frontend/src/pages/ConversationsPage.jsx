import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  FileText,
  LoaderCircle,
  LogOut,
  MessageSquare,
  Search,
  UserCircle,
} from 'lucide-react';

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCurrentUser } from '../api/authApi';
import { getConversations } from '../api/conversationApi';

function ConversationsPage() {
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);

  const [user, setUser] = useState({
    name: 'User',
    email: '',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        loadCurrentUser(),
        loadConversations(),
      ]);
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError?.response?.data?.message ||
          'Unable to load your conversations.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    try {
      const data = await getCurrentUser();

      const currentUser = {
        name:
          data?.name ||
          data?.fullName ||
          data?.username ||
          'User',

        email: data?.email || '',
      };

      setUser(currentUser);

      localStorage.setItem(
        'docify_user',
        JSON.stringify(currentUser)
      );
    } catch (requestError) {
      if (requestError?.response?.status === 401) {
        throw requestError;
      }
    }
  }

  async function loadConversations() {
    const data = await getConversations();

    setConversations(
      Array.isArray(data) ? data : []
    );
  }

  function handleLogout() {
    localStorage.removeItem('docify_token');
    localStorage.removeItem('docify_user');

    navigate('/login', {
      replace: true,
    });
  }

  function openConversation(conversation) {
    if (!conversation?.documentId) {
      return;
    }

    navigate(
      `/chat?documentId=${conversation.documentId}&conversationId=${conversation.id}`
    );
  }

  function formatDate(value) {
    if (!value) {
      return 'Recently';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently';
    }

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  function formatTime(value) {
    if (!value) {
      return '';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function getInitial() {
    return (
      user.name
        ?.trim()
        ?.charAt(0)
        ?.toUpperCase() || 'U'
    );
  }

  const filteredConversations =
    conversations.filter((conversation) =>
      String(conversation.title || '')
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );

  return (
    <div className="conversations-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="conversations-sidebar">

        {/* BRAND */}

        <div className="conversations-sidebar-top">

          <div className="conversations-brand">

            <div className="brand-mark">
              D
            </div>

            <div className="brand-copy">

              <strong>
                DOCIFY
              </strong>

              <span>
                AI Document Assistant
              </span>

            </div>

          </div>

        </div>

        {/* NAVIGATION */}

        <nav className="conversations-navigation">

          <button
            type="button"
            className="conversations-nav-item"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <FileText size={19} />

            <span>
              Documents
            </span>
          </button>

          <button
            type="button"
            className="conversations-nav-item active"
          >
            <MessageSquare size={19} />

            <span>
              Conversations
            </span>
          </button>

          <button
            type="button"
            className="conversations-nav-item"
            onClick={() =>
              navigate('/recent-activity')
            }
          >
            <Clock3 size={19} />

            <span>
              Recent activity
            </span>
          </button>

          <button
            type="button"
            className="conversations-nav-item"
            onClick={() =>
              navigate('/profile')
            }
          >
            <UserCircle size={19} />

            <span>
              Profile
            </span>
          </button>

        </nav>

        {/* USER AREA */}

        <div className="conversations-sidebar-bottom">

          <button
            type="button"
            className="conversations-user"
            onClick={() =>
              navigate('/profile')
            }
          >

            <div className="conversations-avatar">
              {getInitial()}
            </div>

            <div className="conversations-user-info">

              <strong>
                {user.name || 'User'}
              </strong>

              <span>
                {user.email || 'Account'}
              </span>

            </div>

          </button>

          <button
            type="button"
            className="conversations-logout"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={17} />
          </button>

        </div>

      </aside>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="conversations-main">

        {/* TOP BAR */}

        <header className="conversations-topbar">

          <button
            type="button"
            className="conversations-back-button"
            onClick={() =>
              navigate('/dashboard')
            }
          >
            <ArrowLeft size={17} />

            Dashboard
          </button>

          <div className="conversations-workspace-status">

            <span>
              Your workspace
            </span>

            <i />

          </div>

          <button
            type="button"
            className="conversations-profile-button"
            onClick={() =>
              navigate('/profile')
            }
          >
            {getInitial()}
          </button>

        </header>

        {/* CONTENT */}

        <div className="conversations-content">

          {/* HERO */}

          <section className="conversations-hero">

            <div className="conversations-hero-copy">

              <span className="dashboard-eyebrow">
                WORKSPACE
              </span>

              <h1>
                Conversations
              </h1>

              <p>
                Continue your previous document
                conversations or revisit something
                you discussed earlier.
              </p>

            </div>

            <div className="conversations-hero-visual">

              <div className="conversation-illustration">

                <MessageSquare size={42} />

                <span className="conversation-dot">
                  •••
                </span>

              </div>

              <div className="conversation-stat-card">

                <div className="conversation-stat-icon">
                  <MessageSquare size={19} />
                </div>

                <strong>
                  {conversations.length}
                </strong>

                <span>
                  {conversations.length === 1
                    ? 'conversation'
                    : 'conversations'}
                </span>

              </div>

            </div>

          </section>

          {/* SEARCH */}

          <section className="conversations-toolbar">

            <div className="conversation-search">

              <Search size={19} />

              <input
                type="search"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value
                  )
                }
              />

            </div>

            <div className="conversation-sort">

              <Clock3 size={17} />

              <span>
                Last updated
              </span>

            </div>

          </section>

          {/* ERROR */}

          {error && (
            <div className="conversations-error">

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={loadPage}
              >
                Try again
              </button>

            </div>
          )}

          {/* LOADING */}

          {loading ? (

            <div className="conversations-loading">

              <LoaderCircle
                size={28}
                className="spin"
              />

              <p>
                Loading your conversations...
              </p>

            </div>

          ) : filteredConversations.length === 0 ? (

            /* EMPTY STATE */

            <section className="conversations-empty">

              <div className="conversations-empty-icon">
                <MessageSquare size={27} />
              </div>

              <h2>
                {searchQuery
                  ? 'No conversations found'
                  : 'No conversations yet'}
              </h2>

              <p>
                {searchQuery
                  ? 'Try searching with a different term.'
                  : 'Open a document and ask your first question to start a conversation.'}
              </p>

              {!searchQuery && (
                <button
                  type="button"
                  className="conversations-empty-button"
                  onClick={() =>
                    navigate('/dashboard')
                  }
                >
                  <FileText size={17} />

                  Browse documents
                </button>
              )}

            </section>

          ) : (

            /* CONVERSATION LIST */

            <section className="conversation-list">

              {filteredConversations.map(
                (conversation) => (

                  <button
                    type="button"
                    className="conversation-card"
                    key={conversation.id}
                    onClick={() =>
                      openConversation(
                        conversation
                      )
                    }
                  >

                    <div className="conversation-file-icon">
                      <FileText size={24} />
                    </div>

                    <div className="conversation-card-content">

                      <div className="conversation-card-title-row">

                        <MessageSquare
                          size={18}
                        />

                        <h2>
                          {conversation.title ||
                            'Untitled conversation'}
                        </h2>

                      </div>

                      <div className="conversation-card-meta">

                        <span>
                          <FileText size={14} />

                          Document #
                          {conversation.documentId}
                        </span>

                        <span className="conversation-meta-dot">
                          •
                        </span>

                        <span>
                          <Clock3 size={14} />

                          {formatDate(
                            conversation.updatedAt
                          )}

                          {formatTime(
                            conversation.updatedAt
                          ) &&
                            ` · ${formatTime(
                              conversation.updatedAt
                            )}`}
                        </span>

                      </div>

                    </div>

                    <div className="conversation-card-arrow">

                      <ArrowRight size={21} />

                    </div>

                  </button>

                )
              )}

            </section>

          )}

          {/* FOOTER */}

          {!loading &&
            filteredConversations.length > 0 && (

              <div className="conversations-footer-message">

                <span />

                <div>

                  <strong>
                    That&apos;s all for now
                  </strong>

                  <p>
                    Your conversations will appear here
                    as you chat with your documents.
                  </p>

                </div>

                <span />

              </div>

            )}

        </div>

      </main>

    </div>
  );
}

export default ConversationsPage;