/**
 * Devis App — Feedback Widget
 * Include this script in any page to add the floating feedback button.
 * Usage: <script src="/app/feedback-widget.js"></script>
 */

(function () {
  'use strict';

  const SUPABASE_URL = 'https://xeezdzbotsblzclnmnxg.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZXpkemJvdHNibHpjbG5tbnhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA0NDk3NTQsImV4cCI6MjA4NjAyNTc1NH0.RHIGavm6M9WCR6nve1Iz_JKFeQRlpRCU2FNAr9E02PM';

  /* ── Styles ── */
  const style = document.createElement('style');
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Manrope:wght@600;700&display=swap');

    .fw-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      z-index: 8888;
      width: 48px;
      height: 48px;
      background: #012B2A;
      border: 2px solid #CCAA01;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(1,43,42,0.35);
      transition: all 0.2s ease;
      outline: none;
      animation: fwPop 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes fwPop { from { opacity:0; transform: scale(0.6); } to { opacity:1; transform: scale(1); } }
    .fw-fab:hover { transform: scale(1.08); box-shadow: 0 6px 22px rgba(1,43,42,0.45); }
    .fw-fab svg { color: #CCAA01; }

    .fw-fab-tooltip {
      position: fixed;
      bottom: 84px;
      right: 28px;
      z-index: 8887;
      background: #012B2A;
      color: rgba(255,255,255,0.8);
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      padding: 6px 12px;
      border-radius: 8px;
      white-space: nowrap;
      pointer-events: none;
      opacity: 0;
      transform: translateY(4px);
      transition: all 0.2s;
      box-shadow: 0 2px 8px rgba(1,43,42,0.2);
    }
    .fw-fab:hover + .fw-fab-tooltip,
    .fw-fab-tooltip.show {
      opacity: 1;
      transform: translateY(0);
    }

    /* Notification dot */
    .fw-notif-dot {
      position: absolute;
      top: -3px; right: -3px;
      width: 10px; height: 10px;
      background: #CCAA01;
      border-radius: 50%;
      border: 2px solid #012B2A;
      display: none;
    }
    .fw-notif-dot.show { display: block; }

    /* Panel */
    .fw-panel {
      position: fixed;
      bottom: 88px;
      right: 28px;
      z-index: 8889;
      width: 360px;
      background: #FFFFFF;
      border: 1px solid #E4EAE9;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(1,43,42,0.2), 0 4px 12px rgba(1,43,42,0.08);
      display: none;
      flex-direction: column;
      overflow: hidden;
      animation: fwSlide 0.3s cubic-bezier(0.16,1,0.3,1) both;
      max-height: 90vh;
      overflow-y: auto;
    }
    @keyframes fwSlide { from { opacity:0; transform: translateY(16px) scale(0.97); } to { opacity:1; transform: translateY(0) scale(1); } }
    .fw-panel.open { display: flex; }

    .fw-panel-header {
      background: #012B2A;
      padding: 18px 20px 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-shrink: 0;
    }
    .fw-panel-title {
      font-family: 'Manrope', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: white;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .fw-panel-title .fw-gold { color: #CCAA01; }
    .fw-panel-subtitle {
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: rgba(255,255,255,0.45);
      margin-top: 2px;
    }
    .fw-close-btn {
      width: 28px; height: 28px;
      background: rgba(255,255,255,0.1);
      border: none; border-radius: 8px;
      color: rgba(255,255,255,0.6);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s;
      flex-shrink: 0;
    }
    .fw-close-btn:hover { background: rgba(255,255,255,0.18); color: white; }

    /* Views */
    .fw-view { display: none; padding: 20px; }
    .fw-view.active { display: block; }

    /* Type selector */
    .fw-types {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
      margin-bottom: 16px;
    }
    .fw-type-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 12px 8px;
      border: 1.5px solid #E4EAE9;
      border-radius: 12px;
      background: white;
      cursor: pointer;
      transition: all 0.18s;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #607170;
    }
    .fw-type-btn:hover { border-color: #012B2A; color: #012B2A; background: #F7FAF9; }
    .fw-type-btn.selected {
      border-color: #CCAA01;
      background: rgba(204,170,1,0.08);
      color: #7A6400;
    }
    .fw-type-btn svg { width: 20px; height: 20px; }

    /* Rating stars */
    .fw-rating {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
      justify-content: center;
    }
    .fw-star {
      font-size: 28px;
      cursor: pointer;
      color: #DFE6E5;
      transition: all 0.15s;
      line-height: 1;
      user-select: none;
    }
    .fw-star.active { color: #CCAA01; transform: scale(1.1); }
    .fw-star:hover { color: #CCAA01; transform: scale(1.15); }
    .fw-rating-label {
      text-align: center;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      color: #8FA3A2;
      margin-bottom: 14px;
      min-height: 18px;
      font-weight: 500;
    }

    /* Form elements */
    .fw-label {
      display: block;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #3E5554;
      margin-bottom: 6px;
    }
    .fw-textarea {
      width: 100%;
      border: 1.5px solid #E4EAE9;
      border-radius: 10px;
      padding: 10px 12px;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #012B2A;
      resize: none;
      outline: none;
      transition: all 0.18s;
      min-height: 90px;
      background: #FAFBFA;
    }
    .fw-textarea:focus {
      border-color: #012B2A;
      box-shadow: 0 0 0 3px rgba(1,43,42,0.08);
    }
    .fw-textarea::placeholder { color: #C3CECD; }
    .fw-char-count {
      text-align: right;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      color: #C3CECD;
      margin-top: 4px;
      margin-bottom: 16px;
    }

    /* Screenshot button */
    .fw-screenshot-btn {
      display: flex;
      align-items: center;
      gap: 7px;
      width: 100%;
      padding: 9px 14px;
      border: 1.5px dashed #C3CECD;
      border-radius: 10px;
      background: #F7FAF9;
      color: #607170;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.18s;
      margin-bottom: 16px;
    }
    .fw-screenshot-btn:hover { border-color: #012B2A; color: #012B2A; background: #EFF3F2; }
    .fw-screenshot-thumb {
      display: none;
      width: 100%;
      height: 80px;
      object-fit: cover;
      border-radius: 8px;
      margin-bottom: 8px;
      border: 1px solid #E4EAE9;
    }

    /* Submit button */
    .fw-submit {
      width: 100%;
      padding: 12px;
      background: #012B2A;
      color: white;
      border: none;
      border-radius: 10px;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
      box-shadow: 0 4px 12px rgba(1,43,42,0.3);
    }
    .fw-submit:hover:not(:disabled) { background: #001A19; transform: translateY(-1px); }
    .fw-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    /* Success view */
    .fw-success-icon {
      width: 60px; height: 60px;
      background: rgba(204,170,1,0.12);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      margin: 8px auto 16px;
    }
    .fw-success-title {
      font-family: 'Manrope', sans-serif;
      font-size: 17px;
      font-weight: 700;
      color: #012B2A;
      text-align: center;
      margin-bottom: 8px;
    }
    .fw-success-sub {
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      color: #607170;
      text-align: center;
      line-height: 1.6;
      margin-bottom: 20px;
    }

    /* Tabs inside panel */
    .fw-tabs {
      display: flex;
      gap: 2px;
      background: #F7FAF9;
      border-radius: 10px;
      padding: 3px;
      margin-bottom: 16px;
    }
    .fw-tab {
      flex: 1;
      padding: 7px;
      border-radius: 8px;
      border: none;
      background: transparent;
      font-family: 'Inter', sans-serif;
      font-size: 12px;
      font-weight: 500;
      color: #607170;
      cursor: pointer;
      transition: all 0.18s;
    }
    .fw-tab.active { background: white; color: #012B2A; font-weight: 600; box-shadow: 0 1px 3px rgba(1,43,42,0.1); }

    /* Feature request */
    .fw-priority-row {
      display: flex;
      gap: 6px;
      margin-bottom: 16px;
    }
    .fw-priority-btn {
      flex: 1;
      padding: 7px;
      border: 1.5px solid #E4EAE9;
      border-radius: 8px;
      background: white;
      font-family: 'Inter', sans-serif;
      font-size: 11px;
      font-weight: 500;
      color: #607170;
      cursor: pointer;
      text-align: center;
      transition: all 0.18s;
    }
    .fw-priority-btn.selected.low  { border-color: #0F7A4A; background: #D4F0E4; color: #0F7A4A; }
    .fw-priority-btn.selected.med  { border-color: #B07D00; background: #FFF3CC; color: #B07D00; }
    .fw-priority-btn.selected.high { border-color: #C0392B; background: #FDECEA; color: #C0392B; }

    /* Spinner */
    @keyframes fw-spin { to { transform: rotate(360deg); } }
    .fw-spinner {
      width: 15px; height: 15px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: fw-spin 0.65s linear infinite;
      flex-shrink: 0;
    }

    /* Mobile adjustments */
    @media (max-width: 480px) {
      .fw-fab { bottom: 90px; right: 16px; }
      .fw-panel { bottom: 148px; right: 16px; left: 16px; width: auto; }
    }
  `;
  document.head.appendChild(style);

  /* ── HTML ── */
  const container = document.createElement('div');
  container.id = 'fw-root';
  container.innerHTML = `
    <button class="fw-fab" id="fw-fab" title="Donner mon avis">
      <div class="fw-notif-dot" id="fw-notif-dot"></div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
      </svg>
    </button>
    <div class="fw-fab-tooltip" id="fw-tooltip">Donner mon avis</div>

    <div class="fw-panel" id="fw-panel">
      <!-- Header -->
      <div class="fw-panel-header">
        <div>
          <div class="fw-panel-title">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            Votre avis <span class="fw-gold">compte</span>
          </div>
          <div class="fw-panel-subtitle">Aidez-nous à améliorer Devis App</div>
        </div>
        <button class="fw-close-btn" id="fw-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <!-- View: Form -->
      <div class="fw-view active" id="fw-view-form">
        <!-- Type tabs -->
        <div class="fw-tabs">
          <button class="fw-tab active" data-fw-tab="general">Général</button>
          <button class="fw-tab" data-fw-tab="bug">Bug</button>
          <button class="fw-tab" data-fw-tab="feature">Idée</button>
        </div>

        <!-- General tab -->
        <div id="fw-tab-general">
          <!-- Stars -->
          <label class="fw-label">Comment évaluez-vous votre expérience ?</label>
          <div class="fw-rating" id="fw-stars">
            <span class="fw-star" data-v="1">★</span>
            <span class="fw-star" data-v="2">★</span>
            <span class="fw-star" data-v="3">★</span>
            <span class="fw-star" data-v="4">★</span>
            <span class="fw-star" data-v="5">★</span>
          </div>
          <div class="fw-rating-label" id="fw-rating-label"></div>
        </div>

        <!-- Bug tab -->
        <div id="fw-tab-bug" style="display:none">
          <label class="fw-label">Criticité du bug</label>
          <div class="fw-priority-row">
            <button class="fw-priority-btn low" data-p="low">🟢 Mineur</button>
            <button class="fw-priority-btn med" data-p="med">🟡 Moyen</button>
            <button class="fw-priority-btn high" data-p="high">🔴 Critique</button>
          </div>
        </div>

        <!-- Feature tab -->
        <div id="fw-tab-feature" style="display:none">
          <label class="fw-label">Impact attendu</label>
          <div class="fw-priority-row">
            <button class="fw-priority-btn low" data-p="low">Nice to have</button>
            <button class="fw-priority-btn med" data-p="med">Important</button>
            <button class="fw-priority-btn high" data-p="high"> Critique</button>
          </div>
        </div>

        <!-- Message -->
        <label class="fw-label" style="margin-top:4px">
          <span id="fw-msg-label">Votre message</span>
          <span style="color:#C3CECD;font-weight:400;"> (optionnel)</span>
        </label>
        <textarea class="fw-textarea" id="fw-message" placeholder="Décrivez votre expérience..." maxlength="500"></textarea>
        <div class="fw-char-count"><span id="fw-char-count">0</span>/500</div>

        <!-- Page info (auto-filled) -->
        <div style="font-size:11px;color:#8FA3A2;margin-bottom:12px;display:flex;align-items:center;gap:5px;">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          Page : <span id="fw-page-label" style="color:#607170"></span>
        </div>

        <button class="fw-submit" id="fw-submit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          Envoyer mon feedback
        </button>
      </div>

      <!-- View: Success -->
      <div class="fw-view" id="fw-view-success">
        <div class="fw-success-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CCAA01" stroke-width="2.5">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <div class="fw-success-title">Merci beaucoup ! 🙏</div>
        <div class="fw-success-sub">Votre feedback a bien été reçu. Il nous aidera à améliorer Devis App pour vous et les milliers d'entrepreneurs qui nous font confiance.</div>
        <button class="fw-submit" id="fw-success-close" style="background:rgba(1,43,42,0.08);color:#012B2A;box-shadow:none;">
          Fermer
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(container);

  /* ── State ── */
  let isOpen = false;
  let rating = 0;
  let priority = '';
  let activeTab = 'general';
  const ratingLabels = ['', 'Décevant', 'Passable', 'Correct', 'Très bien', 'Excellent ! 🎉'];

  /* ── DOM refs ── */
  const fab     = document.getElementById('fw-fab');
  const panel   = document.getElementById('fw-panel');
  const closeBtn = document.getElementById('fw-close');
  const submitBtn = document.getElementById('fw-submit');
  const textarea = document.getElementById('fw-message');
  const charCount = document.getElementById('fw-char-count');
  const ratingLabel = document.getElementById('fw-rating-label');
  const pageLabel = document.getElementById('fw-page-label');
  const viewForm = document.getElementById('fw-view-form');
  const viewSuccess = document.getElementById('fw-view-success');
  const successClose = document.getElementById('fw-success-close');

  /* Current page */
  const page = window.location.pathname.split('/').pop() || 'index.html';
  if (pageLabel) pageLabel.textContent = page;

  /* ── Toggle ── */
  function openPanel() {
    isOpen = true;
    panel.classList.add('open');
    fab.style.transform = 'rotate(180deg) scale(0.9)';
  }
  function closePanel() {
    isOpen = false;
    panel.classList.remove('open');
    fab.style.transform = '';
  }

  fab.addEventListener('click', () => isOpen ? closePanel() : openPanel());
  closeBtn.addEventListener('click', closePanel);
  successClose.addEventListener('click', closePanel);

  /* ── Tabs ── */
  document.querySelectorAll('[data-fw-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTab = btn.dataset.fwTab;
      document.querySelectorAll('[data-fw-tab]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ['general','bug','feature'].forEach(t => {
        const el = document.getElementById('fw-tab-' + t);
        if (el) el.style.display = t === activeTab ? '' : 'none';
      });
      const msgLabel = document.getElementById('fw-msg-label');
      if (msgLabel) {
        msgLabel.textContent = activeTab === 'bug' ? 'Description du bug' : activeTab === 'feature' ? 'Décrivez votre idée' : 'Votre message';
      }
      const ta = document.getElementById('fw-message');
      if (ta) {
        ta.placeholder = activeTab === 'bug'
          ? "Décrivez le bug, les étapes pour le reproduire..."
          : activeTab === 'feature'
          ? "Décrivez la fonctionnalité souhaitée et son utilité..."
          : "Partagez votre expérience générale...";
      }
    });
  });

  /* ── Stars ── */
  const stars = document.querySelectorAll('.fw-star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      rating = parseInt(star.dataset.v);
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.v) <= rating));
      if (ratingLabel) ratingLabel.textContent = ratingLabels[rating] || '';
    });
    star.addEventListener('mouseenter', () => {
      const v = parseInt(star.dataset.v);
      stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.v) <= v));
    });
  });
  document.getElementById('fw-stars')?.addEventListener('mouseleave', () => {
    stars.forEach(s => s.classList.toggle('active', parseInt(s.dataset.v) <= rating));
  });

  /* ── Priority ── */
  document.querySelectorAll('.fw-priority-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.fw-priority-row');
      group.querySelectorAll('.fw-priority-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      priority = btn.dataset.p;
    });
  });

  /* ── Char count ── */
  textarea.addEventListener('input', () => {
    if (charCount) charCount.textContent = textarea.value.length;
  });

  /* ── Submit ── */
  submitBtn.addEventListener('click', async () => {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="fw-spinner"></div> Envoi...';

    try {
      const payload = {
        type: activeTab,
        rating: activeTab === 'general' ? rating : null,
        priority: (activeTab === 'bug' || activeTab === 'feature') ? priority || null : null,
        message: textarea.value.trim() || null,
        page: page,
        url: window.location.href,
        user_agent: navigator.userAgent.substring(0, 200),
        created_at: new Date().toISOString()
      };

      // Try to get user session
      try {
        const { createClient } = await import('https://esm.sh/@supabase/supabase-js');
        const sb = createClient(SUPABASE_URL, SUPABASE_KEY);
        const { data: { session } } = await sb.auth.getSession();
        if (session?.user) payload.user_id = session.user.id;
        await sb.from('feedback').insert(payload);
      } catch (e) {
        // Fallback: store locally and alert
        const feedbacks = JSON.parse(localStorage.getItem('dv_feedbacks') || '[]');
        feedbacks.push(payload);
        localStorage.setItem('dv_feedbacks', JSON.stringify(feedbacks));
      }

      // Show success
      viewForm.classList.remove('active');
      viewSuccess.classList.add('active');

      // Reset for next time
      setTimeout(() => {
        rating = 0;
        priority = '';
        if (textarea) textarea.value = '';
        if (charCount) charCount.textContent = '0';
        if (ratingLabel) ratingLabel.textContent = '';
        stars.forEach(s => s.classList.remove('active'));
      }, 500);

    } catch (e) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Envoyer mon feedback';
    }
  });

  // Reset views when closing
  function resetViews() {
    viewForm.classList.add('active');
    viewSuccess.classList.remove('active');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Envoyer mon feedback';
  }

  closeBtn.addEventListener('click', () => { setTimeout(resetViews, 300); });
  successClose.addEventListener('click', () => { setTimeout(resetViews, 300); });

  /* ── Close on outside click ── */
  document.addEventListener('click', e => {
    if (isOpen && !container.contains(e.target)) closePanel();
  });

  /* ── Keyboard ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closePanel();
  });

  /* ── Mobile: adjust position ── */
  function adjustPosition() {
    const isMobile = window.innerWidth <= 480;
    fab.style.bottom = isMobile ? '90px' : '28px';
  }
  adjustPosition();
  window.addEventListener('resize', adjustPosition);

  // Expose to window for external control
  window.DevisFeedback = {
    open: openPanel,
    close: closePanel,
    toggle: () => isOpen ? closePanel() : openPanel()
  };
})();