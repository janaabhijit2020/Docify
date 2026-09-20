import {
  ArrowLeft,
  FileText,
  Send,
  LoaderCircle,
  Bot,
  User,
  Menu,
  X,
  Plus,
} from 'lucide-react';

import { useEffect, useRef, useState } from 'react';
import {
  useNavigate,
  useSearchParams,
} from 'react-router-dom';

import ReactMarkdown from 'react-markdown';

import {
  sendChatMessage,
  getConversation,
} from '../api/chatApi';

import { getDocuments } from '../api/documentApi';

function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get('documentId');
  const urlConversationId =
    searchParams.get('conversationId');

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [document, setDocument] = useState(null);

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);

  const [conversationId, setConversationId] =
    useState(
      urlConversationId
        ? Number(urlConversationId)
        : null
    );

  const [loadingDocuments, setLoadingDocuments] =
    useState(true);

  const [loadingConversation, setLoadingConversation] =
    useState(false);

  const [sending, setSending] = useState(false);

  const [error, setError] = useState('');

  const [mobileDocumentsOpen, setMobileDocumentsOpen] =
    useState(false);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (!urlConversationId) {
      setConversationId(null);
      setMessages([]);
      return;
    }

    const parsedConversationId =
      Number(urlConversationId);

    if (
      Number.isInteger(parsedConversationId) &&
      parsedConversationId > 0
    ) {
      setConversationId(parsedConversationId);
    }
  }, [urlConversationId]);

  useEffect(() => {
    if (
      !documentId ||
      !urlConversationId ||
      loadingDocuments ||
      !document
    ) {
      return;
    }

    loadConversation(
      Number(urlConversationId),
      document
    );
  }, [
    documentId,
    urlConversationId,
    loadingDocuments,
    document,
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [
    messages,
    sending,
    loadingConversation,
  ]);

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true);
      setError('');

      const data = await getDocuments();

      const documentList = Array.isArray(data)
        ? data
        : [];

      setDocuments(documentList);

      if (documentId) {
        const selected = documentList.find(
          (item) =>
            String(item.id ?? item.documentId) ===
            String(documentId)
        );

        setDocument(selected || null);
      } else {
        setDocument(null);
      }
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      setError(
        requestError.response?.data?.message ||
          'Unable to load your documents.'
      );
    } finally {
      setLoadingDocuments(false);
    }
  };

  const loadConversation = async (
    selectedConversationId,
    selectedDocument
  ) => {
    try {
      setLoadingConversation(true);
      setError('');

      const data = await getConversation(
        selectedConversationId
      );

      if (!data?.conversation) {
        throw new Error(
          'Conversation data was not returned.'
        );
      }

      const conversationDocumentId =
        data.conversation.documentId;

      const selectedDocumentId =
        getDocumentId(selectedDocument);

      if (
        String(conversationDocumentId) !==
        String(selectedDocumentId)
      ) {
        setMessages([]);
        setConversationId(null);

        setError(
          'This conversation does not belong to the selected document.'
        );

        return;
      }

      const loadedMessages =
        Array.isArray(data.messages)
          ? data.messages
          : [];

      setMessages(
        loadedMessages.map((message) => ({
          id: message.id,
          role: message.role,
          content: message.content,
          retrievedChunks:
            undefined,
        }))
      );

      setConversationId(
        data.conversation.id
      );
    } catch (requestError) {
      if (requestError.response?.status === 401) {
        handleLogout();
        return;
      }

      if (
        requestError.response?.status === 404
      ) {
        setError(
          'Conversation not found.'
        );
      } else {
        setError(
          requestError.response?.data?.message ||
            requestError.message ||
            'Unable to load this conversation.'
        );
      }
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('docify_token');
    localStorage.removeItem('docify_user');

    navigate('/login');
  };

  const getDocumentId = (item) =>
    item.id ?? item.documentId;

  const getDocumentName = (item) =>
    item.fileName ||
    item.filename ||
    item.name ||
    item.originalFileName ||
    'Untitled document';

  const handleSelectDocument = (item) => {
    const id = getDocumentId(item);

    navigate(`/chat?documentId=${id}`);

    setDocument(item);
    setMessages([]);
    setConversationId(null);
    setQuestion('');
    setError('');
    setMobileDocumentsOpen(false);
  };

  const handleNewChat = () => {
    if (!document) {
      return;
    }

    const selectedDocumentId =
      getDocumentId(document);

    navigate(
      `/chat?documentId=${selectedDocumentId}`
    );

    setMessages([]);
    setConversationId(null);
    setQuestion('');
    setError('');
    setMobileDocumentsOpen(false);

    setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);
  };

  const handleSubmit = async (event) => {
    event?.preventDefault();

    const trimmedQuestion =
      question.trim();

    if (
      !trimmedQuestion ||
      sending
    ) {
      return;
    }

    if (!document) {
      setError(
        'Please select a document before asking a question.'
      );

      return;
    }

    const selectedDocumentId =
      getDocumentId(document);

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'USER',
      content: trimmedQuestion,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setQuestion('');
    setError('');
    setSending(true);

    try {
      const response =
        await sendChatMessage({
          documentId:
            selectedDocumentId,
          question:
            trimmedQuestion,
          conversationId,
        });

      const returnedConversationId =
        response.conversationId;

      if (returnedConversationId) {
        setConversationId(
          returnedConversationId
        );

        navigate(
          `/chat?documentId=${selectedDocumentId}&conversationId=${returnedConversationId}`,
          {
            replace: true,
          }
        );
      }

      const assistantMessage = {
        id: `assistant-${Date.now()}`,
        role: 'ASSISTANT',
        content:
          response.answer ||
          'I could not generate an answer for this question.',
        retrievedChunks:
          response.retrievedChunks ?? 0,
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);
    } catch (requestError) {
      if (
        requestError.response?.status === 401
      ) {
        handleLogout();
        return;
      }

      setError(
        requestError.response?.data?.message ||
          'Unable to get an answer. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const handleTextareaKeyDown = (
    event
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault();

      handleSubmit();
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const suggestedQuestions = [
    'Summarize this document.',
    'What are the key points?',
    'What are the main skills mentioned?',
  ];

  return (
    <div className="chat-page">
      {/* MOBILE OVERLAY */}
      {mobileDocumentsOpen && (
        <div
          className="chat-mobile-overlay"
          onClick={() =>
            setMobileDocumentsOpen(false)
          }
        />
      )}

      {/* DOCUMENT SIDEBAR */}
      <aside
        className={`chat-sidebar ${
          mobileDocumentsOpen
            ? 'chat-sidebar-open'
            : ''
        }`}
      >
        <div className="chat-sidebar-header">
          <button
            type="button"
            className="chat-back-button"
            onClick={handleBack}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="chat-sidebar-brand">
            <div className="chat-brand-mark">
              D
            </div>

            <div>
              <strong>DOCIFY</strong>
              <span>
                Document Assistant
              </span>
            </div>
          </div>

          <button
            type="button"
            className="chat-sidebar-close"
            onClick={() =>
              setMobileDocumentsOpen(
                false
              )
            }
          >
            <X size={19} />
          </button>
        </div>

        <div className="chat-sidebar-title">
          <span>Your documents</span>
          <span>{documents.length}</span>
        </div>

        <div className="chat-document-list">
          {loadingDocuments ? (
            <div className="chat-sidebar-loading">
              <LoaderCircle
                size={18}
                className="spin"
              />

              <span>
                Loading...
              </span>
            </div>
          ) : documents.length === 0 ? (
            <div className="chat-sidebar-empty">
              <FileText size={20} />

              <p>
                No documents yet.
              </p>

              <button
                type="button"
                onClick={handleBack}
              >
                Upload a document
              </button>
            </div>
          ) : (
            documents.map((item) => {
              const id =
                getDocumentId(item);

              const selected =
                String(id) ===
                String(documentId);

              return (
                <button
                  type="button"
                  key={id}
                  className={`chat-document-item ${
                    selected
                      ? 'chat-document-item-active'
                      : ''
                  }`}
                  onClick={() =>
                    handleSelectDocument(
                      item
                    )
                  }
                >
                  <div className="chat-document-icon">
                    <FileText size={17} />
                  </div>

                  <div>
                    <strong>
                      {getDocumentName(
                        item
                      )}
                    </strong>

                    <span>
                      {selected
                        ? 'Currently selected'
                        : 'Open document'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <div className="chat-sidebar-footer">
          <button
            type="button"
            onClick={handleBack}
          >
            <ArrowLeft size={15} />
            Back to documents
          </button>
        </div>
      </aside>

      {/* MAIN CHAT */}
      <main className="chat-main">
        {/* HEADER */}
        <header className="chat-header">
          <button
            type="button"
            className="chat-mobile-menu"
            onClick={() =>
              setMobileDocumentsOpen(
                true
              )
            }
          >
            <Menu size={20} />
          </button>

          <div className="chat-header-document">
            <div className="chat-header-icon">
              <FileText size={18} />
            </div>

            <div>
              <span>
                CHAT WITH DOCUMENT
              </span>

              <h1>
                {document
                  ? getDocumentName(
                      document
                    )
                  : 'Select a document'}
              </h1>
            </div>
          </div>

          {document && (
            <button
              type="button"
              className="chat-new-button"
              onClick={handleNewChat}
            >
              <Plus size={16} />
              <span>New chat</span>
            </button>
          )}
        </header>

        {/* CHAT CONTENT */}
        <section className="chat-content">
          {!document ? (
            <div className="chat-no-document">
              <div className="chat-no-document-icon">
                <FileText size={30} />
              </div>

              <h2>
                Select a document
              </h2>

              <p>
                Choose a document from the
                sidebar to start asking
                questions.
              </p>

              <button
                type="button"
                onClick={() =>
                  setMobileDocumentsOpen(
                    true
                  )
                }
              >
                Choose document
              </button>
            </div>
          ) : loadingConversation ? (
            <div className="chat-no-document">
              <div className="chat-no-document-icon">
                <LoaderCircle
                  size={30}
                  className="spin"
                />
              </div>

              <h2>
                Loading conversation
              </h2>

              <p>
                Restoring your previous
                conversation...
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="chat-welcome">
              <div className="chat-welcome-icon">
                <Bot size={28} />
              </div>

              <span className="dashboard-eyebrow">
                DOCUMENT AI
              </span>

              <h2>
                Ask anything about your
                document.
              </h2>

              <p>
                DOCIFY uses the contents of
                your document to provide
                grounded answers through
                retrieval-augmented
                generation.
              </p>

              <div className="suggested-questions">
                {suggestedQuestions.map(
                  (suggestion) => (
                    <button
                      type="button"
                      key={suggestion}
                      onClick={() => {
                        setQuestion(
                          suggestion
                        );

                        setTimeout(() => {
                          textareaRef.current?.focus();
                        }, 0);
                      }}
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          ) : (
            <div className="message-list">
              {messages.map(
                (message) => {
                  const isUser =
                    message.role ===
                    'USER';

                  return (
                    <div
                      className={`message-row ${
                        isUser
                          ? 'message-row-user'
                          : 'message-row-assistant'
                      }`}
                      key={message.id}
                    >
                      {!isUser && (
                        <div className="message-avatar">
                          <Bot size={17} />
                        </div>
                      )}

                      <div
                        className={`message-bubble ${
                          isUser
                            ? 'message-bubble-user'
                            : 'message-bubble-assistant'
                        }`}
                      >
                        <div className="message-label">
                          {isUser
                            ? 'YOU'
                            : 'DOCIFY AI'}
                        </div>

                        <div className="message-content">
                          {isUser ? (
                            message.content
                          ) : (
                            <ReactMarkdown>
                              {
                                message.content
                              }
                            </ReactMarkdown>
                          )}
                        </div>

                        {!isUser &&
                          typeof message.retrievedChunks ===
                            'number' && (
                            <div className="message-source-info">
                              Based on{' '}
                              {
                                message.retrievedChunks
                              }{' '}
                              relevant
                              document{' '}
                              {message.retrievedChunks ===
                              1
                                ? 'section'
                                : 'sections'}
                            </div>
                          )}
                      </div>

                      {isUser && (
                        <div className="message-avatar message-avatar-user">
                          <User size={17} />
                        </div>
                      )}
                    </div>
                  );
                }
              )}

              {sending && (
                <div className="message-row message-row-assistant">
                  <div className="message-avatar">
                    <Bot size={17} />
                  </div>

                  <div className="message-bubble message-bubble-assistant">
                    <div className="message-label">
                      DOCIFY AI
                    </div>

                    <div className="typing-indicator">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </section>

        {/* ERROR */}
        {error && (
          <div className="chat-error">
            <span>{error}</span>

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

        {/* INPUT */}
        <div className="chat-input-wrapper">
          <form
            className="chat-input-container"
            onSubmit={handleSubmit}
          >
            <textarea
              ref={textareaRef}
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              onKeyDown={
                handleTextareaKeyDown
              }
              placeholder={
                document
                  ? 'Ask anything about your document...'
                  : 'Select a document first...'
              }
              disabled={
                !document ||
                sending ||
                loadingConversation
              }
              rows={1}
            />

            <button
              type="submit"
              disabled={
                !document ||
                !question.trim() ||
                sending ||
                loadingConversation
              }
              aria-label="Send message"
            >
              {sending ? (
                <LoaderCircle
                  size={18}
                  className="spin"
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          <p className="chat-input-hint">
            Press Enter to send · Shift +
            Enter for a new line
          </p>
        </div>
      </main>
    </div>
  );
}

export default ChatPage;