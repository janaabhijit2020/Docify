import {
  ArrowRight,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Upload,
  Clock3,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="landing-page">
      {/* NAVBAR */}
      <header className="site-navbar">
        <Link to="/" className="site-brand">
          <div className="brand-mark">D</div>

          <div className="brand-copy">
            <strong>DOCIFY</strong>
            <span>AI Document Assistant</span>
          </div>
        </Link>

        <nav className="desktop-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#pricing">Pricing</a>
        </nav>

        <div className="navbar-actions">
          <Link to="/login" className="nav-signin">
            Sign in
          </Link>

          <Link to="/register" className="nav-get-started">
            Get started
          </Link>
        </div>
      </header>

      {/* HERO */}
      <main>
        <section className="landing-hero">
          <div className="hero-copy">
            <div className="hero-eyebrow">
              <span className="status-dot" />
              Intelligent document workspace
            </div>

            <h1>
              Your documents.
              <span>Your AI assistant.</span>
            </h1>

            <p>
              Upload your documents, ask questions, and get
              intelligent answers grounded in your own content.
            </p>

            <div className="hero-buttons">
              <Link to="/register" className="hero-primary">
                Get started
                <ArrowRight size={17} />
              </Link>

              <a href="#features" className="hero-secondary">
                Explore DOCIFY
              </a>
            </div>

            <div className="hero-trust">
              <span>
                <FileText size={15} />
                PDF, DOCX, TXT
              </span>

              <span>
                <ShieldCheck size={15} />
                Secure & private
              </span>

              <span>
                <Sparkles size={15} />
                Powered by Gemini
              </span>
            </div>
          </div>

          {/* PRODUCT PREVIEW */}
          <div className="hero-product-area">
            <div className="product-window">
              <div className="product-window-top">
                <div className="window-dots">
                  <span />
                  <span />
                  <span />
                </div>

                <span>Document Assistant</span>

                <span className="window-plus">+</span>
              </div>

              <div className="product-window-body">
                <aside className="product-sidebar">
                  <div className="product-logo">D</div>

                  <div className="sidebar-item active">
                    <FileText size={14} />
                    <span>Documents</span>
                  </div>

                  <div className="sidebar-item">
                    <MessageSquare size={14} />
                    <span>Chat</span>
                  </div>

                  <div className="sidebar-item">
                    <Clock3 size={14} />
                    <span>Conversations</span>
                  </div>

                  <div className="sidebar-item">
                    <ShieldCheck size={14} />
                    <span>Settings</span>
                  </div>
                </aside>

                <div className="product-chat">
                  <div className="document-badge">
                    <span>PDF</span>
                    Research Paper.pdf
                  </div>

                  <div className="preview-question">
                    Summarize the main findings from this document.
                  </div>

                  <div className="preview-answer">
                    <div className="preview-avatar">D</div>

                    <div>
                      <strong>DOCIFY AI</strong>

                      <p>
                        Here are the key findings from the
                        document:
                      </p>

                      <ul>
                        <li>Improved model efficiency</li>
                        <li>Higher accuracy on test data</li>
                        <li>Potential real-world applications</li>
                      </ul>

                      <p>
                        Would you like a detailed explanation
                        of any section?
                      </p>
                    </div>
                  </div>

                  <div className="preview-input">
                    <span>Ask anything about your document...</span>

                    <button type="button">
                      <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="preview-caption">
              <span className="caption-line" />
              Chat with your documents
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="features-section" id="features">
          <div className="section-intro">
            <span>WHY DOCIFY</span>

            <h2>
              Everything you need to work with documents.
            </h2>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">
                <Upload size={20} />
              </div>

              <h3>Upload documents</h3>

              <p>
                Upload PDFs, DOCX files, and text documents
                into your personal workspace.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <MessageSquare size={20} />
              </div>

              <h3>Ask your documents</h3>

              <p>
                Get accurate, context-aware answers using
                advanced AI and your own documents.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">
                <Clock3 size={20} />
              </div>

              <h3>Keep conversations</h3>

              <p>
                Continue previous conversations without
                losing your document context.
              </p>
            </article>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="how-section" id="how-it-works">
          <div className="section-intro centered">
            <span>HOW IT WORKS</span>

            <h2>
              From document to answer in seconds.
            </h2>
          </div>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <FileText size={22} />
              <h3>Upload</h3>
              <p>
                Add your PDF, DOCX, or TXT document to DOCIFY.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">02</div>
              <Sparkles size={22} />
              <h3>Understand</h3>
              <p>
                DOCIFY processes your document and prepares
                it for intelligent search.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">03</div>
              <Zap size={22} />
              <h3>Ask</h3>
              <p>
                Ask questions and receive answers grounded
                in your document.
              </p>
            </div>
          </div>
        </section>

        {/* PRICING PLACEHOLDER */}
        <section className="pricing-section" id="pricing">
          <div className="pricing-card">
            <div>
              <span>DOCIFY</span>

              <h2>
                Your documents,
                <br />
                always within reach.
              </h2>

              <p>
                A smarter way to understand and interact
                with the information you already have.
              </p>
            </div>

            <Link to="/register" className="hero-primary">
              Start using DOCIFY
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="site-footer">
        <div className="site-brand">
          <div className="brand-mark">D</div>

          <div className="brand-copy">
            <strong>DOCIFY</strong>
            <span>AI Document Assistant</span>
          </div>
        </div>

        <p>© 2026 DOCIFY. Intelligent documents, simplified.</p>
      </footer>
    </div>
  );
}

export default LandingPage;