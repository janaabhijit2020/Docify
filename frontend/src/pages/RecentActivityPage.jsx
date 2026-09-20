import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Clock3,
  FileText,
  LogOut,
  MessageCircle,
  RefreshCw,
  Upload,
} from 'lucide-react';

import { getConversations } from '../api/conversationApi';
import { getDocuments } from '../api/documentApi';
import { getCurrentUser } from '../api/authApi';

function RecentActivityPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [conversations, setConversations] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadActivity();
  }, []);

  async function loadActivity() {
    try {
      setLoading(true);
      setError('');

      const [
        userData,
        documentData,
        conversationData,
      ] = await Promise.all([
        getCurrentUser(),
        getDocuments(),
        getConversations(),
      ]);

      setUser(userData);

      setDocuments(
        Array.isArray(documentData)
          ? documentData
          : []
      );

      setConversations(
        Array.isArray(conversationData)
          ? conversationData
          : []
      );
    } catch (err) {
      console.error(
        'Failed to load recent activity:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Unable to load recent activity. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem('docify_token');
    navigate('/login');
  }

  function getInitial() {
    if (!user?.name) {
      return 'U';
    }

    return user.name.charAt(0).toUpperCase();
  }

  function getDocumentName(documentId) {
    const document = documents.find(
      (item) => item.id === documentId
    );

    return (
      document?.originalFileName ||
      document?.fileName ||
      'Document'
    );
  }

  function formatTime(dateValue) {
    const date = new Date(dateValue);

    return date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  function formatDay(dateValue) {
    const date = new Date(dateValue);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const activityDate = new Date(date);
    activityDate.setHours(0, 0, 0, 0);

    if (
      activityDate.getTime() === today.getTime()
    ) {
      return 'Today';
    }

    if (
      activityDate.getTime() ===
      yesterday.getTime()
    ) {
      return 'Yesterday';
    }

    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  function getRelativeTime(dateValue) {
    const date = new Date(dateValue);
    const now = new Date();

    const difference =
      now.getTime() - date.getTime();

    const minutes = Math.floor(
      difference / 60000
    );

    const hours = Math.floor(
      difference / 3600000
    );

    const days = Math.floor(
      difference / 86400000
    );

    if (minutes < 1) {
      return 'Just now';
    }

    if (minutes < 60) {
      return `${minutes} min ago`;
    }

    if (hours < 24) {
      return `${hours} hr ago`;
    }

    if (days === 1) {
      return 'Yesterday';
    }

    if (days < 7) {
      return `${days} days ago`;
    }

    return date.toLocaleDateString([], {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  const activities = useMemo(() => {
    const documentActivities = documents.map(
      (document) => ({
        id: `document-${document.id}`,
        type: 'upload',
        date: new Date(
          document.createdAt ||
            document.uploadedAt ||
            document.updatedAt ||
            Date.now()
        ),
        title: 'Document uploaded',
        description:
          document.originalFileName ||
          document.fileName ||
          'Untitled document',
        documentId: document.id,
        status: document.status,
      })
    );

    const conversationActivities =
      conversations.map((conversation) => ({
        id: `conversation-${conversation.id}`,
        type: 'conversation',
        date: new Date(
          conversation.updatedAt ||
            conversation.createdAt ||
            Date.now()
        ),
        title: 'Conversation updated',
        description:
          conversation.title ||
          'Document conversation',
        conversationId: conversation.id,
        documentId: conversation.documentId,
      }));

    return [
      ...documentActivities,
      ...conversationActivities,
    ].sort(
      (first, second) =>
        second.date.getTime() -
        first.date.getTime()
    );
  }, [documents, conversations]);

  const groupedActivities = useMemo(() => {
    const groups = {};

    activities.forEach((activity) => {
      const group = formatDay(activity.date);

      if (!groups[group]) {
        groups[group] = [];
      }

      groups[group].push(activity);
    });

    return Object.entries(groups);
  }, [activities]);

  function openActivity(activity) {
    if (activity.type === 'conversation') {
      navigate(
        `/chat?documentId=${activity.documentId}&conversationId=${activity.conversationId}`
      );

      return;
    }

    navigate(
      `/chat?documentId=${activity.documentId}`
    );
  }

  return (
    <div className="activity-page">

      {/* Sidebar */}

      <aside className="activity-sidebar">

        <div className="activity-sidebar-top">
          <button
            type="button"
            className="activity-brand"
            onClick={() => navigate('/dashboard')}
          >
            <div className="activity-brand-mark">
              D
            </div>

            <span>DOCIFY</span>
          </button>
        </div>

        <nav className="activity-navigation">

          <button
            type="button"
            className="activity-nav-item"
            onClick={() => navigate('/dashboard')}
          >
            <FileText size={17} />
            <span>Documents</span>
          </button>

          <button
            type="button"
            className="activity-nav-item"
            onClick={() => navigate('/conversations')}
          >
            <MessageCircle size={17} />
            <span>Conversations</span>
          </button>

          <button
            type="button"
            className="activity-nav-item active"
            onClick={() =>
              navigate('/recent-activity')
            }
          >
            <Clock3 size={17} />
            <span>Recent Activity</span>
          </button>

        </nav>

        <div className="activity-sidebar-bottom">

          <button
            type="button"
            className="activity-user"
            onClick={() => navigate('/profile')}
          >
            <div className="activity-avatar">
              {getInitial()}
            </div>

            <div className="activity-user-info">
              <strong>
                {user?.name || 'User'}
              </strong>

              <span>
                {user?.email || 'Account'}
              </span>
            </div>
          </button>

          <button
            type="button"
            className="activity-logout"
            onClick={handleLogout}
            title="Sign out"
            aria-label="Sign out"
          >
            <LogOut size={17} />
          </button>

        </div>

      </aside>

      {/* Main */}

      <main className="activity-main">

        <header className="activity-topbar">

          <div className="activity-breadcrumb">

            <button
              type="button"
              onClick={() => navigate('/dashboard')}
            >
              Workspace
            </button>

            <span>/</span>

            <strong>Recent Activity</strong>

          </div>

          <button
            type="button"
            className="activity-refresh-button"
            onClick={loadActivity}
            disabled={loading}
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? 'activity-spin'
                  : ''
              }
            />

            <span>Refresh</span>
          </button>

        </header>

        <section className="activity-content">

          <div className="activity-hero">

            <div className="activity-hero-copy">

              <span className="activity-eyebrow">
                WORKSPACE HISTORY
              </span>

              <h1>Recent activity</h1>

              <p>
                Keep track of your latest documents and
                conversations in one place.
              </p>

            </div>

            <div className="activity-hero-card">

              <div className="activity-hero-icon">
                <Clock3 size={20} />
              </div>

              <div>
                <span>Total activity</span>
                <strong>
                  {activities.length}
                </strong>
              </div>

            </div>

          </div>

          {error && (
            <div className="activity-error">
              <span>{error}</span>

              <button
                type="button"
                onClick={loadActivity}
              >
                Try again
              </button>
            </div>
          )}

          {loading ? (
            <div className="activity-loading">
              <RefreshCw
                size={20}
                className="activity-spin"
              />

              <span>
                Loading your activity...
              </span>
            </div>
          ) : activities.length === 0 ? (
            <div className="activity-empty">

              <div className="activity-empty-icon">
                <Clock3 size={24} />
              </div>

              <span className="activity-eyebrow">
                NO ACTIVITY YET
              </span>

              <h2>
                Your workspace is quiet
              </h2>

              <p>
                Upload a document or start a
                conversation to see your activity here.
              </p>

              <button
                type="button"
                onClick={() => navigate('/dashboard')}
              >
                Go to documents
                <ArrowRight size={15} />
              </button>

            </div>
          ) : (
            <div className="activity-timeline">

              {groupedActivities.map(
                ([groupName, groupActivities]) => (
                  <section
                    className="activity-group"
                    key={groupName}
                  >

                    <div className="activity-group-heading">
                      <span>{groupName}</span>
                    </div>

                    <div className="activity-items">

                      {groupActivities.map(
                        (activity) => (
                          <button
                            type="button"
                            className="activity-item"
                            key={activity.id}
                            onClick={() =>
                              openActivity(activity)
                            }
                          >

                            <div
                              className={`activity-item-icon ${
                                activity.type ===
                                'upload'
                                  ? 'upload'
                                  : 'conversation'
                              }`}
                            >
                              {activity.type ===
                              'upload' ? (
                                <Upload size={17} />
                              ) : (
                                <MessageCircle
                                  size={17}
                                />
                              )}
                            </div>

                            <div className="activity-item-content">

                              <div className="activity-item-title-row">

                                <strong>
                                  {activity.title}
                                </strong>

                                <span>
                                  {getRelativeTime(
                                    activity.date
                                  )}
                                </span>

                              </div>

                              <p>
                                {activity.description}
                              </p>

                              <div className="activity-item-meta">

                                <span>
                                  {formatTime(
                                    activity.date
                                  )}
                                </span>

                                {activity.type ===
                                  'conversation' && (
                                  <>
                                    <span>•</span>

                                    <span>
                                      {getDocumentName(
                                        activity.documentId
                                      )}
                                    </span>
                                  </>
                                )}

                                {activity.type ===
                                  'upload' &&
                                  activity.status && (
                                    <>
                                      <span>•</span>

                                      <span>
                                        {activity.status}
                                      </span>
                                    </>
                                  )}

                              </div>

                            </div>

                            <ArrowRight
                              size={16}
                              className="activity-item-arrow"
                            />

                          </button>
                        )
                      )}

                    </div>

                  </section>
                )
              )}

            </div>
          )}

          {!loading &&
            activities.length > 0 && (
              <div className="activity-footer-message">

                <div className="activity-footer-line" />

                <span>
                  Showing your latest workspace activity
                </span>

                <div className="activity-footer-line" />

              </div>
            )}

        </section>

      </main>

    </div>
  );
}

export default RecentActivityPage;