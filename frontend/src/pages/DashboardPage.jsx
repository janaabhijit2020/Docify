import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  File,
  FileText,
  FileType,
  LoaderCircle,
  LogOut,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
  UserCircle,
  X,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { getCurrentUser } from '../api/authApi';

import {
  getDocuments,
  uploadDocument,
  deleteDocument,
} from '../api/documentApi';

function DashboardPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [dragActive, setDragActive] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [user, setUser] = useState({
    name: 'User',
    email: '',
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      await Promise.all([
        loadCurrentUser(),
        loadDocuments(),
      ]);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError.response?.data?.message ||
          'Unable to load your workspace.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const data = await getCurrentUser();

      const currentUser = {
        name:
          data?.name ||
          data?.fullName ||
          data?.username ||
          'User',

        email:
          data?.email ||
          '',
      };

      setUser(currentUser);

      localStorage.setItem(
        'docify_user',
        JSON.stringify(currentUser)
      );
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        throw requestError;
      }
    }
  };

  const loadDocuments = async () => {
    try {
      const data = await getDocuments();

      setDocuments(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        throw requestError;
      }

      setError(
        requestError.response?.data?.message ||
          'Unable to load your documents.'
      );
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('docify_token');
    localStorage.removeItem('docify_user');

    navigate('/login', {
      replace: true,
    });
  };

  const validateFile = (file) => {
    if (!file) {
      return 'Please select a file.';
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];

    const allowedExtensions = [
      '.pdf',
      '.docx',
      '.txt',
    ];

    const fileName = file.name.toLowerCase();

    const validType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((extension) =>
        fileName.endsWith(extension)
      );

    if (!validType) {
      return 'Only PDF, DOCX, and TXT files are supported.';
    }

    const maxSize = 20 * 1024 * 1024;

    if (file.size > maxSize) {
      return 'File size must be 20 MB or smaller.';
    }

    return null;
  };

  const handleFileUpload = async (file) => {
    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setError('');
      setOpenMenuId(null);

      await uploadDocument(
        file,
        (progressEvent) => {
          if (!progressEvent.total) {
            return;
          }

          const percentage = Math.round(
            (progressEvent.loaded * 100) /
              progressEvent.total
          );

          setUploadProgress(percentage);
        }
      );

      await loadDocuments();
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError.response?.data?.message ||
          'Document upload failed. Please try again.'
      );
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileInputChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      handleFileUpload(file);
    }

    event.target.value = '';
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragActive(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this document?'
    );

    if (!confirmed) {
      return;
    }

    try {
      setError('');

      await deleteDocument(documentId);

      setDocuments((previous) =>
        previous.filter(
          (document) =>
            getDocumentId(document) !== documentId
        )
      );

      setOpenMenuId(null);
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError.response?.data?.message ||
          'Unable to delete the document.'
      );
    }
  };

  const getDocumentId = (document) =>
    document.id ?? document.documentId;

  const getDocumentName = (document) =>
    document.fileName ||
    document.filename ||
    document.name ||
    document.originalFileName ||
    'Untitled document';

  const getDocumentStatus = (document) =>
    document.status ||
    document.documentStatus ||
    'READY';

  const getDocumentDate = (document) => {
    const value =
      document.createdAt ||
      document.uploadedAt ||
      document.createdDate;

    if (!value) {
      return 'Recently added';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return 'Recently added';
    }

    return date.toLocaleDateString(
      'en-IN',
      {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }
    );
  };

  const getDocumentSize = (document) => {
    const value =
      document.fileSize ||
      document.size ||
      document.fileSizeBytes;

    if (!value) {
      return '';
    }

    const bytes = Number(value);

    if (Number.isNaN(bytes)) {
      return '';
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  const getFileExtension = (document) => {
    const name = getDocumentName(document);

    const extension = name
      .split('.')
      .pop()
      ?.toUpperCase();

    return extension || 'FILE';
  };

  const getFileIcon = (document) => {
    const extension =
      getFileExtension(document);

    if (extension === 'PDF') {
      return <FileType size={19} />;
    }

    if (extension === 'DOCX') {
      return <FileText size={19} />;
    }

    return <File size={19} />;
  };

  const openDocumentChat = (documentId) => {
    navigate(
      `/chat?documentId=${documentId}`
    );
  };

  const filteredDocuments =
    documents.filter((document) =>
      getDocumentName(document)
        .toLowerCase()
        .includes(
          searchQuery.toLowerCase()
        )
    );

  const firstName =
    user.name
      ?.trim()
      ?.split(' ')[0] ||
    'there';

  return (
    <div className="dashboard-page">

      {/* MOBILE OVERLAY */}

      {mobileSidebarOpen && (
        <div
          className="dashboard-mobile-overlay"
          onClick={() =>
            setMobileSidebarOpen(false)
          }
        />
      )}

      {/* SIDEBAR */}

      <aside
        className={`dashboard-sidebar ${
          mobileSidebarOpen
            ? 'dashboard-sidebar-open'
            : ''
        }`}
      >
        <div className="dashboard-sidebar-top">

          <div className="dashboard-brand">

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

          <button
            type="button"
            className="mobile-sidebar-close"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          >
            <X size={20} />
          </button>

        </div>

        <nav className="dashboard-navigation">

          {/* DOCUMENTS */}

          <button
            type="button"
            className="dashboard-nav-item active"
            onClick={() =>
              setMobileSidebarOpen(false)
            }
          >
            <FileText size={18} />

            <span>
              Documents
            </span>
          </button>

          {/* CONVERSATIONS */}

          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => {
              setMobileSidebarOpen(false);
              navigate('/conversations');
            }}
          >
            <MessageSquare size={18} />

            <span>
              Conversations
            </span>
          </button>

          {/* RECENT ACTIVITY */}

          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => {
              setMobileSidebarOpen(false);
              navigate('/recent-activity');
            }}
          >
            <Clock3 size={18} />

            <span>
              Recent activity
            </span>
          </button>

          {/* PROFILE */}

          <button
            type="button"
            className="dashboard-nav-item"
            onClick={() => {
              setMobileSidebarOpen(false);
              navigate('/profile');
            }}
          >
            <UserCircle size={18} />

            <span>
              Profile
            </span>
          </button>

        </nav>

        <div className="dashboard-sidebar-bottom">

          {/* USER PROFILE */}

          <button
            type="button"
            className="dashboard-user"
            onClick={() =>
              navigate('/profile')
            }
            title="Open profile"
          >

            <div className="dashboard-user-avatar">
              {user.name
                ?.trim()
                ?.charAt(0)
                ?.toUpperCase() || 'U'}
            </div>

            <div className="dashboard-user-info">

              <strong>
                {user.name || 'User'}
              </strong>

              <span>
                {user.email || 'Account'}
              </span>

            </div>

          </button>

          {/* LOGOUT */}

          <button
            type="button"
            className="dashboard-logout"
            onClick={handleLogout}
            title="Sign out"
          >
            <LogOut size={17} />
          </button>

        </div>

      </aside>

      {/* MAIN */}

      <main className="dashboard-main">

        {/* TOPBAR */}

        <header className="dashboard-topbar">

          <button
            type="button"
            className="dashboard-mobile-menu"
            onClick={() =>
              setMobileSidebarOpen(true)
            }
          >
            <Menu size={21} />
          </button>

          <div className="dashboard-breadcrumb">

            <span>
              Workspace
            </span>

            <span>
              /
            </span>

            <strong>
              Documents
            </strong>

          </div>

          <button
            type="button"
            className="dashboard-top-upload"
            onClick={() =>
              fileInputRef.current?.click()
            }
            disabled={uploading}
          >
            <Plus size={17} />

            Upload
          </button>

        </header>

        <div className="dashboard-content">

          {/* WELCOME */}

          <section className="dashboard-welcome">

            <div>

              <span className="dashboard-eyebrow">
                YOUR WORKSPACE
              </span>

              <h1>
                Good to see you, {firstName}.
              </h1>

              <p>
                Upload your documents and start
                asking questions with your AI
                assistant.
              </p>

            </div>

            <button
              type="button"
              className="dashboard-upload-button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={uploading}
            >

              {uploading ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="spin"
                  />

                  Uploading...
                </>
              ) : (
                <>
                  <Upload size={18} />

                  Upload document
                </>
              )}

            </button>

          </section>

          {/* ERROR */}

          {error && (
            <div className="dashboard-error">

              <AlertCircle size={18} />

              <span>
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  setError('')
                }
              >
                <X size={15} />
              </button>

            </div>
          )}

          {/* UPLOAD AREA */}

          <section
            className={`dashboard-upload-area ${
              dragActive
                ? 'dashboard-upload-area-active'
                : ''
            }`}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() =>
              setDragActive(false)
            }
            onDrop={handleDrop}
            onClick={() =>
              fileInputRef.current?.click()
            }
          >

            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              hidden
              onChange={
                handleFileInputChange
              }
            />

            <div className="upload-icon">

              {uploading ? (
                <LoaderCircle
                  size={25}
                  className="spin"
                />
              ) : (
                <Upload size={25} />
              )}

            </div>

            <div className="upload-copy">

              <h3>
                {uploading
                  ? `Uploading document... ${uploadProgress}%`
                  : 'Drop your document here'}
              </h3>

              <p>
                {uploading
                  ? 'Please wait while DOCIFY processes your file.'
                  : 'or click to browse · PDF, DOCX, TXT · up to 20 MB'}
              </p>

            </div>

            {!uploading && (
              <span className="upload-browse">
                Browse files
              </span>
            )}

            {uploading && (
              <div className="upload-progress">

                <div
                  style={{
                    width: `${uploadProgress}%`,
                  }}
                />

              </div>
            )}

          </section>

          {/* DOCUMENT LIBRARY */}

          <section className="documents-section">

            <div className="documents-header">

              <div>

                <span className="dashboard-eyebrow">
                  LIBRARY
                </span>

                <h2>
                  Your documents
                </h2>

              </div>

              <div className="document-search">

                <Search size={17} />

                <input
                  type="search"
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(event) =>
                    setSearchQuery(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* LOADING */}

            {loading ? (

              <div className="dashboard-loading">

                <LoaderCircle
                  size={26}
                  className="spin"
                />

                <p>
                  Loading your documents...
                </p>

              </div>

            ) : filteredDocuments.length === 0 ? (

              /* EMPTY */

              <div className="dashboard-empty">

                <div className="empty-icon">
                  <FileText size={26} />
                </div>

                <h3>
                  {searchQuery
                    ? 'No documents found'
                    : 'Your document library is empty'}
                </h3>

                <p>
                  {searchQuery
                    ? 'Try a different search term.'
                    : 'Upload your first document to start chatting with your AI assistant.'}
                </p>

                {!searchQuery && (
                  <button
                    type="button"
                    className="empty-upload-button"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <Upload size={16} />

                    Upload your first document
                  </button>
                )}

              </div>

            ) : (

              /* DOCUMENT LIST */

              <div className="document-list">

                {filteredDocuments.map(
                  (document) => {

                    const documentId =
                      getDocumentId(document);

                    const status =
                      getDocumentStatus(
                        document
                      );

                    const statusText =
                      String(status)
                        .toLowerCase();

                    return (
                      <article
                        className="document-row"
                        key={documentId}
                        onClick={() =>
                          openDocumentChat(
                            documentId
                          )
                        }
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => {

                          if (
                            event.key ===
                              'Enter' ||
                            event.key ===
                              ' '
                          ) {
                            event.preventDefault();

                            openDocumentChat(
                              documentId
                            );
                          }

                        }}
                      >

                        <div className="document-file-icon">
                          {getFileIcon(
                            document
                          )}
                        </div>

                        <div className="document-main-info">

                          <h3>
                            {getDocumentName(
                              document
                            )}
                          </h3>

                          <div className="document-meta">

                            <span>
                              {getFileExtension(
                                document
                              )}
                            </span>

                            {getDocumentSize(
                              document
                            ) && (
                              <>
                                <i />

                                <span>
                                  {getDocumentSize(
                                    document
                                  )}
                                </span>
                              </>
                            )}

                            <i />

                            <span>
                              {getDocumentDate(
                                document
                              )}
                            </span>

                          </div>

                        </div>

                        <div
                          className={`document-status document-status-${statusText}`}
                        >

                          {statusText ===
                            'ready' ||
                          statusText ===
                            'completed' ||
                          statusText ===
                            'processed' ? (
                            <CheckCircle2
                              size={14}
                            />
                          ) : (
                            <Clock3
                              size={14}
                            />
                          )}

                          <span>
                            {status}
                          </span>

                        </div>

                        <button
                          type="button"
                          className="document-menu-button"
                          onClick={(event) => {

                            event.stopPropagation();

                            setOpenMenuId(
                              openMenuId ===
                                documentId
                                ? null
                                : documentId
                            );

                          }}
                        >
                          <MoreHorizontal
                            size={19}
                          />
                        </button>

                        {openMenuId ===
                          documentId && (
                          <div className="document-menu">

                            <button
                              type="button"
                              onClick={(event) => {

                                event.stopPropagation();

                                handleDelete(
                                  documentId
                                );

                              }}
                            >
                              <Trash2 size={15} />

                              Delete
                            </button>

                          </div>
                        )}

                      </article>
                    );
                  }
                )}

              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default DashboardPage;