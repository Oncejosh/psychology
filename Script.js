(function(){

  /* ================= UI UTILITIES ================= */

  // Toast notifications — replaces jarring browser alert() popups.
  function showToast(message, type){
    const container = document.getElementById('toast-container');
    if(!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast' + (type === 'error' ? ' toast-error' : type === 'success' ? ' toast-success' : '');
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  // Global ripple-on-click feedback for every button — purely decorative,
  // attached via delegation so it also covers buttons rendered later.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .icon-btn, .qa-btn, .mood-pill, .track-pill');
    if(!btn || btn.disabled) return;
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.6;
    const ripple = document.createElement('span');
    ripple.className = 'btn-ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  // Small inline icon set used across nav tabs and dashboard cards, keyed by module.
  const ICONS = {
    dashboard: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="10" y="2" width="6" height="6" rx="1"/><rect x="2" y="10" width="6" height="6" rx="1"/><rect x="10" y="10" width="6" height="6" rx="1"/></svg>',
    assessment: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="10" height="13" rx="1.2"/><path d="M7 2.3h4v1.7H7z"/><path d="M6.5 9.3l1.8 1.8 3-3.4"/></svg>',
    interview: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6.5" y="2" width="5" height="8" rx="2.5"/><path d="M4.5 8.5a4.5 4.5 0 0 0 9 0"/><path d="M9 13v2.3M6.5 15.3h5"/></svg>',
    resume: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2h5l3 3v9a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1z"/><path d="M10 2v3h3"/><path d="M6 9h6M6 11.3h6M6 13.6h4"/></svg>',
    checker: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 2h5l3 3v3.5" /><path d="M10 2v3h3"/><circle cx="6.3" cy="12.3" r="2.3"/><path d="M8 14l1.6 1.6"/></svg>',
    scenarios: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4h9v6h-4.5l-2.3 2.2V10h-2.2z"/></svg>',
    tracker: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="14" height="9" rx="1.2"/><path d="M6.5 6V4.5a1.5 1.5 0 0 1 1.5-1.5h2a1.5 1.5 0 0 1 1.5 1.5V6"/><path d="M2 10h14"/></svg>',
    typing: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4.5" width="14" height="9.5" rx="1.4"/><path d="M5 8h.01M8 8h.01M11 8h.01M13.5 8h.01M5 11h6.5"/></svg>',
    wellness: '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 15.3S2.7 11.4 2.7 6.9a3.4 3.4 0 0 1 6.3-1.7 3.4 3.4 0 0 1 6.3 1.7c0 4.5-6.3 8.4-6.3 8.4z"/></svg>'
  };

  // Renders an SVG circular progress ring with a centered percentage label.
  function progressRing(percent, opts){
    const size = (opts && opts.size) || 92;
    const stroke = (opts && opts.strokeWidth) || 9;
    const color = (opts && opts.color) || 'var(--teal)';
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const offset = c * (1 - Math.max(0, Math.min(100, percent)) / 100);
    const mid = size / 2;
    return `
      <svg class="progress-ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${mid}" cy="${mid}" r="${r}" fill="none" stroke="var(--line)" stroke-width="${stroke}"/>
        <circle cx="${mid}" cy="${mid}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}"
          stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${offset}"
          transform="rotate(-90 ${mid} ${mid})" style="transition:stroke-dashoffset .8s ease;"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="central" font-size="${Math.round(size*0.24)}" font-weight="700" fill="var(--ink)">${percent}%</text>
      </svg>
    `;
  }

  // Bar chart with an optional trend line connecting the bar tops — used for
  // progress-over-time visuals (interview scores, assessment attempts).
  function barChartWithTrend(values, labels, opts){
    const o = opts || {};
    const width = 520, height = 180, padTop = 16, padBottom = 30, padX = 24;
    const n = values.length;
    if(n === 0) return '';
    const barW = Math.min(56, (width - padX*2) / n * 0.55);
    const gap = (width - padX*2 - barW*n) / Math.max(1, n-1);
    const maxVal = 100;
    const usableH = height - padTop - padBottom;
    const barColor = o.barColor || 'var(--teal)';
    const trendColor = o.trendColor || 'var(--rose-deep)';

    const bars = values.map((v,i) => {
      const x = padX + i*(barW+gap);
      const barH = (v/maxVal) * usableH;
      const y = padTop + usableH - barH;
      return `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="4" fill="${barColor}"/>`;
    }).join('');

    const labelEls = (labels||[]).map((lbl,i) => {
      const x = padX + i*(barW+gap) + barW/2;
      return `<text x="${x}" y="${height-8}" text-anchor="middle" font-size="9.5" fill="var(--ink-soft)" font-family="'IBM Plex Mono', monospace">${escapeHtml(lbl)}</text>`;
    }).join('');

    let trendLine = '';
    if(o.showTrend && n >= 2){
      const points = values.map((v,i) => {
        const x = padX + i*(barW+gap) + barW/2;
        const y = padTop + usableH - (v/maxVal)*usableH;
        return { x, y };
      });
      const d = points.map((p,i) => (i===0 ? 'M' : 'L') + ' ' + p.x + ' ' + p.y).join(' ');
      const last = points[points.length-1];
      const secondLast = points[points.length-2];
      const angle = Math.atan2(last.y - secondLast.y, last.x - secondLast.x);
      const arrowLen = 9;
      const ax1 = last.x - arrowLen*Math.cos(angle - 0.4);
      const ay1 = last.y - arrowLen*Math.sin(angle - 0.4);
      const ax2 = last.x - arrowLen*Math.cos(angle + 0.4);
      const ay2 = last.y - arrowLen*Math.sin(angle + 0.4);
      trendLine = `<path d="${d}" fill="none" stroke="${trendColor}" stroke-width="2"/>
        <path d="M ${last.x} ${last.y} L ${ax1} ${ay1} M ${last.x} ${last.y} L ${ax2} ${ay2}" stroke="${trendColor}" stroke-width="2" stroke-linecap="round"/>`;
    }

    return `<svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto;">
      ${bars}
      ${trendLine}
      ${labelEls}
    </svg>`;
  }

  // Donut chart — used for the application status breakdown.
  function donutChart(segments, opts){
    const o = opts || {};
    const size = o.size || 140;
    const strokeWidth = o.strokeWidth || 22;
    const total = segments.reduce((a,s) => a + s.value, 0);
    if(total === 0) return '';
    const r = (size - strokeWidth) / 2;
    const c = 2 * Math.PI * r;
    const mid = size / 2;
    let acc = 0;
    const circles = segments.filter(s => s.value > 0).map(seg => {
      const frac = seg.value / total;
      const dash = frac * c;
      const rotation = (acc / total) * 360 - 90;
      acc += seg.value;
      return `<circle cx="${mid}" cy="${mid}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${strokeWidth}" stroke-dasharray="${dash} ${c-dash}" transform="rotate(${rotation} ${mid} ${mid})"/>`;
    }).join('');
    return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${circles}</svg>`;
  }

  /* ================= WELLNESS: QUOTES & DAILY CHECK-IN ================= */
  // Standalone "note for today" pool — always general, independent of mood check-in.
  const DAILY_NOTES = [
    "Progress isn't always visible day to day — but showing up consistently is what builds it.",
    "You don't have to have it all figured out today. One step is enough.",
    "Every application you send is practice, not just a gamble.",
    "Small, steady effort beats a burst of motivation that fizzles out.",
    "You're allowed to move at a pace that's sustainable for you.",
    "The job search is a season, not a permanent state."
  ];

  // Mood-specific encouragement, shown only after a check-in is submitted.
  const QUOTES = {
    general: [
      "Doing okay is a perfectly good place to be today.",
      "Steady is still moving forward.",
      "You don't need a breakthrough today — just a next step."
    ],
    stressed: [
      "It's okay to slow down. Burnout doesn't make you more hireable — rest does.",
      "You can care about this and still take a break from it today.",
      "Stress means you care. It doesn't mean you're failing."
    ],
    rejected: [
      "A rejection is information about fit, not a verdict on your worth.",
      "Most people you admire were told 'no' more times than you'll ever hear about.",
      "This closed door doesn't erase the skills you built getting here."
    ],
    confidence: [
      "You don't need to feel 100% ready to be ready enough to start.",
      "Confidence is often just practiced discomfort. Keep practicing.",
      "You've prepared for this more than you're giving yourself credit for."
    ],
    resilience: [
      "Setbacks are data, not endings.",
      "The version of you a year from now will look back at this as one step, not the whole story.",
      "Bouncing back doesn't mean bouncing back immediately. Slowly counts."
    ]
  };

  function pickDailyNote(){
    const dayIndex = Math.floor(Date.now() / 86400000);
    return DAILY_NOTES[dayIndex % DAILY_NOTES.length];
  }

  function pickQuote(mood){
    const bank = QUOTES[mood] || QUOTES.general;
    // Offset by 2 so it never lines up with pickDailyNote's index on the same day.
    const dayIndex = Math.floor(Date.now() / 86400000) + 2;
    return bank[dayIndex % bank.length];
  }

  const CHECKIN_MOODS = [
    { key:'motivated', label:'Great', quoteMood:'resilience', emoji:'😄' },
    { key:'okay', label:'Good', quoteMood:'general', emoji:'🙂' },
    { key:'anxious', label:'Okay', quoteMood:'confidence', emoji:'😐' },
    { key:'stressed', label:'Tired', quoteMood:'stressed', emoji:'😔' },
    { key:'rejected', label:'Stressed', quoteMood:'rejected', emoji:'😣' }
  ];

  function todayKey(){ return new Date().toDateString(); }

  function getTodayCheckin(){
    const saved = load('dctp_checkin', null);
    if(saved && saved.date === todayKey()) return saved;
    return null;
  }


  if(window.pdfjsLib){
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  }

  /* ================= AUTH (Supabase) ================= */
  const SUPABASE_URL = 'https://eugpzkxzozhqftvvebrj.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV1Z3B6a3h6b3pocWZ0dnZlYnJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMzNjg2MjEsImV4cCI6MjA5ODk0NDYyMX0.xkXq0gM55Q4ccXE2ESt5O4G4KPrrqS3vPjNzzN3da4o';
  const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  let authMode = 'login'; // 'login' | 'signup'
  let isGuestMode = false;
  let currentUserId = '';
  let currentUserEmail = '';
  let currentUserAvatar = '';
  let currentUserName = '';

  // Every localStorage key in this list is mirrored to the Supabase
  // "user_data" table (one row per user per key) so a student's progress
  // follows them to another device instead of staying stuck on one browser.
  // Pure UI/device preferences (sidebar collapsed, theme) are deliberately
  // left out — no need to sync those.
  const CLOUD_SYNCED_KEYS = [
    'dctp_assessment', 'dctp_assessment_history', 'dctp_checker_result',
    'dctp_checkin', 'dctp_checkin_history', 'dctp_interview_history',
    'dctp_job_tracker', 'dctp_tasks', 'dctp_typing_history'
  ];

  function setAuthStatus(msg, isError){
    const el = document.getElementById('auth-status');
    el.textContent = msg || '';
    el.style.color = isError ? 'var(--danger)' : 'var(--teal-deep)';
  }

  function setAuthMode(mode){
    authMode = mode;
    const isLogin = mode === 'login';
    document.getElementById('auth-switch-login').classList.toggle('active', isLogin);
    document.getElementById('auth-switch-signup').classList.toggle('active', !isLogin);
    document.getElementById('auth-switch-login').setAttribute('aria-selected', String(isLogin));
    document.getElementById('auth-switch-signup').setAttribute('aria-selected', String(!isLogin));
    document.getElementById('auth-switch-thumb').classList.toggle('right', !isLogin);
    document.getElementById('auth-heading').textContent = isLogin ? 'Log in to continue' : 'Create your account';
    document.getElementById('auth-subtext').textContent = isLogin
      ? 'Your progress — assessments, resumes, goals — is saved to your account.'
      : 'Takes less than a minute. Your progress is saved as you go.';
    document.getElementById('auth-submit').textContent = isLogin ? 'Log in' : 'Create account';
    document.getElementById('auth-password').setAttribute('autocomplete', isLogin ? 'current-password' : 'new-password');
    setAuthStatus('');
  }
  document.getElementById('auth-switch-login').addEventListener('click', () => setAuthMode('login'));
  document.getElementById('auth-switch-signup').addEventListener('click', () => setAuthMode('signup'));

  document.getElementById('auth-submit').addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    if(!email || !password){ setAuthStatus('Please enter both email and password.', true); return; }
    if(password.length < 6){ setAuthStatus('Password must be at least 6 characters.', true); return; }

    const btn = document.getElementById('auth-submit');
    btn.disabled = true;
    setAuthStatus(authMode === 'login' ? 'Logging in...' : 'Creating account...', false);

    try{
      if(authMode === 'login'){
        const { error } = await sb.auth.signInWithPassword({ email, password });
        if(error) throw error;
      } else {
        const { data, error } = await sb.auth.signUp({ email, password });
        if(error) throw error;
        if(data.user && !data.session){
          setAuthStatus('Account created — check your email to confirm before logging in.', false);
          btn.disabled = false;
          return;
        }
      }
    } catch(err){
      setAuthStatus(err.message || 'Something went wrong. Please try again.', true);
      btn.disabled = false;
    }
  });

  document.getElementById('auth-google').addEventListener('click', async () => {
    setAuthStatus('Redirecting to Google...', false);
    const { error } = await sb.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.href }
    });
    if(error) setAuthStatus(error.message, true);
  });

  // Guest mode skips Supabase auth entirely: no session, no user_id, so
  // save() below never syncs guest activity to the cloud — it only ever
  // touches localStorage, the same way the whole app worked before cloud
  // sync existed. This is purely for quick testing or letting a survey
  // participant try the platform without creating an account.
  function enterGuestMode(){
    isGuestMode = true;
    currentUserId = '';
    currentUserEmail = '';
    currentUserAvatar = '';
    currentUserName = 'Guest';
    document.getElementById('view-login').style.display = 'none';
    document.getElementById('app-shell').style.display = 'flex';
    document.getElementById('nav-user').style.display = 'block';
    document.getElementById('nav-user-email').textContent = 'Guest mode';
    renderDashboard();
    syncTopbarChrome();
  }
  function exitGuestMode(){
    isGuestMode = false;
    currentUserName = '';
    CLOUD_SYNCED_KEYS.forEach(key => localStorage.removeItem(key));
    document.getElementById('view-login').style.display = 'block';
    document.getElementById('app-shell').style.display = 'none';
    document.getElementById('nav-user').style.display = 'none';
    setAuthStatus('');
  }
  document.getElementById('auth-guest').addEventListener('click', enterGuestMode);

  document.getElementById('nav-logout').addEventListener('click', async () => {
    if(isGuestMode){ exitGuestMode(); return; }
    await sb.auth.signOut();
  });

  // Pulls every synced key this account has saved in Supabase and writes it
  // into localStorage (which the rest of the app already reads from), then
  // clears any known key Supabase has no row for — this both restores a
  // returning user's data on a new device and prevents a previous account's
  // leftover local data from leaking into a different account on this device.
  async function hydrateUserDataFromSupabase(userId){
    try{
      const { data, error } = await sb.from('user_data').select('key,value').eq('user_id', userId);
      if(error) throw error;
      const found = new Set();
      (data || []).forEach(row => {
        try{ localStorage.setItem(row.key, JSON.stringify(row.value)); } catch(e){}
        found.add(row.key);
      });
      CLOUD_SYNCED_KEYS.forEach(key => { if(!found.has(key)) localStorage.removeItem(key); });
    } catch(err){
      console.error('Could not load saved data from Supabase:', err.message);
    }
  }

  async function applyAuthUI(session){
    if(!session && isGuestMode) return; // a guest session isn't a Supabase session — don't let this override it
    const loggedIn = !!session;
    document.getElementById('view-login').style.display = loggedIn ? 'none' : 'block';
    document.getElementById('app-shell').style.display = loggedIn ? 'flex' : 'none';
    document.getElementById('nav-user').style.display = loggedIn ? 'block' : 'none';
    if(loggedIn){
      currentUserId = session.user.id;
      currentUserEmail = session.user.email || '';
      const meta = session.user.user_metadata || {};
      currentUserAvatar = meta.avatar_url || meta.picture || '';
      currentUserName = meta.full_name || meta.name || '';
      document.getElementById('nav-user-email').textContent = currentUserEmail;
      document.getElementById('auth-submit').disabled = false;
      await hydrateUserDataFromSupabase(currentUserId);
      renderDashboard();
    } else {
      if(currentUserId) CLOUD_SYNCED_KEYS.forEach(key => localStorage.removeItem(key));
      currentUserId = '';
      currentUserEmail = '';
      currentUserAvatar = '';
      currentUserName = '';
    }
    syncTopbarChrome();
  }

  sb.auth.onAuthStateChange((_event, session) => applyAuthUI(session));
  sb.auth.getSession().then(({ data }) => applyAuthUI(data.session));

  /* ---------------- NAV ---------------- */
  const tabs = document.querySelectorAll('.tab-btn');
  const views = document.querySelectorAll('.view');
  tabs.forEach(t => {
    const icon = ICONS[t.dataset.view];
    if(icon){ t.innerHTML = icon + '<span class="tab-label">' + t.textContent + '</span>'; }
  });
  const viewTitles = {
    dashboard:'Dashboard', assessment:'Readiness Assessment', interview:'Mock Interview',
    checker:'Resume Checker', tracker:'Job Tracker', typing:'Workplace Typing Simulator', wellness:'Wellness Corner',
    profile:'Account Profile'
  };
  const navIndicator = document.getElementById('nav-indicator');
  function moveNavIndicator(){
    const activeTab = document.querySelector('.tab-btn.active');
    if(!activeTab || !navIndicator) return;
    navIndicator.style.height = activeTab.offsetHeight + 'px';
    navIndicator.style.transform = 'translateY(' + activeTab.offsetTop + 'px)';
    navIndicator.classList.add('ready');
  }

  // Collapsible sidebar — purely a layout preference, persisted locally
  const SIDEBAR_KEY = 'dctp_sidebar_collapsed';
  const sidebarEl = document.querySelector('.sidebar');
  const sidebarToggleBtn = document.getElementById('sidebar-toggle');
  function applySidebarCollapsed(collapsed){
    if(sidebarEl) sidebarEl.classList.toggle('collapsed', collapsed);
    setTimeout(moveNavIndicator, 300);
  }
  if(sidebarToggleBtn){
    applySidebarCollapsed(load(SIDEBAR_KEY, false));
    sidebarToggleBtn.addEventListener('click', () => {
      const next = !sidebarEl.classList.contains('collapsed');
      applySidebarCollapsed(next);
      save(SIDEBAR_KEY, next);
    });
  }
  function showView(name){
    views.forEach(v => v.classList.toggle('active', v.id === 'view-' + name));
    tabs.forEach(t => t.classList.toggle('active', t.dataset.view === name));
    const titleEl = document.getElementById('topbar-title');
    if(titleEl){ titleEl.textContent = viewTitles[name] || name; }
    window.scrollTo({top:0, behavior:'instant' in window ? 'instant' : 'auto'});
    renderDashboard();
    moveNavIndicator();
  }
  tabs.forEach(t => t.addEventListener('click', () => showView(t.dataset.view)));
  window.addEventListener('resize', moveNavIndicator);
  setTimeout(moveNavIndicator, 50);

  /* ---------------- ACCOUNT PROFILE ---------------- */
  function setProfileStatus(id, msg, isError){
    const el = document.getElementById(id);
    if(!el) return;
    el.textContent = msg || '';
    el.style.color = isError ? 'var(--danger)' : 'var(--teal-deep)';
  }
  function renderProfileView(){
    const displayName = currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'there');
    const initial = displayName.charAt(0).toUpperCase() || '?';
    const avatarEl = document.getElementById('profile-avatar');
    if(avatarEl){
      avatarEl.innerHTML = currentUserAvatar
        ? '<img src="' + escapeAttr(currentUserAvatar) + '" alt="Profile picture" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.parentElement.textContent=\'' + escapeAttr(initial) + '\'">'
        : escapeHtml(initial);
    }
    document.getElementById('profile-header-name').textContent = currentUserName || displayName;
    document.getElementById('profile-header-email').textContent = isGuestMode ? 'No account — guest session' : (currentUserEmail || '');
    document.getElementById('profile-fullname').value = isGuestMode ? '' : (currentUserName || '');
    document.getElementById('profile-new-email').value = '';
    document.getElementById('profile-new-password').value = '';
    document.getElementById('profile-confirm-password').value = '';
    const guestNote = 'Create an account to save this — guest sessions aren\'t stored.';
    setProfileStatus('profile-details-status', isGuestMode ? guestNote : '');
    setProfileStatus('profile-email-status', isGuestMode ? guestNote : '');
    setProfileStatus('profile-password-status', isGuestMode ? guestNote : '');
    ['profile-save-details', 'profile-save-email', 'profile-save-password'].forEach(id => {
      document.getElementById(id).disabled = isGuestMode;
    });
  }
  const topbarAvatarBtn = document.getElementById('topbar-avatar');
  if(topbarAvatarBtn){
    topbarAvatarBtn.addEventListener('click', () => { showView('profile'); renderProfileView(); });
    topbarAvatarBtn.addEventListener('keydown', e => {
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); showView('profile'); renderProfileView(); }
    });
  }

  document.getElementById('profile-save-details').addEventListener('click', async () => {
    const name = document.getElementById('profile-fullname').value.trim();
    if(!name){ setProfileStatus('profile-details-status', 'Please enter your name.', true); return; }
    const btn = document.getElementById('profile-save-details');
    btn.disabled = true;
    setProfileStatus('profile-details-status', 'Saving...', false);
    try{
      const { error } = await sb.auth.updateUser({ data:{ full_name:name } });
      if(error) throw error;
      currentUserName = name;
      document.getElementById('profile-header-name').textContent = name;
      renderDashboard();
      syncTopbarChrome();
      setProfileStatus('profile-details-status', 'Saved.', false);
    } catch(err){
      setProfileStatus('profile-details-status', err.message || 'Something went wrong. Please try again.', true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('profile-save-email').addEventListener('click', async () => {
    const email = document.getElementById('profile-new-email').value.trim();
    if(!email){ setProfileStatus('profile-email-status', 'Please enter a new email address.', true); return; }
    if(email === currentUserEmail){ setProfileStatus('profile-email-status', 'That is already your current email.', true); return; }
    const btn = document.getElementById('profile-save-email');
    btn.disabled = true;
    setProfileStatus('profile-email-status', 'Sending confirmation...', false);
    try{
      const { error } = await sb.auth.updateUser({ email });
      if(error) throw error;
      setProfileStatus('profile-email-status', 'Check ' + email + ' for a confirmation link to finish the change.', false);
    } catch(err){
      setProfileStatus('profile-email-status', err.message || 'Something went wrong. Please try again.', true);
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('profile-save-password').addEventListener('click', async () => {
    const pass = document.getElementById('profile-new-password').value;
    const confirm = document.getElementById('profile-confirm-password').value;
    if(!pass || pass.length < 6){ setProfileStatus('profile-password-status', 'Password must be at least 6 characters.', true); return; }
    if(pass !== confirm){ setProfileStatus('profile-password-status', 'Passwords do not match.', true); return; }
    const btn = document.getElementById('profile-save-password');
    btn.disabled = true;
    setProfileStatus('profile-password-status', 'Updating...', false);
    try{
      const { error } = await sb.auth.updateUser({ password:pass });
      if(error) throw error;
      document.getElementById('profile-new-password').value = '';
      document.getElementById('profile-confirm-password').value = '';
      setProfileStatus('profile-password-status', 'Password updated.', false);
    } catch(err){
      setProfileStatus('profile-password-status', err.message || 'Something went wrong. Please try again.', true);
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------------- STORAGE HELPERS ---------------- */
  function load(key, fallback){
    try{ const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
    catch(e){ return fallback; }
  }
  function save(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }
    catch(e){ console.error('Storage error', e); }
    // Fire-and-forget cloud sync — the UI never waits on this, it just keeps
    // reading/writing localStorage exactly as before.
    if(currentUserId && CLOUD_SYNCED_KEYS.includes(key)){
      sb.from('user_data')
        .upsert({ user_id:currentUserId, key, value, updated_at:new Date().toISOString() })
        .then(({ error }) => { if(error) console.error('Supabase sync error:', error.message); });
    }
  }

  /* ================= DASHBOARD ================= */
  function renderDashboard(){
    const assessment = load('dctp_assessment', null);
    const assessmentHistory = load('dctp_assessment_history', []);
    const interviewHistory = load('dctp_interview_history', []);
    const jobApps = load('dctp_job_tracker', []);
    const checkerResult = load('dctp_checker_result', null);

    // Welcome banner with the logged-in account's name/email + avatar.
    const welcomeEl = document.getElementById('dashboard-welcome');
    if(welcomeEl){
      const displayName = currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : 'there');
      const initial = displayName.charAt(0).toUpperCase() || '?';
      const avatarHtml = currentUserAvatar
        ? `<img src="${escapeAttr(currentUserAvatar)}" alt="Profile picture" class="welcome-avatar" onerror="this.outerHTML='<div class=\\'welcome-avatar\\'>${escapeHtml(initial)}</div>'">`
        : `<div class="welcome-avatar">${escapeHtml(initial)}</div>`;
      welcomeEl.innerHTML = `
        <div class="welcome-row">
          ${avatarHtml}
          <div>
            <p class="eyebrow">Welcome back</p>
            <h3 style="font-size:1.2rem; margin-top:4px;">Hi, ${escapeHtml(displayName)}!</h3>
            <p style="color:var(--ink-soft); font-size:0.88rem; margin-top:4px;">${escapeHtml(currentUserEmail || '')}</p>
          </div>
        </div>
      `;
    }

    // Note of the day — always a general daily note, separate from the mood check-in quote below.
    const quoteEl = document.getElementById('dashboard-quote');
    if(quoteEl){
      quoteEl.innerHTML = `<span>A note for today</span>"${pickDailyNote()}"`;
    }

    // Overall progress, based on which modules have any real activity.
    const activitiesDone = [
      { label:'Readiness Assessment taken', done: !!assessment },
      { label:'Mock Interview practiced', done: interviewHistory.length > 0 },
      { label:'Resume checked for ATS compliance', done: !!checkerResult },
      { label:'Job applications logged', done: jobApps.length > 0 },
      { label:'Checked in on Wellness Corner today', done: !!getTodayCheckin() }
    ];
    const doneCount = activitiesDone.filter(a => a.done).length;
    const overallPct = Math.round((doneCount / activitiesDone.length) * 100);

    renderQuickActions();
    renderRecentActivity(assessmentHistory, interviewHistory, checkerResult, jobApps);
    renderDashboardStats(assessment, checkerResult, interviewHistory, jobApps);
    renderDashboardBanner();
    renderMainChart(assessmentHistory, interviewHistory, jobApps, checkerResult);
    renderWeeklyGoals(activitiesDone, overallPct);
    renderCareerTips();
    renderAchievements(assessmentHistory, interviewHistory, jobApps, checkerResult);
    renderStreakWidget();
    renderTasksWidget();
    renderRecommendWidget(assessment, checkerResult, interviewHistory, jobApps);
  }

  // ---- Four KPI stat cards at the top of the dashboard ----
  function renderDashboardStats(assessment, checkerResult, interviewHistory, jobApps){
    const el = document.getElementById('dashboard-stats');
    if(!el) return;
    const readiness = assessment ? assessment.overall : 0;
    const ats = checkerResult ? checkerResult.overall : 0;
    const interviews = interviewHistory.length;
    const applications = jobApps.length;
    const cards = [
      {
        icon: ICONS.assessment, cls:'icon-blue', label:'Career Readiness',
        big: readiness ? `${readiness}%` : '—',
        sub: readiness ? (readiness >= 70 ? 'Good progress' : 'Keep building') : 'Not started yet'
      },
      {
        icon: ICONS.checker, cls:'icon-green', label:'Resume ATS Score',
        big: ats ? `${ats}<span class="stat-out-of">/100</span>` : '—',
        sub: ats ? (ats >= 80 ? 'Excellent match' : 'Room to improve') : 'Upload a resume'
      },
      {
        icon: ICONS.interview, cls:'icon-purple', label:'Interviews Completed',
        big: `${interviews}`, sub:'This month'
      },
      {
        icon: ICONS.tracker, cls:'icon-blue', label:'Applications Sent',
        big: `${applications}`, sub:'This month'
      }
    ];
    el.innerHTML = cards.map(c => `
      <div class="stat-card">
        <span class="card-icon ${c.cls}">${c.icon}</span>
        <div class="label">${c.label}</div>
        <div class="value">${c.big}</div>
        <div class="sub">${c.sub}</div>
      </div>
    `).join('');
  }

  // ---- Small motivational banner, top right of the dashboard ----
  function renderDashboardBanner(){
    const el = document.getElementById('dashboard-banner');
    if(!el) return;
    el.innerHTML = `
      <span class="banner-star">★</span>
      <h3>Keep going!</h3>
      <p>Small steps today, big changes tomorrow.</p>
    `;
  }

  // ---- Main "Career Progress Overview" line chart ----
  function renderMainChart(assessmentHistory, interviewHistory, jobApps, checkerResult){
    const el = document.getElementById('dashboard-chart-main');
    if(!el) return;
    const interviewVals = interviewHistory.filter(h => typeof h.overallPct === 'number').map(h => h.overallPct).slice(-8);
    const assessVals = assessmentHistory.map(a => a.overall).slice(-8);
    const mainSeries = interviewVals.length >= assessVals.length ? interviewVals : assessVals;
    const hasData = mainSeries.length > 0;
    const values = hasData ? mainSeries : [0,0,0,0,0,0,0];
    const legend = [
      { label:'Assessments', color:'var(--gold)', value: assessmentHistory.length ? assessmentHistory[assessmentHistory.length-1].overall + '%' : '—' },
      { label:'Interviews', color:'var(--rose)', value: interviewHistory.length ? interviewHistory[interviewHistory.length-1].overallPct + '%' : '—' },
      { label:'Applications', color:'var(--success)', value: jobApps.length },
      { label:'Skills Score', color:'var(--warning)', value: checkerResult ? checkerResult.overall + '%' : '—' }
    ];
    el.innerHTML = `
      <div class="chart-card-head-row">
        <h3>Career Progress Overview</h3>
        <span class="chart-period">This Month</span>
      </div>
      ${hasData ? areaLineChart(values) : `<p class="panel-sub" style="margin:20px 0;">Your progress chart will fill in as you use the Readiness Assessment and Mock Interview tools.</p>`}
      <div class="main-chart-legend">
        ${legend.map(l => `<div class="legend-row"><span class="legend-dot" style="background:${l.color}"></span>${l.label}<strong>${l.value}</strong></div>`).join('')}
      </div>
    `;
  }

  // ---- Weekly goals card, built from the same activity checklist as before ----
  function renderWeeklyGoals(activitiesDone, overallPct){
    const el = document.getElementById('weekly-goals-card');
    if(!el) return;
    el.innerHTML = `
      <div class="panel-head"><h3>Weekly Goals</h3></div>
      <ul class="goal-list">
        ${activitiesDone.map(a => `
          <li class="goal-row ${a.done ? 'done' : ''}">
            <span class="goal-check">${a.done ? '✓' : ''}</span>
            <div class="goal-body">
              <div class="goal-label">${escapeHtml(a.label)}</div>
              <div class="bar-track"><div class="bar-fill" style="width:${a.done ? 100 : 0}%"></div></div>
            </div>
          </li>
        `).join('')}
      </ul>
      <div class="goal-overall">
        <span>Overall Progress</span>
        ${progressRing(overallPct, { size:44, strokeWidth:5 })}
      </div>
    `;
  }

  // ---- Career Tips card (static rotating tip) ----
  const CAREER_TIPS = [
    { title:'Improve Your LinkedIn Profile', body:'A strong LinkedIn profile increases your chances of getting noticed by recruiters. Add a professional photo, a compelling headline, and showcase your projects.' },
    { title:'Tailor Every Resume', body:'Match your resume keywords to each job post before applying — many companies filter applicants with ATS software before a human ever sees it.' },
    { title:'Practice Out Loud', body:'Rehearsing interview answers out loud, not just in your head, builds the muscle memory that keeps you calm when it counts.' }
  ];
  let careerTipIndex = 0;
  function renderCareerTips(){
    const el = document.getElementById('career-tips-card');
    if(!el) return;
    const tip = CAREER_TIPS[careerTipIndex % CAREER_TIPS.length];
    el.innerHTML = `
      <div class="panel-head"><h3>Career Tips</h3></div>
      <div class="tip-card">
        <h4>${escapeHtml(tip.title)}</h4>
        <p>${escapeHtml(tip.body)}</p>
        <button class="btn btn-primary btn-sm" id="career-tip-next" type="button">Read More Tips</button>
      </div>
      <div class="tip-dots">${CAREER_TIPS.map((_,i) => `<span class="tip-dot ${i === careerTipIndex % CAREER_TIPS.length ? 'active' : ''}"></span>`).join('')}</div>
    `;
    const btn = document.getElementById('career-tip-next');
    if(btn){ btn.addEventListener('click', () => { careerTipIndex++; renderCareerTips(); }); }
  }

  // ---- Achievements card — simple milestone badges from real usage data ----
  function renderAchievements(assessmentHistory, interviewHistory, jobApps, checkerResult){
    const el = document.getElementById('achievements-card');
    if(!el) return;
    const checkinHistory = load('dctp_checkin_history', []);
    const streak = computeCheckinStreak(checkinHistory);
    const totalActions = assessmentHistory.length + interviewHistory.length + jobApps.length + (checkerResult ? 1 : 0) + checkinHistory.length;
    const badges = [
      { label:'First Step', sub:'Assessment Completed', unlocked: assessmentHistory.length > 0 },
      { label:'Consistent', sub:'7 Day Streak', unlocked: streak >= 7 },
      { label:'Rising Star', sub:'5 Interviews Completed', unlocked: interviewHistory.length >= 5 },
      { label:'Active User', sub:'10 Activities Completed', unlocked: totalActions >= 10 }
    ];
    el.innerHTML = `
      <div class="panel-head"><h3>Achievements</h3></div>
      <div class="badge-grid">
        ${badges.map(b => `
          <div class="badge-tile ${b.unlocked ? 'unlocked' : ''}">
            <span class="badge-shape">★</span>
            <div class="badge-label">${escapeHtml(b.label)}</div>
            <div class="badge-sub">${escapeHtml(b.sub)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // ---- Longest historical run of consecutive check-in days (all-time best) ----
  function computeLongestStreak(history){
    if(!history.length) return 0;
    const days = [...new Set(history.map(h => new Date(h.date).setHours(0,0,0,0)))].sort((a,b) => a - b);
    let longest = 1, current = 1;
    for(let i = 1; i < days.length; i++){
      const diff = Math.round((days[i] - days[i-1]) / 86400000);
      current = diff === 1 ? current + 1 : 1;
      if(current > longest) longest = current;
    }
    return longest;
  }

  // ---- Learning Streak widget: current/best streak + progress toward next milestone ----
  const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];
  function renderStreakWidget(){
    const el = document.getElementById('streak-widget-card');
    if(!el) return;
    const history = load('dctp_checkin_history', []);
    const current = computeCheckinStreak(history);
    const best = Math.max(current, computeLongestStreak(history));
    const next = STREAK_MILESTONES.find(m => m > current) || (current + 7);
    const pct = Math.max(0, Math.min(100, Math.round((current / next) * 100)));
    const msg = current === 0
      ? 'Check in on the Wellness Corner today to start your streak.'
      : 'Keep learning every day to maintain your streak.';
    el.innerHTML = `
      <div class="streak-widget-head">
        <span class="streak-flame">🔥</span>
        <div class="panel-head" style="margin:0;"><h3>Learning Streak</h3></div>
      </div>
      <div class="streak-stat-row">
        <div class="streak-stat-block"><strong>${current}</strong><span>Current streak</span></div>
        <div class="streak-stat-block"><strong>${best}</strong><span>Best streak</span></div>
      </div>
      <div class="streak-ring-row">
        ${progressRing(pct, { size:56, strokeWidth:6 })}
        <div class="streak-ring-label"><strong>${current} / ${next} days</strong>Progress to next badge</div>
      </div>
      <p class="streak-msg">${msg}</p>
    `;
  }

  // ---- Upcoming Tasks widget: a small, real, persisted task list ----
  function formatTaskDue(dateStr){
    const due = new Date(dateStr); due.setHours(0,0,0,0);
    const today = new Date(); today.setHours(0,0,0,0);
    const diffDays = Math.round((due - today) / 86400000);
    if(diffDays === 0) return 'Today';
    if(diffDays === 1) return 'Tomorrow';
    if(diffDays === -1) return 'Yesterday';
    if(diffDays < 0) return due.toLocaleDateString(undefined, { month:'short', day:'numeric' });
    if(diffDays < 7) return due.toLocaleDateString(undefined, { weekday:'long' });
    return due.toLocaleDateString(undefined, { month:'short', day:'numeric' });
  }
  function seedDefaultTasks(){
    const today = new Date();
    const mk = (offset) => { const d = new Date(today); d.setDate(d.getDate() + offset); d.setHours(0,0,0,0); return d.toISOString(); };
    return [
      { id:'seed-1', text:'Complete Resume Review', due:mk(0), priority:'high', done:false },
      { id:'seed-2', text:'Practice Mock Interview', due:mk(1), priority:'medium', done:false },
      { id:'seed-3', text:'Retake Career Readiness Assessment', due:mk(4), priority:'medium', done:false },
      { id:'seed-4', text:'Update Career Goals', due:mk(6), priority:'low', done:false }
    ];
  }
  function loadTasks(){
    let tasks = load('dctp_tasks', null);
    if(tasks === null){
      tasks = seedDefaultTasks();
      save('dctp_tasks', tasks);
    }
    return tasks;
  }
  function renderTasksWidget(){
    const el = document.getElementById('tasks-widget-card');
    if(!el) return;
    const tasks = loadTasks().slice().sort((a,b) => new Date(a.due) - new Date(b.due));
    el.innerHTML = `
      <div class="panel-head"><h3>Upcoming Tasks</h3></div>
      <div class="task-add-row" id="task-add-row" style="display:none;">
        <input type="text" id="task-add-text" placeholder="New task...">
        <input type="date" id="task-add-date">
      </div>
      ${tasks.length === 0
        ? `<p class="activity-empty">No upcoming tasks.<br>You're all caught up!</p>`
        : `<ul class="task-list">${tasks.map(t => `
            <li class="task-item ${t.done ? 'done' : ''}" data-id="${escapeAttr(t.id)}">
              <button type="button" class="task-checkbox" data-action="toggle">${t.done ? '✓' : ''}</button>
              <div class="task-body">
                <div class="task-text">${escapeHtml(t.text)}</div>
                <div class="task-meta">
                  <span class="task-priority-dot ${t.priority}"></span>
                  <span class="task-due">${formatTaskDue(t.due)}</span>
                </div>
              </div>
              <button type="button" class="task-remove" data-action="remove" title="Remove task">✕</button>
            </li>
          `).join('')}</ul>`
      }
      <button class="btn btn-ghost btn-sm" id="task-add-toggle" type="button" style="width:100%;">+ Add Task</button>
    `;
    el.querySelectorAll('.task-item [data-action="toggle"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.task-item').dataset.id;
        const list = loadTasks();
        const item = list.find(t => t.id === id);
        if(item){ item.done = !item.done; save('dctp_tasks', list); renderTasksWidget(); }
      });
    });
    el.querySelectorAll('.task-item [data-action="remove"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.closest('.task-item').dataset.id;
        const list = loadTasks().filter(t => t.id !== id);
        save('dctp_tasks', list);
        renderTasksWidget();
      });
    });
    const addToggle = document.getElementById('task-add-toggle');
    const addRow = document.getElementById('task-add-row');
    if(addToggle){
      addToggle.addEventListener('click', () => {
        const showing = addRow.style.display !== 'none';
        addRow.style.display = showing ? 'none' : 'flex';
        if(!showing){
          document.getElementById('task-add-text').focus();
        } else {
          commitNewTask();
        }
      });
    }
    function commitNewTask(){
      const textInput = document.getElementById('task-add-text');
      const dateInput = document.getElementById('task-add-date');
      const text = textInput.value.trim();
      if(!text) return;
      const due = dateInput.value ? new Date(dateInput.value).toISOString() : new Date().toISOString();
      const list = loadTasks();
      list.push({ id:'task-' + Date.now(), text, due, priority:'medium', done:false });
      save('dctp_tasks', list);
      renderTasksWidget();
    }
    const textInput = document.getElementById('task-add-text');
    if(textInput){
      textInput.addEventListener('keydown', (e) => {
        if(e.key === 'Enter'){ e.preventDefault(); commitNewTask(); }
      });
    }
  }

  // ---- Recommended Next Step widget: one suggestion based on real progress ----
  function renderRecommendWidget(assessment, checkerResult, interviewHistory, jobApps){
    const el = document.getElementById('recommend-widget-card');
    if(!el) return;
    let rec;
    if(!assessment){
      rec = { icon:ICONS.assessment, text:'Take the Career Readiness Assessment to get a clear starting picture.', time:'10 Minutes', difficulty:'Easy', view:'assessment' };
    } else if(!checkerResult){
      rec = { icon:ICONS.checker, text:'Run your resume through the Resume Checker for an ATS score.', time:'5 Minutes', difficulty:'Easy', view:'checker' };
    } else if(interviewHistory.length < 3){
      rec = { icon:ICONS.interview, text:'Practice another Mock Interview to sharpen your answers.', time:'15 Minutes', difficulty:'Medium', view:'interview' };
    } else if(jobApps.length < 5){
      rec = { icon:ICONS.tracker, text:'Log a few more applications in the Job Tracker to keep momentum.', time:'10 Minutes', difficulty:'Easy', view:'tracker' };
    } else if(!getTodayCheckin()){
      rec = { icon:'💛', text:'Check in on the Wellness Corner — a quick reset counts too.', time:'2 Minutes', difficulty:'Easy', view:'wellness' };
    } else {
      rec = { icon:ICONS.interview, text:'You\'re on track — practice another Mock Interview to stay sharp.', time:'15 Minutes', difficulty:'Easy', view:'interview' };
    }
    el.innerHTML = `
      <div class="panel-head"><h3>Recommended Next Step</h3></div>
      <p class="panel-sub" style="margin-top:2px;">Based on your recent activity, we recommend:</p>
      <div class="recommend-suggestion">✓ ${escapeHtml(rec.text)}</div>
      <div class="recommend-meta">
        <div><span>Estimated Time</span><strong>${rec.time}</strong></div>
        <div><span>Difficulty</span><strong>${rec.difficulty}</strong></div>
      </div>
      <button class="btn btn-primary" id="recommend-start-btn" type="button" style="width:100%; text-align:center;">Start Now</button>
    `;
    const btn = document.getElementById('recommend-start-btn');
    if(btn) btn.addEventListener('click', () => showView(rec.view));
  }

  // ---- Smooth-ish area line chart used by the main dashboard chart ----
  function areaLineChart(values){
    const width = 760, height = 200, padTop = 14, padBottom = 14, padX = 10;
    const n = values.length;
    const maxVal = 100;
    const usableW = width - padX*2;
    const usableH = height - padTop - padBottom;
    const points = values.map((v,i) => {
      const x = n > 1 ? padX + (i/(n-1))*usableW : padX + usableW/2;
      const y = padTop + usableH - (Math.max(0,Math.min(100,v))/maxVal)*usableH;
      return { x, y };
    });
    const line = points.map((p,i) => (i===0 ? 'M':'L') + ' ' + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
    const area = `${line} L ${points[points.length-1].x.toFixed(1)} ${height-padBottom} L ${points[0].x.toFixed(1)} ${height-padBottom} Z`;
    const dots = points.map(p => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="var(--gold)" stroke="#fff" stroke-width="2"/>`).join('');
    return `
      <svg viewBox="0 0 ${width} ${height}" style="width:100%; height:auto;">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.28"/>
            <stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#areaFill)"/>
        <path d="${line}" fill="none" stroke="var(--gold)" stroke-width="2.5"/>
        ${dots}
      </svg>
    `;
  }

  // Quick action shortcuts — one-tap jump into each module from the dashboard.
  function renderQuickActions(){
    const el = document.getElementById('quick-actions');
    if(!el) return;
    const actions = [
      { view:'assessment', icon:ICONS.assessment, label:'Take Readiness Assessment' },
      { view:'interview', icon:ICONS.interview, label:'Practice Mock Interview' },
      { view:'checker', icon:ICONS.checker, label:'Check My Resume' },
      { view:'tracker', icon:ICONS.tracker, label:'Log Application' }
    ];
    el.innerHTML = actions.map(a => `
      <button type="button" class="qa-btn" data-view="${a.view}">
        <span class="qa-icon">${a.icon}</span>
        <span class="qa-label">${a.label}</span>
      </button>
    `).join('');
    el.querySelectorAll('.qa-btn').forEach(btn => {
      btn.addEventListener('click', () => showView(btn.dataset.view));
    });
  }

  // Relative-time formatter used by the Recent Activity feed.
  function timeAgo(dateStr){
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if(mins < 1) return 'Just now';
    if(mins < 60) return mins + ' min ago';
    const hrs = Math.floor(mins / 60);
    if(hrs < 24) return hrs + ' hr' + (hrs > 1 ? 's' : '') + ' ago';
    const days = Math.floor(hrs / 24);
    if(days < 7) return days + ' day' + (days > 1 ? 's' : '') + ' ago';
    return new Date(dateStr).toLocaleDateString(undefined, { month:'short', day:'numeric' });
  }

  // Recent Activity — merges the latest event from each module into one feed.
  function renderRecentActivity(assessmentHistory, interviewHistory, checkerResult, jobApps){
    const el = document.getElementById('recent-activity');
    if(!el) return;
    const events = [];
    assessmentHistory.forEach(a => events.push({ date:a.date, text:`Took the Career Readiness Assessment — scored ${a.overall}%`, icon:ICONS.assessment, cls:'icon-blue' }));
    interviewHistory.forEach(h => events.push({ date:h.date, text:`Completed a Mock Interview session — ${h.overallPct}%`, icon:ICONS.interview, cls:'icon-purple' }));
    if(checkerResult && checkerResult.date){ events.push({ date:checkerResult.date, text:`Checked resume — ${checkerResult.overall}% ATS-readiness`, icon:ICONS.checker, cls:'icon-green' }); }
    jobApps.forEach(a => { if(a.company && a.date){ events.push({ date:a.date, text:`Logged application to ${a.company}`, icon:ICONS.tracker, cls:'icon-orange' }); } });

    events.sort((a,b) => new Date(b.date) - new Date(a.date));
    const recent = events.slice(0, 5);

    el.innerHTML = `
      <div class="panel-head"><h3>Recent Activity</h3></div>
      ${recent.length === 0
        ? `<p class="activity-empty">Nothing logged yet — activity across all modules will show up here.</p>`
        : `<ul class="activity-list">${recent.map(e => `
            <li class="activity-row">
              <span class="activity-icon ${e.cls}">${e.icon}</span>
              <div class="activity-text">${escapeHtml(e.text)}<span class="activity-time">${timeAgo(e.date)}</span></div>
            </li>
          `).join('')}</ul>`
      }
    `;
  }

  // Wellness check-in streak — counts consecutive days ending today.
  function computeCheckinStreak(history){
    if(!history.length) return 0;
    const daySet = new Set(history.map(h => new Date(h.date).setHours(0,0,0,0)));
    let streak = 0;
    const cursor = new Date();
    cursor.setHours(0,0,0,0);
    while(daySet.has(cursor.getTime())){
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }
  function renderStreak(){
    const el = document.getElementById('streak-card');
    if(!el) return;
    const history = load('dctp_checkin_history', []);
    const streak = computeCheckinStreak(history);
    const days = [];
    for(let i = 6; i >= 0; i--){
      const d = new Date();
      d.setHours(0,0,0,0);
      d.setDate(d.getDate() - i);
      const filled = history.some(h => new Date(h.date).setHours(0,0,0,0) === d.getTime());
      days.push(filled);
    }
    el.innerHTML = `
      <div class="panel-head"><h3>Wellness Check-in Streak</h3></div>
      <p class="panel-sub">Consecutive days you've checked in</p>
      <div class="streak-row">
        <div>
          <div class="streak-num">${streak}</div>
          <div class="streak-unit">day${streak === 1 ? '' : 's'} in a row</div>
        </div>
      </div>
      <div class="streak-dots">${days.map(f => `<span class="streak-dot ${f ? 'filled' : ''}"></span>`).join('')}</div>
      <p class="panel-sub" style="margin-top:12px; margin-bottom:0;">${streak > 0 ? 'Keep it going — even a quick check-in counts.' : 'Check in on the Wellness Corner to start your streak.'}</p>
    `;
  }

  /* ================= ASSESSMENT ================= */
  const assessmentCategories = [
    { key:'communication', title:'Communication', questions:[
      'I can clearly explain my ideas to others.',
      'I feel comfortable speaking in group discussions or meetings.',
      'I can write professional emails and messages.',
      'I actively listen and ask clarifying questions.',
      'I can adjust how I communicate depending on my audience.'
    ]},
    { key:'problemsolving', title:'Problem-Solving', questions:[
      "I can break down a complex problem into smaller steps.",
      "I stay calm when something doesn't go as planned.",
      "I can identify multiple possible solutions before choosing one.",
      "I ask for help when I've tried and still can't solve something.",
      "I learn from mistakes and adjust my approach."
    ]},
    { key:'confidence', title:'Confidence', questions:[
      "I feel prepared to answer questions I wasn't expecting.",
      "I believe my skills are valuable to an employer.",
      "I don't let one bad interview or rejection define my ability.",
      "I can advocate for myself without over-apologizing.",
      "I trust myself to figure things out even in unfamiliar situations."
    ]}
  ];
  const likertLabels = ['Strongly disagree','Disagree','Neutral','Agree','Strongly agree'];

  function buildAssessmentForm(){
    const form = document.getElementById('assess-form');
    let html = '';
    assessmentCategories.forEach((cat, ci) => {
      html += `<div class="qgroup"><h4>${cat.title}</h4>`;
      cat.questions.forEach((q, qi) => {
        const name = cat.key + '_' + qi;
        html += `<div class="question"><p>${q}</p><div class="likert">`;
        likertLabels.forEach((lbl, li) => {
          html += `<label><input type="radio" name="${name}" value="${li+1}"><span>${lbl}</span></label>`;
        });
        html += `</div></div>`;
      });
      html += `</div>`;
    });
    form.innerHTML = html;
    form.addEventListener('change', updateAssessProgress);
    updateAssessProgress();
  }
  buildAssessmentForm();

  // Live "questions answered" progress + estimated time remaining — purely
  // informational, reads the same radio inputs the scoring logic already uses.
  function updateAssessProgress(){
    const totalQuestions = assessmentCategories.reduce((sum, cat) => sum + cat.questions.length, 0);
    const answered = document.querySelectorAll('#assess-form input[type=radio]:checked').length;
    const pct = totalQuestions ? Math.round((answered / totalQuestions) * 100) : 0;
    const textEl = document.getElementById('assess-progress-text');
    const fillEl = document.getElementById('assess-progress-fill');
    const timeEl = document.getElementById('assess-time-left');
    if(textEl) textEl.textContent = `${answered} of ${totalQuestions} answered · ${pct}%`;
    if(fillEl) fillEl.style.width = pct + '%';
    if(timeEl){
      const remaining = totalQuestions - answered;
      timeEl.textContent = remaining > 0
        ? `About ${Math.max(1, Math.round(remaining * 8 / 60))} min left`
        : 'All set — ready to see your results.';
    }
  }

  function computeAssessment(){
    const results = {};
    let allAnswered = true;
    assessmentCategories.forEach(cat => {
      let sum = 0;
      cat.questions.forEach((q, qi) => {
        const name = cat.key + '_' + qi;
        const checked = document.querySelector(`input[name="${name}"]:checked`);
        if(!checked){ allAnswered = false; return; }
        sum += parseInt(checked.value, 10);
      });
      results[cat.key] = Math.round((sum / (cat.questions.length * 5)) * 100);
    });
    if(!allAnswered){
      showToast('Sagutan muna lahat ng tanong bago makita ang resulta.', 'error');
      return null;
    }
    const overall = Math.round(assessmentCategories.reduce((a,cat) => a + results[cat.key], 0) / assessmentCategories.length);
    const levelInfo = {
      'Needs Development': 'You\'re at the very start of building these skills — that\'s completely normal this early. Focus on one area at a time rather than all three at once.',
      'Developing': 'You have a working foundation in these areas, but there\'s still real room to build consistency and confidence.',
      'Ready': 'You\'re in solid shape overall — a bit more practice in your weaker area should round things out.',
      'Highly Ready': 'You\'re scoring strong across the board. Keep practicing to maintain it, especially under real interview pressure.'
    };
    let level;
    if(overall < 50){ level = 'Needs Development'; }
    else if(overall < 70){ level = 'Developing'; }
    else if(overall < 85){ level = 'Ready'; }
    else{ level = 'Highly Ready'; }

    const sorted = assessmentCategories.slice().sort((a,b) => results[b.key] - results[a.key]);
    const highest = sorted[0];
    const lowest = sorted[sorted.length - 1];
    const spread = results[highest.key] - results[lowest.key];

    const focusMap = {
      communication: 'the Mock Interview Simulator to build speaking confidence',
      problemsolving: 'breaking challenges into smaller, concrete steps you can tackle one at a time',
      confidence: 'the Mock Interview Simulator to build steady, practiced confidence'
    };

    let summary;
    if(spread <= 8){
      summary = `${levelInfo[level]} Your three areas are fairly balanced (within ${spread} points of each other), so no single area is dragging you down — steady practice across all three will help most.`;
    } else {
      summary = `${levelInfo[level]} Your strongest area is ${highest.title} (${results[highest.key]}%). Your lowest right now is ${lowest.title} (${results[lowest.key]}%) — try ${focusMap[lowest.key]} next.`;
    }

    return { results, overall, level, summary };
  }

  document.getElementById('assess-submit').addEventListener('click', () => {
    const outcome = computeAssessment();
    if(!outcome) return;
    save('dctp_assessment', outcome);
    const assessHistory = load('dctp_assessment_history', []);
    assessHistory.push({ date: new Date().toISOString(), overall: outcome.overall });
    save('dctp_assessment_history', assessHistory);
    renderAssessmentResult(outcome);
  });

  function renderAssessmentResult(outcome){
    document.getElementById('assess-form-card').style.display = 'none';
    const resultCard = document.getElementById('assess-result');
    resultCard.style.display = 'block';
    document.getElementById('assess-ring').innerHTML = progressRing(outcome.overall, { color: 'var(--teal)' });
    document.getElementById('assess-level').textContent = outcome.level;
    document.getElementById('assess-summary').textContent = outcome.summary;
    const bars = document.getElementById('assess-bars');
    bars.innerHTML = assessmentCategories.map(cat => `
      <div class="bar-row">
        <div class="bar-label"><span>${cat.title}</span><span>${outcome.results[cat.key]}%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${outcome.results[cat.key]}%"></div></div>
      </div>
    `).join('');
  }

  document.getElementById('assess-retake').addEventListener('click', () => {
    document.getElementById('assess-form-card').style.display = 'block';
    document.getElementById('assess-result').style.display = 'none';
    document.querySelectorAll('#assess-form input[type=radio]').forEach(i => i.checked = false);
  });

  // restore previous assessment result if present
  (function restoreAssessment(){
    const prev = load('dctp_assessment', null);
    if(prev) renderAssessmentResult(prev);
  })();

  /* ---- Additive UI widgets for the redesigned assessment view ----
     Display-only: reads the same radio inputs the scoring logic already
     reads. Does not alter computeAssessment, buildAssessmentForm, or any
     saved data. ---- */
  (function assessExtrasWidgets(){
    const formEl = document.getElementById('assess-form');
    if(!formEl) return;
    const totalQuestions = assessmentCategories.reduce((sum, cat) => sum + cat.questions.length, 0);

    const motivations = [
      { max: 1,   text: 'Take your time — every answer sharpens the picture.' },
      { max: 49,  text: "You're doing great. Keep going, one question at a time." },
      { max: 99,  text: 'Almost there — only a few questions left.' },
      { max: 100, text: 'All set! Scroll down to see your results.' }
    ];

    function updateAssessExtras(){
      const answered = document.querySelectorAll('#assess-form input[type=radio]:checked').length;
      const remaining = totalQuestions - answered;
      const pct = totalQuestions ? Math.round((answered / totalQuestions) * 100) : 0;

      const answeredEl = document.getElementById('assess-stat-answered');
      const remainingEl = document.getElementById('assess-stat-remaining');
      const timeEl = document.getElementById('assess-stat-time');
      const pctEl = document.getElementById('assess-stat-percent');
      if(answeredEl) answeredEl.innerHTML = `${answered}<small>/${totalQuestions}</small>`;
      if(remainingEl) remainingEl.textContent = remaining;
      if(timeEl) timeEl.textContent = remaining > 0 ? `~${Math.max(1, Math.round(remaining * 8 / 60))} min` : 'Done!';
      if(pctEl) pctEl.textContent = pct + '%';

      const ringEl = document.getElementById('assess-live-ring');
      if(ringEl) ringEl.innerHTML = progressRing(pct, { size: 64, strokeWidth: 7 });

      const catBarsEl = document.getElementById('assess-category-bars');
      if(catBarsEl){
        catBarsEl.innerHTML = assessmentCategories.map(cat => {
          const catAnswered = cat.questions.reduce((n, q, qi) => {
            const checked = document.querySelector(`input[name="${cat.key}_${qi}"]:checked`);
            return n + (checked ? 1 : 0);
          }, 0);
          const catPct = Math.round((catAnswered / cat.questions.length) * 100);
          return `
            <div class="bar-row">
              <div class="bar-label"><span>${cat.title}</span><span>${catAnswered}/${cat.questions.length}</span></div>
              <div class="bar-track"><div class="bar-fill" style="width:${catPct}%"></div></div>
            </div>
          `;
        }).join('');
      }

      const motivationEl = document.getElementById('assess-motivation-text');
      if(motivationEl){
        const msg = motivations.find(m => pct <= m.max) || motivations[motivations.length - 1];
        motivationEl.textContent = msg.text;
      }
    }

    formEl.addEventListener('change', updateAssessExtras);
    updateAssessExtras();

    const downloadBtn = document.getElementById('assess-download');
    const printBtn = document.getElementById('assess-print');
    if(downloadBtn) downloadBtn.addEventListener('click', () => showToast('Download coming soon — this is a UI preview for now.', 'info'));
    if(printBtn) printBtn.addEventListener('click', () => window.print());
  })();

  /* ================= INTERVIEW ================= */
  const commonQuestions = [
    'Tell me about yourself.',
    'What is your greatest weakness?',
    'Why should we hire you for this role?',
    'Describe a time you worked in a team.',
    'Where do you see yourself in five years?'
  ];
  const tracks = {
    'General': commonQuestions,
    'IT / Programming': [
      'Walk me through a project you built and the problem it solved.',
      'How do you approach debugging an issue you can\'t immediately explain?',
      'Describe a time you had to learn a new tool or language quickly.',
      'How do you handle disagreement with a teammate about a technical approach?',
      'What do you do when you\'re stuck on a bug for hours?'
    ],
    'Business / Office': [
      'Describe a time you had to manage multiple deadlines at once.',
      'How do you handle a situation where a client or supervisor is unhappy with your work?',
      'Tell me about a time you had to persuade someone to see things your way.',
      'How do you prioritize tasks when everything feels urgent?',
      'Describe a mistake you made at work or school and how you fixed it.'
    ],
    'Customer Service': [
      'Describe a time you dealt with an upset or difficult customer.',
      'How do you stay patient when someone is frustrated with you?',
      'Tell me about a time you went beyond what was expected to help someone.',
      'How would you handle a situation where you don\'t know the answer to a customer\'s question?',
      'Describe how you balance being helpful with following company policy.'
    ],
    'Engineering': [
      'Describe a project where you had to work within strict constraints (budget, materials, time).',
      'Tell me about a time a design or plan didn\'t work as expected.',
      'How do you approach a problem with no clear right answer?',
      'Describe how you\'ve worked with a team on a hands-on project.',
      'How do you make sure your work meets safety or quality standards?'
    ]
  };

  let interviewState = null;
  let interviewMode = 'standard';
  let phoneState = null;
  let phoneTimerId = null;
  let phoneRecognition = null;
  let phoneConnectTimeout = null;
  let phoneSilenceTimer = null;
  let phoneAutoAdvanceTimer = null;
  let phoneSpeechDetected = false;
  let phoneListenStartedAt = null;
  let phoneSpeakingMs = 0;
  let phoneRingAudioCtx = null;
  let phoneRingIntervalId = null;

  document.querySelectorAll('.interview-mode').forEach(btn => {
    btn.addEventListener('click', () => {
      interviewMode = btn.dataset.interviewMode;
      document.querySelectorAll('.interview-mode').forEach(item => item.classList.toggle('active', item === btn));
      document.getElementById('interview-mode-description').textContent = interviewMode === 'phone'
        ? 'Simulate a recruiter phone screening with a call timer, optional microphone recording, and the same structured feedback.'
        : 'Practice written responses and receive structured, rule-based feedback.';
      document.getElementById('interview-start').textContent = interviewMode === 'phone' ? 'Start phone interview' : 'Start mock interview';
      if(interviewMode === 'phone' && interviewState){
        showIncomingPhoneCall(interviewState.track);
        return;
      }
      document.getElementById('iv-info-status').textContent = interviewMode === 'phone'
        ? 'Choose an interview track, then start the phone screening'
        : 'Waiting for selection';
    });
  });
  const trackPicker = document.getElementById('track-picker');
  Object.keys(tracks).forEach(t => {
    const pill = document.createElement('button');
    pill.className = 'track-pill';
    pill.type = 'button';
    pill.textContent = t;
    pill.addEventListener('click', () => {
      document.querySelectorAll('.track-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      interviewState = { track: t, questions: shuffle(tracks[t]).slice(0,5), index:0, answers:[] };
      document.getElementById('interview-start').disabled = false;
    });
    trackPicker.appendChild(pill);
  });

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]] = [a[j],a[i]];
    }
    return a;
  }

  document.getElementById('interview-start').addEventListener('click', () => {
    if(!interviewState) return;
    if(interviewMode === 'phone'){
      showIncomingPhoneCall(interviewState.track);
      return;
    }
    document.getElementById('interview-picker-card').style.display = 'none';
    document.getElementById('interview-session').style.display = 'block';
    document.getElementById('interview-summary').style.display = 'none';
    renderInterviewQuestion();
  });

  function renderInterviewQuestion(){
    const s = interviewState;
    document.getElementById('q-counter').textContent = `Question ${s.index+1} of ${s.questions.length} — ${s.track}`;
    document.getElementById('q-text').textContent = s.questions[s.index];
    document.getElementById('q-answer').value = '';
    document.getElementById('q-feedback').style.display = 'none';
    document.getElementById('q-submit').style.display = 'inline-block';
    document.getElementById('q-next').style.display = 'none';
  }

  function analyzeAnswer(text){
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    // Word-boundary based filler detection with counts, so words that merely
    // *contain* a filler as a substring (e.g. "resume", "summary", "number"
    // all contain "um") are never mistaken for the filler itself.
    const fillerPatterns = [
      { label:'um', re:/\bum\b/gi },
      { label:'uh', re:/\buh\b/gi },
      { label:'you know', re:/\byou know\b/gi },
      { label:'kind of', re:/\bkind of\b/gi },
      { label:'sort of', re:/\bsort of\b/gi },
      { label:'basically', re:/\bbasically\b/gi },
      { label:'actually', re:/\bactually\b/gi },
      { label:'I mean', re:/\bi mean\b/gi }
    ];
    let fillerCount = 0;
    const fillerFound = [];
    fillerPatterns.forEach(f => {
      const m = text.match(f.re);
      if(m){ fillerCount += m.length; fillerFound.push(f.label); }
    });

    const hasFirstPerson = /\bi\b/i.test(text);

    // STAR-method cue: look for a past-tense action verb AND a result/outcome
    // signal (a number, or an explicit outcome phrase) rather than any single
    // loosely-related word, since one keyword alone is a weak signal on its own.
    const actionCue = /\b(led|built|created|organized|developed|managed|designed|implemented|resolved|coordinated|completed|solved)\b/i.test(text);
    const resultCue = /\d/.test(text) || /\b(result(ed|s)?|as a result|which led to|so that|because of this|outcome)\b/i.test(text);
    const hasStarCue = actionCue && resultCue;

    const lengthOk = wordCount >= 15 && wordCount <= 180;
    const fillerOk = fillerCount < 2;

    const notes = [];
    if(wordCount < 8){ notes.push('This answer is very short — an interviewer will likely follow up asking you to elaborate. Add a specific situation, what you did, and the outcome.'); }
    else if(wordCount < 15){ notes.push('Your answer is a bit short — try adding a specific example or outcome to give it more substance.'); }
    else if(wordCount > 220){ notes.push('This is quite long for a spoken answer — aim to trim it down to your most relevant 2–3 points so it doesn\'t lose the interviewer.'); }
    else if(wordCount > 180){ notes.push('This is a little on the long side — see if you can tighten it slightly.'); }
    else{ notes.push('Good length for a spoken interview answer.'); }

    // Only flag filler words once there's a real pattern (2+ total), so a
    // single incidental "actually" doesn't get treated as a speech habit.
    if(fillerCount >= 4){ notes.push(`Filler words came up often: "${[...new Set(fillerFound)].join('", "')}" (${fillerCount} times). Try recording yourself once — it's usually the fastest way to notice the habit.`); }
    else if(!fillerOk){ notes.push(`A couple of filler words showed up: "${[...new Set(fillerFound)].join('", "')}". A short pause reads as confidence — a filler word often reads as hesitation.`); }
    if(!hasFirstPerson){ notes.push('Make sure to speak from your own experience — use "I" statements.'); }
    if(!hasStarCue){
      if(actionCue && !resultCue){ notes.push('You describe a clear action, but try adding the outcome — what changed because of it? A number or concrete result makes this stronger.'); }
      else if(resultCue && !actionCue){ notes.push('You mention an outcome, but it\'s not clear what specific action led to it — name the concrete step you took.'); }
      else{ notes.push('Try structuring with the STAR method: Situation, Task, Action, and a specific Result.'); }
    } else{ notes.push('Nice — your answer shows a clear action and a specific result.'); }

    // A simple 4-point rubric so a student can see, at a glance, exactly which
    // concrete criteria this answer met — this is what the session summary
    // uses to tell them whether they're ready or need more practice.
    const criteriaMet = [lengthOk, fillerOk, hasFirstPerson, hasStarCue].filter(Boolean).length;

    // A genuine, specific pat on the back when every criterion is met — not
    // just silence where a criticism would have gone.
    if(criteriaMet === 4){ notes.unshift('🎉 Great answer — clear, well-structured, and to the point. This is exactly the kind of response to aim for.'); }

    return { notes, wordCount, lengthOk, fillerOk, fillerCount, hasFirstPerson, hasStarCue, actionCue, resultCue, criteriaMet, totalCriteria: 4 };
  }

  // Shared by both the standard and phone interview summaries so the
  // "what to work on" logic lives in exactly one place.
  function summarizeAnswerGaps(answers){
    const gapCounts = {
      'answer length': answers.filter(a => !a.lengthOk).length,
      'filler words': answers.filter(a => !a.fillerOk).length,
      'speaking in first person': answers.filter(a => !a.hasFirstPerson).length,
      'STAR structure (action + result)': answers.filter(a => !a.hasStarCue).length
    };
    const topGap = Object.keys(gapCounts).reduce((a,b) => gapCounts[a] >= gapCounts[b] ? a : b);
    return { gapCounts, topGap };
  }
  const GAP_TIPS = {
    'answer length': 'Aim for a focused 15–180 word spoken answer — enough detail without losing the interviewer.',
    'filler words': 'Cut back on filler words like "um" or "actually" — a short pause reads as more confident than a filler word.',
    'speaking in first person': 'Speak from your own experience and use "I" statements throughout.',
    'STAR structure (action + result)': 'Structure answers with the STAR method: Situation, Task, Action, and a specific Result.'
  };

  document.getElementById('q-submit').addEventListener('click', () => {
    const text = document.getElementById('q-answer').value;
    if(!text.trim()){ showToast('Isulat muna ang sagot mo.', 'error'); return; }
    const analysis = analyzeAnswer(text);
    interviewState.answers.push({ question: interviewState.questions[interviewState.index], answer:text, ...analysis });
    const fb = document.getElementById('q-feedback');
    fb.innerHTML = `<strong>Feedback (${analysis.criteriaMet}/${analysis.totalCriteria} criteria met):</strong><ul>` + analysis.notes.map(n => `<li>${n}</li>`).join('') + '</ul>';
    fb.style.display = 'block';
    document.getElementById('q-submit').style.display = 'none';
    document.getElementById('q-next').style.display = 'inline-block';
    document.getElementById('q-next').textContent = interviewState.index < interviewState.questions.length - 1 ? 'Next question →' : 'See session summary →';
  });

  document.getElementById('q-next').addEventListener('click', () => {
    interviewState.index++;
    if(interviewState.index >= interviewState.questions.length){
      finishInterview();
    } else {
      renderInterviewQuestion();
    }
  });

  function finishInterview(){
    document.getElementById('interview-session').style.display = 'none';
    document.getElementById('interview-summary').style.display = 'block';

    const answers = interviewState.answers;
    const totalPossible = answers.length * 4;
    const totalMet = answers.reduce((sum,a) => sum + a.criteriaMet, 0);
    const overallPct = Math.round((totalMet / totalPossible) * 100);

    let verdict, verdictNote;
    if(overallPct < 50){ verdict = 'Needs More Practice'; verdictNote = 'A few more practice rounds will help before a real interview — focus on the specific points below.'; }
    else if(overallPct < 75){ verdict = 'Getting There'; verdictNote = 'You\'re on the right track. Tighten up the specific points below and you\'ll be in good shape.'; }
    else if(overallPct < 100){ verdict = 'Interview-Ready'; verdictNote = '🎉 Congratulations — solid, consistent performance across your answers. Keep this up under real interview pressure.'; }
    else { verdict = 'Interview-Ready'; verdictNote = '🎉 Congratulations! A perfect score across every answer — clear structure, good length, and no filler habits to fix. This is genuinely ready for a real interview.'; }

    // Figure out which single criterion was the most common gap across the
    // session, so the student gets one clear, prioritized thing to work on
    // instead of a wall of repeated notes.
    const { gapCounts, topGap } = summarizeAnswerGaps(answers);

    document.getElementById('interview-ring').innerHTML = progressRing(overallPct, { color: overallPct >= 75 ? 'var(--teal)' : 'var(--gold)' });
    document.getElementById('interview-summary').querySelector('h3').textContent = `Session Summary — ${verdict}`;
    let verdictBox = document.getElementById('interview-verdict-note');
    if(!verdictBox){
      verdictBox = document.createElement('p');
      verdictBox.id = 'interview-verdict-note';
      verdictBox.style.color = 'var(--ink-soft)';
      verdictBox.style.marginBottom = '18px';
      document.getElementById('interview-summary').querySelector('h3').insertAdjacentElement('afterend', verdictBox);
    }
    verdictBox.textContent = gapCounts[topGap] > 0
      ? `${verdictNote} Across this session, "${topGap}" came up most often (${gapCounts[topGap]} of ${answers.length} answers) — that's the best place to focus next.`
      : verdictNote;

    const rows = document.getElementById('summary-rows');
    rows.innerHTML = answers.map((a,i) => `
      <div class="summary-q-card">
        <div class="summary-q-head">
          <span>Q${i+1}: ${a.question}</span>
          <span class="score-pill">${a.criteriaMet}/${a.totalCriteria} · ${a.wordCount} words</span>
        </div>
        <ul class="summary-q-notes">${a.notes.map(n => `<li>${n}</li>`).join('')}</ul>
      </div>
    `).join('');
    const history = load('dctp_interview_history', []);
    history.push({ track: interviewState.track, date: new Date().toISOString(), questionCount: interviewState.answers.length, overallPct });
    save('dctp_interview_history', history);
    renderInterviewHistorySidebar();
  }

  document.getElementById('interview-restart').addEventListener('click', () => {
    document.getElementById('interview-summary').style.display = 'none';
    document.getElementById('interview-picker-card').style.display = 'block';
    document.querySelectorAll('.track-pill').forEach(p => p.classList.remove('active'));
    document.getElementById('interview-start').disabled = true;
    interviewState = null;
  });

  /* ================= PHONE INTERVIEW SIMULATOR =================
     An additional Mock Interview mode. It keeps the same question tracks,
     answer rubric, and history store so existing interview analytics continue
     to work without a separate navigation item or data model. */
  const PHONE_RECRUITERS = {
    'IT / Programming': { company:'BrightPath Technologies', recruiter:'Maya Santos · Technical Recruiter' },
    'Business / Office': { company:'Northstar Partners', recruiter:'Ethan Cruz · Talent Acquisition' },
    'Customer Service': { company:'CareLink Services', recruiter:'Alyssa Reyes · Recruitment Specialist' },
    'Engineering': { company:'Apex Engineering Group', recruiter:'Noah Lim · People Operations' },
    'General': { company:'FutureWorks', recruiter:'Jamie Lee · Talent Acquisition' }
  };

  const PHONE_SILENCE_MS = 2800;      // pause length that counts as "finished speaking"
  const PHONE_ADVANCE_DELAY_MS = 4200; // time the feedback stays up before auto-advancing
  const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
  const speechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  function formatCallTime(seconds){
    const mins = Math.floor(seconds / 60);
    return String(mins).padStart(2,'0') + ':' + String(seconds % 60).padStart(2,'0');
  }

  // Recruiter "voice" — reads every question aloud so the user never has to
  // read it themselves. Falls back silently (straight to listening) if the
  // browser has no SpeechSynthesis support.
  function speakPhoneLine(text, onDone){
    if(!speechSupported){ onDone && onDone(); return; }
    try { window.speechSynthesis.cancel(); } catch(e) {}
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.98; utter.lang = 'en-US';
    utter.onend = () => onDone && onDone();
    utter.onerror = () => onDone && onDone();
    setPhoneMicStatus('speaking');
    window.speechSynthesis.speak(utter);
  }

  function setPhoneMicStatus(state){
    const label = document.getElementById('phone-mic-state');
    const wave = document.getElementById('phone-waveform');
    const messages = {
      speaking: 'Recruiter is speaking…',
      listening: 'Listening — speak your answer, or type it below.',
      unsupported: 'Speech recognition isn\'t supported in this browser — type your response below.',
      denied: 'Microphone access was denied — type your response instead.',
      error: 'Microphone unavailable right now — type your response instead.',
      idle: 'Ready — type your response, or use the microphone.'
    };
    if(wave) wave.classList.toggle('active', state === 'listening' || state === 'speaking');
    if(label) label.textContent = messages[state] || messages.idle;
  }

  // Auto-listen after each spoken question. Silence for PHONE_SILENCE_MS once
  // speech has been detected is treated as "the user finished speaking" and
  // submits automatically; the mic button remains available to start/stop by
  // hand, and typing always still works as a fallback.
  function beginPhoneListening(){
    if(!phoneState) return;
    const micBtn = document.getElementById('phone-record');
    if(!SpeechRecognitionAPI){ setPhoneMicStatus('unsupported'); return; }
    stopPhoneListening();
    phoneRecognition = new SpeechRecognitionAPI();
    phoneRecognition.continuous = true;
    phoneRecognition.interimResults = true;
    phoneRecognition.lang = 'en-US';
    phoneSpeechDetected = false;
    phoneListenStartedAt = Date.now();
    phoneRecognition.onresult = event => {
      let transcript = '';
      for(let i = 0; i < event.results.length; i++) transcript += event.results[i][0].transcript + ' ';
      transcript = transcript.trim();
      if(!transcript) return;
      const transcriptEl = document.getElementById('phone-transcript');
      transcriptEl.textContent = 'Live transcript: ' + transcript;
      transcriptEl.style.display = 'block';
      document.getElementById('phone-answer').value = transcript;
      phoneSpeechDetected = true;
      resetPhoneSilenceTimer();
    };
    phoneRecognition.onerror = event => { setPhoneMicStatus(event.error === 'not-allowed' ? 'denied' : 'error'); };
    phoneRecognition.onend = () => {
      if(phoneListenStartedAt){ phoneSpeakingMs += Date.now() - phoneListenStartedAt; phoneListenStartedAt = null; }
      if(micBtn) micBtn.textContent = 'Start listening';
    };
    try {
      phoneRecognition.start();
      setPhoneMicStatus('listening');
      if(micBtn) micBtn.textContent = 'Stop listening';
    } catch(e) { setPhoneMicStatus('error'); }
  }
  function stopPhoneListening(){
    if(phoneSilenceTimer){ clearTimeout(phoneSilenceTimer); phoneSilenceTimer = null; }
    if(phoneRecognition){ try { phoneRecognition.stop(); } catch(e) {} phoneRecognition = null; }
  }
  function resetPhoneSilenceTimer(){
    if(phoneSilenceTimer) clearTimeout(phoneSilenceTimer);
    phoneSilenceTimer = setTimeout(() => { if(phoneState && phoneSpeechDetected) submitPhoneAnswer(); }, PHONE_SILENCE_MS);
  }

  // Ringtone, generated with the Web Audio API — no audio file, no external
  // service. Silently does nothing if Web Audio isn't available.
  function startRingtone(){
    try {
      phoneRingAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const ring = () => {
        if(!phoneRingAudioCtx) return;
        const ctx = phoneRingAudioCtx;
        [0, 0.35].forEach(offset => {
          const osc = ctx.createOscillator(); const gain = ctx.createGain();
          osc.type = 'sine'; osc.frequency.value = 440;
          gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + offset + 0.05);
          gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.3);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(ctx.currentTime + offset); osc.stop(ctx.currentTime + offset + 0.35);
        });
      };
      ring();
      phoneRingIntervalId = setInterval(ring, 2000);
    } catch(e) { /* Web Audio unsupported — the call still works silently */ }
  }
  function stopRingtone(){
    if(phoneRingIntervalId){ clearInterval(phoneRingIntervalId); phoneRingIntervalId = null; }
    if(phoneRingAudioCtx){ try { phoneRingAudioCtx.close(); } catch(e) {} phoneRingAudioCtx = null; }
  }

  function hidePhoneCards(){
    stopRingtone();
    stopPhoneListening();
    if(speechSupported){ try { window.speechSynthesis.cancel(); } catch(e) {} }
    if(phoneTimerId){ clearInterval(phoneTimerId); phoneTimerId = null; }
    if(phoneConnectTimeout){ clearTimeout(phoneConnectTimeout); phoneConnectTimeout = null; }
    if(phoneAutoAdvanceTimer){ clearTimeout(phoneAutoAdvanceTimer); phoneAutoAdvanceTimer = null; }
    ['phone-incoming-card','phone-connecting-card','phone-session','phone-summary'].forEach(id => document.getElementById(id).style.display = 'none');
  }
  function showIncomingPhoneCall(track){
    const caller = PHONE_RECRUITERS[track] || PHONE_RECRUITERS.General;
    hidePhoneCards();
    document.getElementById('interview-picker-card').style.display = 'none';
    document.getElementById('phone-company').textContent = caller.company;
    document.getElementById('phone-recruiter').textContent = caller.recruiter;
    document.getElementById('phone-role').textContent = 'Phone screening · ' + track;
    document.getElementById('phone-incoming-card').style.display = 'block';
    startRingtone();
  }
  function startPhoneInterview(){
    const track = interviewState && interviewState.track;
    if(!track) return;
    const caller = PHONE_RECRUITERS[track] || PHONE_RECRUITERS.General;
    phoneSpeakingMs = 0;
    phoneState = { track, caller, questions:shuffle(tracks[track]).slice(0,5), index:0, answers:[], startedAt:Date.now(), seconds:0 };
    document.getElementById('phone-session').style.display = 'block';
    document.getElementById('phone-summary').style.display = 'none';
    phoneTimerId = setInterval(() => {
      if(!phoneState) return;
      phoneState.seconds++;
      document.getElementById('phone-timer').textContent = formatCallTime(phoneState.seconds);
    }, 1000);
    renderPhoneQuestion(true);
  }
  function renderPhoneQuestion(withGreeting){
    stopPhoneListening();
    if(phoneAutoAdvanceTimer){ clearTimeout(phoneAutoAdvanceTimer); phoneAutoAdvanceTimer = null; }
    const s = phoneState;
    const question = s.questions[s.index];
    document.getElementById('phone-session-recruiter').textContent = s.caller.recruiter.split(' · ')[0];
    document.getElementById('phone-session-role').textContent = s.caller.company + ' · ' + s.track;
    document.getElementById('phone-question-counter').textContent = 'Question ' + (s.index + 1) + ' of ' + s.questions.length;
    document.getElementById('phone-progress-fill').style.width = ((s.index / s.questions.length) * 100) + '%';
    const spokenLine = (withGreeting ? 'Good day. Thank you for taking the time to speak with us about the ' + s.track + ' role. ' : '') + question;
    document.getElementById('phone-script').textContent = '“' + spokenLine + '”';
    document.getElementById('phone-answer').value = '';
    document.getElementById('phone-feedback').style.display = 'none';
    document.getElementById('phone-next').style.display = 'none';
    document.getElementById('phone-submit').style.display = 'inline-block';
    document.getElementById('phone-transcript').style.display = 'none';
    speakPhoneLine(spokenLine, () => { if(phoneState) beginPhoneListening(); });
  }
  function submitPhoneAnswer(){
    if(!phoneState) return;
    const text = document.getElementById('phone-answer').value.trim();
    if(!text){ showToast('Record or type a response before submitting.', 'error'); return; }
    stopPhoneListening();
    const analysis = analyzeAnswer(text);
    phoneState.answers.push({ question:phoneState.questions[phoneState.index], answer:text, ...analysis });
    setPhoneMicStatus('idle');
    const fb = document.getElementById('phone-feedback');
    fb.innerHTML = '<strong>Call feedback (' + analysis.criteriaMet + '/' + analysis.totalCriteria + ' criteria met):</strong><ul>' + analysis.notes.map(note => '<li>' + note + '</li>').join('') + '</ul>';
    fb.style.display = 'block';
    document.getElementById('phone-submit').style.display = 'none';
    const next = document.getElementById('phone-next'); next.style.display = 'inline-block';
    next.textContent = phoneState.index < phoneState.questions.length - 1 ? 'Next recruiter question →' : 'View call summary →';
    // Hands-free by default: move on after the feedback has had time to be
    // read, but the Next button (below) still lets the user skip the wait.
    if(phoneAutoAdvanceTimer) clearTimeout(phoneAutoAdvanceTimer);
    phoneAutoAdvanceTimer = setTimeout(() => { if(next.style.display !== 'none') next.click(); }, PHONE_ADVANCE_DELAY_MS);
  }
  function phoneConfidenceLevel(pct){
    if(pct >= 80) return { label:'High', color:'var(--teal)' };
    if(pct >= 55) return { label:'Medium', color:'var(--warning)' };
    return { label:'Building', color:'var(--danger)' };
  }
  function finishPhoneInterview(endedEarly){
    if(!phoneState) return;
    stopPhoneListening();
    if(speechSupported){ try { window.speechSynthesis.cancel(); } catch(e) {} }
    if(phoneTimerId){ clearInterval(phoneTimerId); phoneTimerId = null; }
    if(phoneAutoAdvanceTimer){ clearTimeout(phoneAutoAdvanceTimer); phoneAutoAdvanceTimer = null; }
    const answers = phoneState.answers;
    if(!answers.length){ hidePhoneCards(); document.getElementById('interview-picker-card').style.display = 'block'; showToast('The phone simulation ended before a response was submitted.', 'info'); return; }
    const totalMet = answers.reduce((sum, answer) => sum + answer.criteriaMet, 0);
    const overallPct = Math.round((totalMet / (answers.length * 4)) * 100);
    const duration = phoneState.seconds;
    const speakingSeconds = Math.round(phoneSpeakingMs / 1000);
    const confidence = phoneConfidenceLevel(overallPct);
    document.getElementById('phone-session').style.display = 'none';
    document.getElementById('phone-summary').style.display = 'block';
    document.getElementById('phone-summary-ring').innerHTML = progressRing(overallPct, { color:overallPct >= 75 ? 'var(--teal)' : 'var(--gold)' });
    document.getElementById('phone-summary-title').textContent = endedEarly ? 'Phone Call Summary · Ended Early' : 'Phone Interview Summary';
    document.getElementById('phone-summary-note').textContent = overallPct >= 75 ? 'Clear, structured answers. Keep practicing this calm, concise delivery.' : 'This practice identifies a few response habits to strengthen before a live recruiter call.';
    const confBadge = document.getElementById('phone-confidence-badge');
    confBadge.textContent = 'Confidence: ' + confidence.label;
    confBadge.style.background = confidence.color;
    const avgWords = Math.round(answers.reduce((sum, a) => sum + a.wordCount, 0) / answers.length);
    document.getElementById('phone-summary-stats').innerHTML = [
      { label:'Overall Performance', value:overallPct + '%' }, { label:'Call Duration', value:formatCallTime(duration) },
      { label:'Questions Answered', value:answers.length + ' / ' + phoneState.questions.length }, { label:'Speaking Time', value:formatCallTime(speakingSeconds) },
      { label:'Average Response', value:avgWords + ' words' }
    ].map(stat => '<div class="stat-card"><p class="label">' + stat.label + '</p><p class="value">' + stat.value + '</p></div>').join('');
    const { gapCounts } = summarizeAnswerGaps(answers);
    const topGaps = Object.entries(gapCounts).filter(([,count]) => count > 0).sort((a,b) => b[1]-a[1]).slice(0,2);
    document.getElementById('phone-summary-tips').innerHTML = topGaps.length
      ? topGaps.map(([gap]) => '<li>' + GAP_TIPS[gap] + '</li>').join('')
      : '<li>🎉 No major gaps this call — keep practicing to stay this sharp.</li>';
    document.getElementById('phone-summary-answers').innerHTML = answers.map((answer, index) => '<div class="summary-q-card"><div class="summary-q-head"><span>Q' + (index + 1) + ': ' + escapeHtml(answer.question) + '</span><span class="score-pill">' + answer.criteriaMet + '/' + answer.totalCriteria + '</span></div><ul class="summary-q-notes">' + answer.notes.map(note => '<li>' + note + '</li>').join('') + '</ul></div>').join('');
    const history = load('dctp_interview_history', []);
    history.push({ track:'Phone · ' + phoneState.track, mode:'phone', date:new Date().toISOString(), questionCount:answers.length, durationSeconds:duration, speakingSeconds, overallPct });
    save('dctp_interview_history', history);
    renderInterviewHistorySidebar();
    if(typeof renderDashboard === 'function') renderDashboard();
    phoneState = null;
  }
  document.getElementById('phone-accept').addEventListener('click', () => {
    stopRingtone();
    document.getElementById('phone-incoming-card').style.display = 'none';
    document.getElementById('phone-connecting-label').textContent = 'Dialing ' + (interviewState ? interviewState.track : '') + '…';
    document.getElementById('phone-connecting-card').style.display = 'block';
    phoneConnectTimeout = setTimeout(() => {
      document.getElementById('phone-connecting-card').style.display = 'none';
      startPhoneInterview();
    }, 1400);
  });
  document.getElementById('phone-decline').addEventListener('click', () => { hidePhoneCards(); document.getElementById('interview-picker-card').style.display = 'block'; showToast('Phone interview declined. You can start another simulation when ready.', 'info'); });
  document.getElementById('phone-record').addEventListener('click', () => {
    if(phoneRecognition){ stopPhoneListening(); setPhoneMicStatus('idle'); }
    else beginPhoneListening();
  });
  document.getElementById('phone-submit').addEventListener('click', submitPhoneAnswer);
  document.getElementById('phone-next').addEventListener('click', () => {
    if(phoneAutoAdvanceTimer){ clearTimeout(phoneAutoAdvanceTimer); phoneAutoAdvanceTimer = null; }
    phoneState.index++;
    if(phoneState.index >= phoneState.questions.length) finishPhoneInterview(false); else renderPhoneQuestion(false);
  });
  document.getElementById('phone-end').addEventListener('click', () => finishPhoneInterview(true));
  document.getElementById('phone-practice-again').addEventListener('click', () => { document.getElementById('phone-summary').style.display = 'none'; document.getElementById('interview-picker-card').style.display = 'block'; });
  document.getElementById('phone-back-standard').addEventListener('click', () => { document.getElementById('phone-summary').style.display = 'none'; document.getElementById('interview-picker-card').style.display = 'block'; document.querySelector('[data-interview-mode="standard"]').click(); });

  /* ================= SHARED HELPERS ================= */
  function escapeHtml(str){
    return (str||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function escapeAttr(str){ return escapeHtml(str); }

  /* ================= RESUME CHECKER ================= */
  let checkerFile = null;
  let checkerText = '';
  let checkerFileType = null;
  let checkerStructuralInfo = null;

  const checkerFileInput = document.getElementById('checker-file');
  const uploadBox = document.getElementById('upload-box');

  ['dragover','dragenter'].forEach(evt => uploadBox.addEventListener(evt, e => { e.preventDefault(); uploadBox.classList.add('drag'); }));
  ['dragleave','drop'].forEach(evt => uploadBox.addEventListener(evt, e => { e.preventDefault(); uploadBox.classList.remove('drag'); }));
  uploadBox.addEventListener('drop', e => {
    if(e.dataTransfer.files && e.dataTransfer.files[0]){
      checkerFileInput.files = e.dataTransfer.files;
      handleCheckerFile(e.dataTransfer.files[0]);
    }
  });
  checkerFileInput.addEventListener('change', () => {
    if(checkerFileInput.files[0]) handleCheckerFile(checkerFileInput.files[0]);
  });

  function handleCheckerFile(file){
    const name = file.name.toLowerCase();
    const isPdf = name.endsWith('.pdf');
    const isDocx = name.endsWith('.docx');
    const status = document.getElementById('checker-status');
    status.classList.remove('status-loading');
    document.getElementById('checker-analyze').disabled = true;
    document.getElementById('extracted-text-box').style.display = 'none';
    document.getElementById('checker-results').style.display = 'none';

    if(!isPdf && !isDocx){
      status.textContent = name.endsWith('.doc')
        ? 'Old .doc format isn\'t supported yet — please save/export it as .docx or PDF and try again.'
        : 'Unsupported file type. Please upload a PDF or .docx file.';
      checkerFile = null;
      return;
    }

    checkerFile = file;
    const chipHolder = document.getElementById('file-chip-holder');
    chipHolder.innerHTML = `<span class="file-chip">${escapeHtml(file.name)} <button type="button" id="chip-remove">✕</button></span>`;
    document.getElementById('chip-remove').addEventListener('click', () => {
      checkerFile = null; checkerText = ''; checkerFileType = null; checkerStructuralInfo = null;
      chipHolder.innerHTML = '';
      status.textContent = '';
      document.getElementById('checker-analyze').disabled = true;
      document.getElementById('extracted-text-box').style.display = 'none';
      checkerFileInput.value = '';
    });

    status.textContent = 'Reading file...';
    status.classList.add('status-loading');
    const reader = new FileReader();
    reader.onload = async function(e){
      try{
        if(isPdf){
          if(!window.pdfjsLib){ throw new Error('PDF reader library did not load.'); }
          checkerFileType = 'pdf';
          checkerStructuralInfo = await extractPdfInfo(e.target.result);
          checkerText = checkerStructuralInfo.text;
        } else {
          if(!window.mammoth){ throw new Error('Word document reader library did not load.'); }
          checkerFileType = 'docx';
          checkerStructuralInfo = await extractDocxInfo(e.target.result);
          checkerText = checkerStructuralInfo.text;
        }
        status.classList.remove('status-loading');
        if(!checkerText || !checkerText.trim()){
          status.textContent = 'Could not find readable text in this file. If it\'s a scanned image-based PDF, this checker can\'t read it yet.';
          document.getElementById('checker-analyze').disabled = true;
          return;
        }
        status.textContent = 'File read successfully. Ready to check.';
        document.getElementById('checker-analyze').disabled = false;
        document.getElementById('extracted-text-box').style.display = 'block';
        document.getElementById('extracted-text').textContent = checkerText.trim();
      } catch(err){
        console.error(err);
        status.classList.remove('status-loading');
        status.textContent = 'Something went wrong reading this file: ' + err.message;
        document.getElementById('checker-analyze').disabled = true;
      }
    };
    reader.onerror = function(){ status.classList.remove('status-loading'); status.textContent = 'Could not read this file. Please try again.'; };
    reader.readAsArrayBuffer(checkerFile);
  }

  // Reads a PDF and also gathers ATS-relevant structural signals:
  // multi-column layout (via left/right line-start clustering) and embedded images.
  async function extractPdfInfo(arrayBuffer){
    const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = '';
    let totalLines = 0, leftStarts = 0, rightStarts = 0;
    let imageRisk = false;
    for(let i=1; i<=pdf.numPages; i++){
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const content = await page.getTextContent();
      let lineStartNext = true;
      content.items.forEach(item => {
        if(item.str && item.str.trim().length > 0){
          if(lineStartNext){
            totalLines++;
            const x = item.transform[4];
            if(x < viewport.width / 2) leftStarts++; else rightStarts++;
            lineStartNext = false;
          }
        }
        text += item.str + (item.hasEOL ? '\n' : ' ');
        if(item.hasEOL) lineStartNext = true;
      });
      try{
        const opList = await page.getOperatorList();
        if(opList.fnArray.includes(window.pdfjsLib.OPS.paintImageXObject) || opList.fnArray.includes(window.pdfjsLib.OPS.paintJpegXObject)){
          imageRisk = true;
        }
      }catch(err){ /* image detection best-effort only */ }
    }
    const columnRisk = totalLines > 10 && (leftStarts / totalLines > 0.2) && (rightStarts / totalLines > 0.2);
    return { text, numPages: pdf.numPages, columnRisk, imageRisk, totalLines };
  }

  // Reads a DOCX and also gathers ATS-relevant structural signals: tables and embedded images.
  async function extractDocxInfo(arrayBuffer){
    const rawResult = await window.mammoth.extractRawText({ arrayBuffer: arrayBuffer.slice(0) });
    const htmlResult = await window.mammoth.convertToHtml({ arrayBuffer: arrayBuffer.slice(0) });
    const html = htmlResult.value || '';
    const tableCount = (html.match(/<table/gi) || []).length;
    const imageCount = (html.match(/<img/gi) || []).length;
    return { text: rawResult.value, tableCount, imageCount };
  }

  const strongVerbs = ['developed','led','designed','implemented','created','managed','achieved','improved','built','organized','analyzed','collaborated','coordinated','increased','reduced','delivered','launched','initiated','streamlined','optimized','trained','mentored','presented','resolved','automated','maintained','supervised','conducted','facilitated','assisted','supported'];
  const weakPhrases = ['responsible for','duties included','worked on','helped with','in charge of','tasked with','was asked to'];

  function computeAtsScore(fileType, structuralInfo, sectionsFound, wordCount){
    let score = 100;
    const notes = [];
    if(fileType === 'pdf' && structuralInfo){
      if(structuralInfo.imageRisk){
        score -= 35;
        notes.push({ type:'bad', text:'This PDF contains embedded image content. If any resume text (your name, contact details, or skills) is part of an image rather than real text, ATS systems will not be able to read it at all.' });
      }
      if(structuralInfo.columnRisk){
        score -= 35;
        notes.push({ type:'bad', text:'This resume appears to use a multi-column layout. Most ATS systems read strictly left-to-right, top-to-bottom — multi-column resumes are often scrambled or partially skipped during parsing.' });
      }
      if(!structuralInfo.imageRisk && !structuralInfo.columnRisk){
        notes.push({ type:'ok', text:'No embedded images or multi-column layout detected in this PDF — this is a good sign for ATS parsing.' });
      }
    } else if(fileType === 'docx' && structuralInfo){
      if(structuralInfo.tableCount > 0){
        score -= 35;
        notes.push({ type:'bad', text:`Found ${structuralInfo.tableCount} table(s) in this document. Tables are one of the most common reasons resumes get misread or scrambled by ATS software — rebuild this content using plain paragraphs and bullet points instead.` });
      }
      if(structuralInfo.imageCount > 0){
        score -= 20;
        notes.push({ type:'warn', text:`Found ${structuralInfo.imageCount} embedded image(s). If any of your text is inside an image (like a designed header), ATS software can't read it.` });
      }
      if(structuralInfo.tableCount === 0 && structuralInfo.imageCount === 0){
        notes.push({ type:'ok', text:'No tables or embedded images detected — a good, ATS-friendly document structure.' });
      }
    }
    if(wordCount > 250 && sectionsFound.length <= 1){
      score -= 20;
      notes.push({ type:'warn', text:'This resume has substantial content but very few standard section headers were detected (e.g. "Experience," "Education," "Skills"). If you\'re using creative or unconventional headers, ATS systems may fail to categorize your information correctly.' });
    }
    score = Math.max(0, Math.min(100, score));
    return { score, notes };
  }

  function analyzeResumeText(text, fileType, structuralInfo){
    const words = text.trim().split(/\s+/).filter(Boolean);
    const wordCount = words.length;

    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?63[-.\s]?9\d{2}|09\d{2})[-.\s]?\d{3}[-.\s]?\d{4}/) || text.match(/\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);

    const sectionPatterns = {
      'Summary / Objective': /\b(summary|objective|profile|about me)\b/i,
      'Education': /\beducation\b/i,
      'Experience': /\b(experience|employment|work history|internship|on-the-job training|ojt)\b/i,
      'Skills': /\bskills\b/i,
      'Projects': /\bprojects?\b/i
    };
    const sectionsFound = [], sectionsMissing = [];
    Object.keys(sectionPatterns).forEach(name => {
      (sectionPatterns[name].test(text) ? sectionsFound : sectionsMissing).push(name);
    });

    let verbHits = [];
    strongVerbs.forEach(v => {
      // Short verbs (e.g. "led") get an exact word-boundary match only —
      // allowing a trailing \w* on a 3-letter root would also match unrelated
      // words like "ledger" or "ledge".
      const pattern = v.length <= 3 ? ('\\b'+v+'\\b') : ('\\b'+v+'\\w*\\b');
      const m = text.match(new RegExp(pattern,'gi'));
      if(m) verbHits = verbHits.concat(m);
    });
    let weakHits = [];
    weakPhrases.forEach(p => {
      const m = text.match(new RegExp(p,'gi'));
      if(m) weakHits = weakHits.concat(m);
    });

    const numberMatches = text.match(/\b\d+(\.\d+)?%|(₱|php|\$)\s?\d[\d,]*|\b\d{2,}\+?\b/gi) || [];
    const allCapsWords = (text.match(/\b[A-Z]{4,}\b/g) || []);
    const firstPersonCount = (text.match(/\bI\b/g) || []).length;

    // ---- scoring ----
    let contactScore = 0;
    if(emailMatch) contactScore += 50;
    if(phoneMatch) contactScore += 50;

    const sectionScore = Math.round((sectionsFound.length / Object.keys(sectionPatterns).length) * 100);

    let lengthScore;
    if(wordCount < 120) lengthScore = 35;
    else if(wordCount < 250) lengthScore = 70;
    else if(wordCount <= 750) lengthScore = 100;
    else if(wordCount <= 1000) lengthScore = 70;
    else lengthScore = 45;

    let verbScore = Math.min(100, Math.round((verbHits.length / 8) * 100));
    verbScore = Math.max(0, verbScore - weakHits.length * 10);

    const quantScore = Math.min(100, Math.round((numberMatches.length / 5) * 100));

    let formatScore = 100;
    if(allCapsWords.length > 5) formatScore -= 20;
    if(firstPersonCount > 5) formatScore -= 20;
    formatScore = Math.max(0, formatScore);

    const atsResult = computeAtsScore(fileType, structuralInfo, sectionsFound, wordCount);

    const categories = {
      ats: atsResult.score, contact: contactScore, sections: sectionScore, length: lengthScore,
      actionVerbs: verbScore, quantifiable: quantScore, formatting: formatScore
    };
    // ATS compliance is weighted double since it's the priority check — a resume
    // that a machine can't read at all matters more than any single softer signal.
    const weightedSum = atsResult.score * 2 + contactScore + sectionScore + lengthScore + verbScore + quantScore + formatScore;
    const overall = Math.round(weightedSum / 8);

    return {
      categories, overall, wordCount, emailMatch: !!emailMatch, phoneMatch: !!phoneMatch,
      sectionsFound, sectionsMissing, verbHits, weakHits, numberMatches, allCapsWords, firstPersonCount,
      atsNotes: atsResult.notes
    };
  }

  document.getElementById('checker-analyze').addEventListener('click', () => {
    if(!checkerText) return;
    const analysis = analyzeResumeText(checkerText, checkerFileType, checkerStructuralInfo);
    renderCheckerResults(analysis);
  });

  function renderCheckerResults(a){
    const resultsCard = document.getElementById('checker-results');
    resultsCard.style.display = 'block';

    let level;
    if(a.overall < 50) level = 'Needs Work';
    else if(a.overall < 70) level = 'Getting There';
    else if(a.overall < 85) level = 'Solid Draft';
    else level = 'Strong Resume';
    document.getElementById('checker-ring').innerHTML = progressRing(a.overall, { color: 'var(--gold)' });
    document.getElementById('checker-level').textContent = level;
    document.getElementById('checker-overall-summary').textContent = 'ATS Format Compliance is weighted as the top priority — a resume a machine can\'t read never reaches a human. This is an automated, rule-based check, not a guarantee of getting hired; use it as a starting point, then have a person review it too.';
    save('dctp_checker_result', { overall: a.overall, level, date: new Date().toISOString() });
    renderDashboard();

    const barLabels = { ats:'ATS Format Compliance', contact:'Contact Info', sections:'Section Completeness', length:'Length', actionVerbs:'Action Verbs', quantifiable:'Quantifiable Results', formatting:'Formatting' };
    document.getElementById('checker-bars').innerHTML = Object.keys(a.categories).map(k => `
      <div class="bar-row">
        <div class="bar-label"><span>${barLabels[k]}${k==='ats' ? ' ⭑ priority' : ''}</span><span>${a.categories[k]}%</span></div>
        <div class="bar-track"><div class="bar-fill" style="width:${a.categories[k]}%; ${k==='ats' ? 'background:var(--gold);' : ''}"></div></div>
      </div>
    `).join('');

    const findings = document.getElementById('checker-findings');
    const f = [];

    const markFor = t => t === 'ok' ? 'mark-ok' : (t === 'bad' ? 'mark-bad' : 'mark-warn');
    const iconFor = t => t === 'ok' ? '✓' : (t === 'bad' ? '✗' : '!');
    f.push(`<div class="finding-group"><h4>ATS Format Compliance (Priority)</h4>
      ${a.atsNotes.map(n => `<div class="finding"><span class="${markFor(n.type)}">${iconFor(n.type)}</span><span>${n.text}</span></div>`).join('')}
    </div>`);

    f.push(`<div class="finding-group"><h4>Contact Information</h4>
      <div class="finding"><span class="${a.emailMatch?'mark-ok':'mark-bad'}">${a.emailMatch?'✓':'✗'}</span><span>${a.emailMatch ? 'Email address found.' : 'No email address detected — make sure it\'s typed clearly near the top.'}</span></div>
      <div class="finding"><span class="${a.phoneMatch?'mark-ok':'mark-bad'}">${a.phoneMatch?'✓':'✗'}</span><span>${a.phoneMatch ? 'Phone number found.' : 'No phone number detected — add one so employers can reach you.'}</span></div>
    </div>`);

    f.push(`<div class="finding-group"><h4>Sections</h4>
      ${a.sectionsFound.map(s => `<div class="finding"><span class="mark-ok">✓</span><span>${s} section detected.</span></div>`).join('')}
      ${a.sectionsMissing.map(s => `<div class="finding"><span class="mark-warn">!</span><span>No clear ${s} section found — consider adding one if it applies to you.</span></div>`).join('')}
    </div>`);

    f.push(`<div class="finding-group"><h4>Length</h4>
      <div class="finding"><span class="${a.categories.length>=70?'mark-ok':'mark-warn'}">${a.categories.length>=70?'✓':'!'}</span>
      <span>${a.wordCount} words. ${a.wordCount < 250 ? 'This may be too short — add more specific detail about your experience and skills.' : a.wordCount > 1000 ? 'This is quite long — for an entry-level resume, aim to trim to one page (roughly 400–700 words).' : 'This is a reasonable length for an entry-level resume.'}</span></div>
    </div>`);

    f.push(`<div class="finding-group"><h4>Action Verbs</h4>
      <div class="finding"><span class="${a.verbHits.length>=6?'mark-ok':'mark-warn'}">${a.verbHits.length>=6?'✓':'!'}</span>
      <span>${a.verbHits.length} strong action verb${a.verbHits.length===1?'':'s'} found${a.verbHits.length ? ' (e.g. "' + [...new Set(a.verbHits.map(v=>v.toLowerCase()))].slice(0,5).join('", "') + '").' : '.'} ${a.verbHits.length < 6 ? 'Try starting more bullet points with verbs like "led," "developed," or "organized."' : 'Good use of active, specific language.'}</span></div>
      ${a.weakHits.length ? `<div class="finding"><span class="mark-warn">!</span><span>Found weaker phrasing: "${[...new Set(a.weakHits.map(w=>w.toLowerCase()))].join('", "')}". Try replacing with a specific action and result instead.</span></div>` : ''}
    </div>`);

    f.push(`<div class="finding-group"><h4>Quantifiable Results</h4>
      <div class="finding"><span class="${a.numberMatches.length>=3?'mark-ok':'mark-warn'}">${a.numberMatches.length>=3?'✓':'!'}</span>
      <span>${a.numberMatches.length} number${a.numberMatches.length===1?'':'s'}/metric${a.numberMatches.length===1?'':'s'} found. ${a.numberMatches.length < 3 ? 'Try adding measurable results — e.g. "organized an event for 50+ students" or "improved response time by 20%."' : 'Good — specific numbers make your impact easier to picture.'}</span></div>
    </div>`);

    f.push(`<div class="finding-group"><h4>Formatting</h4>
      <div class="finding"><span class="${a.allCapsWords.length<=5?'mark-ok':'mark-warn'}">${a.allCapsWords.length<=5?'✓':'!'}</span><span>${a.allCapsWords.length} ALL-CAPS word${a.allCapsWords.length===1?'':'s'} found. ${a.allCapsWords.length>5 ? 'Excessive capitalization can look like shouting — reserve it for section headers only.' : 'Capitalization looks controlled.'}</span></div>
      <div class="finding"><span class="${a.firstPersonCount<=5?'mark-ok':'mark-warn'}">${a.firstPersonCount<=5?'✓':'!'}</span><span>The word "I" appears ${a.firstPersonCount} time${a.firstPersonCount===1?'':'s'}. ${a.firstPersonCount>5 ? 'Most resumes drop personal pronouns — try "Led a team of 5" instead of "I led a team of 5."' : 'Good — this reads like a resume, not a first-person narrative.'}</span></div>
    </div>`);

    findings.innerHTML = f.join('');
  }

  document.getElementById('checker-reset').addEventListener('click', () => {
    checkerFile = null; checkerText = ''; checkerFileType = null; checkerStructuralInfo = null;
    document.getElementById('file-chip-holder').innerHTML = '';
    document.getElementById('checker-status').textContent = '';
    document.getElementById('checker-analyze').disabled = true;
    document.getElementById('extracted-text-box').style.display = 'none';
    document.getElementById('checker-results').style.display = 'none';
    checkerFileInput.value = '';
  });

  /* ================= JOB APPLICATION TRACKER ================= */
  const statusOptions = [
    { value:'applied', label:'Applied', cls:'st-applied' },
    { value:'interview', label:'Interview', cls:'st-interview' },
    { value:'offer', label:'Offer', cls:'st-offer' },
    { value:'noresponse', label:'No Response', cls:'st-noresponse' },
    { value:'rejected', label:'Rejected', cls:'st-rejected' }
  ];
  let jobApplications = load('dctp_job_tracker', []);

  function addApplication(data){
    const id = 'app_' + Date.now() + Math.random().toString(36).slice(2,6);
    jobApplications.push(data || { id, company:'', position:'', status:'', date:'', notes:'' });
    saveApplications();
    renderTrackerTable();
  }

  function saveApplications(){
    save('dctp_job_tracker', jobApplications);
    renderTrackerStats();
    renderDashboard();
    renderTrackerInsights();
  }

  function renderTrackerTable(){
    const tbody = document.getElementById('tracker-rows');
    tbody.innerHTML = jobApplications.map(app => `
      <tr data-id="${app.id}">
        <td><input type="text" class="app-company" value="${escapeAttr(app.company)}" placeholder="Company name"></td>
        <td><input type="text" class="app-position" value="${escapeAttr(app.position)}" placeholder="Role"></td>
        <td>
          <select class="app-status status-select ${statusOptions.find(s=>s.value===app.status)?.cls||''}">
            <option value="" ${!app.status ? 'selected' : ''}>Select status...</option>
            ${statusOptions.map(s => `<option value="${s.value}" ${s.value===app.status?'selected':''}>${s.label}</option>`).join('')}
          </select>
        </td>
        <td><input type="date" class="app-date" value="${app.date||''}"></td>
        <td><input type="text" class="app-notes" value="${escapeAttr(app.notes)}" placeholder="Notes"></td>
        <td><button type="button" class="remove-app" title="Remove">✕</button></td>
      </tr>
    `).join('');

    tbody.querySelectorAll('tr').forEach(row => {
      const id = row.dataset.id;
      const app = jobApplications.find(a => a.id === id);
      row.querySelector('.app-company').addEventListener('input', e => { app.company = e.target.value; saveApplications(); });
      row.querySelector('.app-position').addEventListener('input', e => { app.position = e.target.value; saveApplications(); });
      row.querySelector('.app-date').addEventListener('input', e => { app.date = e.target.value; saveApplications(); });
      row.querySelector('.app-notes').addEventListener('input', e => { app.notes = e.target.value; saveApplications(); });
      const statusSelect = row.querySelector('.app-status');
      statusSelect.addEventListener('change', e => {
        app.status = e.target.value;
        statusOptions.forEach(s => statusSelect.classList.remove(s.cls));
        const newCls = statusOptions.find(s=>s.value===app.status)?.cls;
        if(newCls) statusSelect.classList.add(newCls);
        saveApplications();
      });
      row.querySelector('.remove-app').addEventListener('click', () => {
        jobApplications = jobApplications.filter(a => a.id !== id);
        saveApplications();
        renderTrackerTable();
      });
    });
  }

  function renderTrackerStats(){
    const el = document.getElementById('tracker-stats');
    if(!el) return;
    const total = jobApplications.length;
    const interviews = jobApplications.filter(a => a.status === 'interview').length;
    const offers = jobApplications.filter(a => a.status === 'offer').length;
    const noResponse = jobApplications.filter(a => a.status === 'noresponse').length;
    const responseRate = total > 0 ? Math.round(((total - noResponse) / total) * 100) : 0;

    const cards = [
      { label:'Total Applications', value: total, sub: total ? 'Companies you\'ve applied to' : 'Add your first application below' },
      { label:'Interviews', value: interviews, sub: total ? Math.round((interviews/total)*100) + '% of applications' : 'No data yet' },
      { label:'Offers', value: offers, sub: offers ? 'Congratulations!' : 'None yet — keep going' },
      { label:'Response Rate', value: responseRate + '%', sub: total ? (total - noResponse) + ' of ' + total + ' got a response' : 'No data yet' }
    ];
    el.innerHTML = cards.map(c => `
      <div class="stat-card">
        <p class="label">${c.label}</p>
        <p class="value">${c.value}</p>
        <p class="sub">${c.sub}</p>
      </div>
    `).join('');
  }

  document.getElementById('tracker-add').addEventListener('click', () => addApplication());
  if(jobApplications.length === 0){ addApplication(); } else { renderTrackerTable(); }
  renderTrackerStats();

  /* ================= WELLNESS CORNER ================= */

  // Daily mood check-in
  const moodPicker = document.getElementById('mood-picker');
  function renderMoodPicker(){
    const todayCheckin = getTodayCheckin();
    moodPicker.innerHTML = CHECKIN_MOODS.map(m => `
      <button type="button" class="mood-pill ${todayCheckin && todayCheckin.mood === m.key ? 'selected' : ''}" data-mood="${m.key}">
        <span class="mood-emoji">${m.emoji}</span><span class="mood-text">${m.label}</span>
      </button>
    `).join('');
    moodPicker.querySelectorAll('.mood-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const moodDef = CHECKIN_MOODS.find(m => m.key === btn.dataset.mood);
        const quote = pickQuote(moodDef.quoteMood);
        save('dctp_checkin', { date: todayKey(), mood: moodDef.key, quoteMood: moodDef.quoteMood });
        const checkinHistory = load('dctp_checkin_history', []);
        if(!checkinHistory.some(c => c.date === todayKey())){
          checkinHistory.push({ date: todayKey(), mood: moodDef.key });
          save('dctp_checkin_history', checkinHistory);
        }
        renderMoodPicker();
        const responseEl = document.getElementById('checkin-response');
        responseEl.style.display = 'block';
        responseEl.innerHTML = `Thanks for checking in. Here's something to hold onto today:<br><strong>"${quote}"</strong>`;
        renderDashboard();
        renderWellnessWeek();
      });
    });
    const existing = getTodayCheckin();
    if(existing){
      const responseEl = document.getElementById('checkin-response');
      responseEl.style.display = 'block';
      responseEl.innerHTML = `Thanks for checking in today. Here's your reminder:<br><strong>"${pickQuote(existing.quoteMood)}"</strong>`;
    }
  }
  renderMoodPicker();

  // Breathing guide — simple 4-4-4 inhale/hold/exhale cycle
  let breathingActive = false;
  let breathingTimeouts = [];
  function clearBreathingTimeouts(){ breathingTimeouts.forEach(t => clearTimeout(t)); breathingTimeouts = []; }
  function runBreathingCycle(){
    if(!breathingActive) return;
    const circle = document.getElementById('breathing-circle');
    const text = document.getElementById('breathing-text');
    circle.className = 'breathing-circle inhale';
    text.textContent = 'Inhale...';
    breathingTimeouts.push(setTimeout(() => {
      if(!breathingActive) return;
      circle.className = 'breathing-circle hold';
      text.textContent = 'Hold...';
      breathingTimeouts.push(setTimeout(() => {
        if(!breathingActive) return;
        circle.className = 'breathing-circle exhale';
        text.textContent = 'Exhale...';
        breathingTimeouts.push(setTimeout(() => runBreathingCycle(), 4000));
      }, 4000));
    }, 4000));
  }
  document.getElementById('breathing-start').addEventListener('click', () => {
    const btn = document.getElementById('breathing-start');
    breathingActive = !breathingActive;
    if(breathingActive){
      btn.textContent = 'Stop';
      runBreathingCycle();
    } else {
      btn.textContent = 'Start breathing exercise';
      clearBreathingTimeouts();
      const circle = document.getElementById('breathing-circle');
      circle.className = 'breathing-circle';
      document.getElementById('breathing-text').textContent = 'Start';
    }
  });

  // Confidence tips
  const confidenceTips = [
    'Prepare 2–3 real examples from your experience before any interview — specifics beat generic answers.',
    'Practice saying one sentence about your biggest strength out loud until it feels natural, not rehearsed.',
    'Before an interview, do something that already makes you feel capable — even a small win.',
    'Confidence isn\'t the absence of nerves. It\'s showing up anyway.',
    'Keep a running note of compliments or wins, however small. Reread it before anything stressful.'
  ];
  document.getElementById('confidence-tips').innerHTML = confidenceTips.map(t => `<li>${t}</li>`).join('');

  // Reframe a hard thought — tap to reveal an alternate perspective
  const reframes = [
    { thought:'I bombed that interview.', reframe:'That interview showed me exactly which questions I need to practice for next time.' },
    { thought:'I\'m not qualified enough.', reframe:'I meet many of the requirements, and some skills are learned on the job, not before it.' },
    { thought:'Everyone else seems to have it figured out.', reframe:'I\'m only seeing people\'s highlight reels, not their rejections or doubts.' },
    { thought:'I should have heard back by now.', reframe:'Silence usually means their process is slow, not that I\'ve been judged and found lacking.' },
    { thought:'I keep getting rejected.', reframe:'Each rejection narrows down where I don\'t fit, which gets me closer to where I do.' }
  ];
  document.getElementById('reframe-list').innerHTML = reframes.map((r,i) => `
    <div class="reframe-item" id="reframe-${i}">
      <button type="button" class="reframe-toggle">${r.thought}</button>
      <div class="reframe-answer">${r.reframe}</div>
    </div>
  `).join('');
  reframes.forEach((_,i) => {
    document.getElementById('reframe-'+i).querySelector('.reframe-toggle').addEventListener('click', () => {
      document.getElementById('reframe-'+i).classList.toggle('open');
    });
  });

  /* ================= TOPBAR CHROME (search bar visual, clock, dark mode, notifications, avatar) ================= */
  /* Additive only — does not alter any existing module logic, storage keys, or IDs. */

  // Live clock + date in the topbar
  function tickTopbarClock(){
    const timeEl = document.getElementById('topbar-clock-time');
    const dateEl = document.getElementById('topbar-clock-date');
    if(!timeEl || !dateEl) return;
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString(undefined, { hour:'numeric', minute:'2-digit' });
    dateEl.textContent = now.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
  }
  tickTopbarClock();
  setInterval(tickTopbarClock, 1000 * 30);

  // Dark mode toggle — persists preference, defaults to the user's OS setting on first visit
  const THEME_KEY = 'dctp_theme';
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    const sun = document.getElementById('theme-icon-sun');
    const moon = document.getElementById('theme-icon-moon');
    if(sun && moon){
      sun.style.display = theme === 'dark' ? 'none' : 'block';
      moon.style.display = theme === 'dark' ? 'block' : 'none';
    }
  }
  (function initTheme(){
    const saved = load(THEME_KEY, null);
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(saved || (prefersDark ? 'dark' : 'light'));
  })();
  const themeToggleBtn = document.getElementById('theme-toggle');
  if(themeToggleBtn){
    themeToggleBtn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      save(THEME_KEY, next);
    });
  }

  // Topbar search — jumps to the matching module rather than a full search index (keeps this a lightweight, offline-friendly feature)
  const SEARCH_TARGETS = [
    { keys:['dashboard','home','overview'], view:'dashboard' },
    { keys:['assessment','readiness','quiz'], view:'assessment' },
    { keys:['interview','mock','practice questions'], view:'interview' },
    { keys:['resume','cv','checker','ats'], view:'checker' },
    { keys:['tracker','job','application','company'], view:'tracker' },
    { keys:['wellness','mood','breathing','stress'], view:'wellness' }
  ];
  const topbarSearchInput = document.getElementById('topbar-search-input');
  if(topbarSearchInput){
    topbarSearchInput.addEventListener('keydown', (e) => {
      if(e.key !== 'Enter') return;
      const q = topbarSearchInput.value.trim().toLowerCase();
      if(!q) return;
      const hit = SEARCH_TARGETS.find(t => t.keys.some(k => k.includes(q) || q.includes(k)));
      if(hit){
        const tabBtn = document.querySelector('.tab-btn[data-view="' + hit.view + '"]');
        if(tabBtn) tabBtn.click();
        topbarSearchInput.value = '';
        topbarSearchInput.blur();
      } else {
        showToast('No matching module found for "' + q + '".', 'error');
      }
    });
  }

  // Notifications — small, honest reminders derived from data that already exists in this browser
  const notifToggleBtn = document.getElementById('notif-toggle');
  const notifPanel = document.getElementById('notif-panel');
  function buildNotifications(){
    const list = [];
    if(!getTodayCheckin()){
      list.push('You haven\'t checked in on the Wellness Corner today.');
    }
    const jobApps = load('dctp_job_tracker', []);
    const noResponseCount = jobApps.filter(a => a.status === 'noresponse').length;
    if(noResponseCount > 0){
      list.push(noResponseCount + ' application' + (noResponseCount === 1 ? '' : 's') + ' still waiting on a response.');
    }
    if(!load('dctp_assessment', null)){
      list.push('Take the Career Readiness Assessment to see where to focus next.');
    }
    if(!load('dctp_checker_result', null)){
      list.push('Upload your resume to get an ATS compatibility check.');
    }
    return list;
  }
  function renderNotifications(){
    const listEl = document.getElementById('notif-list');
    const dotEl = document.getElementById('notif-dot');
    if(!listEl) return;
    const items = buildNotifications();
    if(dotEl){
      dotEl.style.display = items.length ? 'flex' : 'none';
      dotEl.textContent = items.length ? String(items.length) : '';
    }
    listEl.innerHTML = items.length
      ? items.map(t => '<div class="notif-item"><span class="ni-dot"></span><span>' + escapeHtml(t) + '</span></div>').join('')
      : '<div class="notif-empty">You\'re all caught up.</div>';
  }
  if(notifToggleBtn && notifPanel){
    notifToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      renderNotifications();
      notifPanel.classList.toggle('open');
    });
    document.addEventListener('click', (e) => {
      if(!notifPanel.contains(e.target) && e.target !== notifToggleBtn){
        notifPanel.classList.remove('open');
      }
    });
  }

  // Topbar avatar — mirrors the same Google profile photo / initial already used on the dashboard welcome banner
  function syncTopbarChrome(){
    const avatarEl = document.getElementById('topbar-avatar');
    if(avatarEl){
      const displayName = currentUserName || (currentUserEmail ? currentUserEmail.split('@')[0] : '');
      const initial = displayName.charAt(0).toUpperCase() || '?';
      if(currentUserAvatar){
        avatarEl.innerHTML = '<img src="' + escapeAttr(currentUserAvatar) + '" alt="Profile picture" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" onerror="this.parentElement.textContent=\'' + escapeAttr(initial) + '\'">';
      } else {
        avatarEl.textContent = initial;
      }
      avatarEl.title = 'Account profile' + (currentUserEmail ? ' — ' + currentUserEmail : '');
    }
    renderNotifications();
  }

  /* ================= INTERVIEW SIDEBAR (history + tips) ================= */
  function renderInterviewHistorySidebar(){
    const el = document.getElementById('interview-history-list');
    if(!el) return;
    const history = load('dctp_interview_history', []).slice().reverse().slice(0, 5);
    el.innerHTML = history.length
      ? history.map(h => `
          <div class="interview-history-row">
            <span><span class="ih-track">${escapeHtml(h.track)}</span><span class="ih-date">${timeAgo(h.date)}</span></span>
            <span class="ih-score">${h.overallPct}%</span>
          </div>
        `).join('')
      : '<p class="empty-hint">No sessions yet — your first practice run will show up here.</p>';
  }
  const INTERVIEW_TIPS = [
    'Keep answers between 30–90 seconds — long enough to show depth, short enough to hold attention.',
    'Lead with the outcome, then explain how you got there — it keeps your answer focused.',
    'Pause before answering. A brief pause reads as thoughtful, not unprepared.',
    'Practice your weakest track first — that\'s where the biggest gains are.',
    'Say the company or role name out loud once during practice — it helps you sound genuinely interested.'
  ];
  const quickTipsEl = document.getElementById('interview-quick-tips');
  if(quickTipsEl) quickTipsEl.innerHTML = INTERVIEW_TIPS.map(t => `<li>${t}</li>`).join('');
  renderInterviewHistorySidebar();

  /* ---- Additive UI widgets for the redesigned Mock Interview module ----
     Display-only: derives everything from dctp_interview_history (already
     saved by finishInterview) and from the in-memory interviewState during
     an active session. Does not modify scoring, tracks, or history schema. ---- */
  (function interviewExtrasWidgets(){
    function computeStats(history){
      if(!history.length) return { sessions:0, best:null, avg:null, topTrack:null };
      const scores = history.map(h => h.overallPct).filter(v => typeof v === 'number');
      const best = scores.length ? Math.max(...scores) : null;
      const avg = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null;
      const counts = {};
      history.forEach(h => { if(h.track) counts[h.track] = (counts[h.track]||0) + 1; });
      const topTrack = Object.keys(counts).sort((a,b) => counts[b]-counts[a])[0] || null;
      return { sessions: history.length, best, avg, topTrack };
    }

    function renderStats(){
      const history = load('dctp_interview_history', []);
      const stats = computeStats(history);

      const sEl = document.getElementById('iv-stat-sessions');
      const bEl = document.getElementById('iv-stat-best');
      const aEl = document.getElementById('iv-stat-avg');
      const tEl = document.getElementById('iv-stat-track');
      if(sEl) sEl.textContent = stats.sessions;
      if(bEl) bEl.textContent = stats.best !== null ? stats.best + '%' : '—';
      if(aEl) aEl.textContent = stats.avg !== null ? stats.avg + '%' : '—';
      if(tEl) tEl.textContent = stats.topTrack || '—';

      const trendEl = document.getElementById('iv-trend-chart');
      if(trendEl){
        const recent = history.slice(-8);
        if(recent.length){
          const values = recent.map(h => h.overallPct);
          const labels = recent.map((h,i) => 'S' + (history.length - recent.length + i + 1));
          trendEl.innerHTML = barChartWithTrend(values, labels, { showTrend:true, barColor:'var(--gold)', trendColor:'var(--rose-deep)' });
        } else {
          trendEl.innerHTML = '<p class="iv-breakdown-empty">Complete a session to see your trend here.</p>';
        }
      }

      const ringEl = document.getElementById('iv-readiness-ring');
      const readinessTextEl = document.getElementById('iv-readiness-text');
      if(ringEl) ringEl.innerHTML = progressRing(stats.avg !== null ? stats.avg : 0, { size:72, strokeWidth:8, color: (stats.avg !== null && stats.avg >= 75) ? 'var(--teal)' : 'var(--gold)' });
      if(readinessTextEl){
        readinessTextEl.textContent = stats.sessions
          ? `Based on ${stats.sessions} session${stats.sessions===1?'':'s'} so far.`
          : 'No sessions yet — practice once to see this.';
      }

      const recEl = document.getElementById('iv-recommend-body');
      if(recEl){
        if(!stats.sessions){
          recEl.innerHTML = `<p>Take your first mock interview to get a personalized recommendation.</p>`;
        } else if(stats.avg < 75){
          recEl.innerHTML = `
            <p>Based on your sessions so far, practice <strong>${stats.topTrack || 'your practiced track'}</strong> again — your average is ${stats.avg}%.</p>
            <div class="interview-info-strip" style="margin:12px 0 0; grid-template-columns:1fr 1fr;">
              <div><span class="info-strip-label">Estimated time</span><span class="info-strip-value">~10 min</span></div>
              <div><span class="info-strip-label">Focus</span><span class="info-strip-value">Structure &amp; clarity</span></div>
            </div>
          `;
        } else {
          recEl.innerHTML = `<p>Solid average of ${stats.avg}% — try a track you haven't practiced yet to round out your skills.</p>`;
        }
      }

      const badgesEl = document.getElementById('iv-achievements-badges');
      if(badgesEl){
        const badges = [
          { icon:'🎤', label:'First Interview', unlocked: stats.sessions >= 1 },
          { icon:'🏆', label:'80% Score', unlocked: history.some(h => h.overallPct >= 80) },
          { icon:'🔥', label:'5 Sessions', unlocked: stats.sessions >= 5 },
          { icon:'⭐', label:'Interview Master', unlocked: stats.avg !== null && stats.avg >= 90 }
        ];
        badgesEl.innerHTML = `<div class="iv-badge-row">` + badges.map(b => `
          <div class="iv-badge ${b.unlocked ? 'unlocked' : ''}">
            <span class="iv-badge-icon">${b.icon}</span>
            <span>${b.label}</span>
          </div>
        `).join('') + `</div>`;
      }
    }
    renderStats();

    // Reflect the selected track in the info strip — observes clicks on the
    // picker without touching the existing per-pill click handler.
    const picker = document.getElementById('track-picker');
    if(picker){
      picker.addEventListener('click', (e) => {
        const pill = e.target.closest('.track-pill');
        if(!pill) return;
        const trackEl = document.getElementById('iv-info-track');
        const statusEl = document.getElementById('iv-info-status');
        if(trackEl) trackEl.textContent = pill.textContent;
        if(statusEl) statusEl.textContent = 'Ready to start';
      });
    }

    // Static reference accordion — informational only.
    const faqEl = document.getElementById('interview-faq-accordion');
    if(faqEl){
      const faqTips = {
        'Tell me about yourself.': "Give a short walkthrough of your background, relevant skills, and what you're looking for next — 60-90 seconds.",
        'Why should we hire you?': 'Match 2-3 of your strongest skills directly to what the role needs.',
        'Describe a challenge you faced.': 'Use the STAR method: Situation, Task, Action, Result.',
        'What are your strengths?': 'Pick strengths relevant to the role and back them with a quick example.',
        'Where do you see yourself in five years?': "Show ambition that's realistic and connected to growing with the company."
      };
      faqEl.innerHTML = Object.keys(faqTips).map(q => `
        <details>
          <summary>${q}</summary>
          <p>${faqTips[q]}</p>
        </details>
      `).join('');
    }

    // Answer quality breakdown for the session just completed — reads the
    // live interviewState (finishInterview only hides/shows cards, it
    // doesn't clear interviewState), then refreshes the stat widgets.
    const nextBtn = document.getElementById('q-next');
    if(nextBtn){
      nextBtn.addEventListener('click', () => {
        setTimeout(() => {
          const breakdownEl = document.getElementById('iv-breakdown-bars');
          if(!breakdownEl || !interviewState || !interviewState.answers.length) return;
          const answers = interviewState.answers;
          const pctOf = key => Math.round((answers.filter(a => a[key]).length / answers.length) * 100);
          const metrics = [
            { label:'Answer Length', value: pctOf('lengthOk') },
            { label:'Low Filler Words', value: pctOf('fillerOk') },
            { label:'First-Person Framing', value: pctOf('hasFirstPerson') },
            { label:'STAR Structure', value: pctOf('hasStarCue') }
          ];
          breakdownEl.innerHTML = metrics.map(m => `
            <div class="bar-row">
              <div class="bar-label"><span>${m.label}</span><span>${m.value}%</span></div>
              <div class="bar-track"><div class="bar-fill" style="width:${m.value}%"></div></div>
            </div>
          `).join('');
          renderStats();
        }, 0);
      });
    }

    const downloadBtn = document.getElementById('interview-download');
    if(downloadBtn) downloadBtn.addEventListener('click', () => showToast('Download coming soon — this is a UI preview for now.', 'info'));
  })();

  /* ================= JOB TRACKER INSIGHTS SIDEBAR ================= */
  function renderTrackerInsights(){
    const el = document.getElementById('tracker-insights');
    if(!el) return;
    const apps = jobApplications.filter(a => a.company || a.position);
    if(apps.length === 0){
      el.innerHTML = '<p class="insight-empty">Add an application to start seeing insights here.</p>';
      return;
    }
    const rows = [];
    const counts = {};
    apps.forEach(a => { if(a.status){ counts[a.status] = (counts[a.status]||0) + 1; } });
    const statusLabel = v => (statusOptions.find(s => s.value === v) || {}).label || v;
    const topStatus = Object.keys(counts).sort((a,b) => counts[b]-counts[a])[0];
    if(topStatus){ rows.push(`Most of your applications are currently <strong>${statusLabel(topStatus)}</strong> (${counts[topStatus]} of ${apps.length}).`); }

    const dated = apps.filter(a => a.date && (a.status === 'applied' || a.status === 'noresponse'))
      .slice().sort((a,b) => new Date(a.date) - new Date(b.date));
    if(dated.length){
      const oldest = dated[0];
      const days = Math.floor((Date.now() - new Date(oldest.date).getTime()) / 86400000);
      if(days >= 0){ rows.push(`Your longest-waiting application${oldest.company ? ' (' + escapeHtml(oldest.company) + ')' : ''} has been pending <strong>${days} day${days===1?'':'s'}</strong>.`); }
    }

    const withNotes = apps.filter(a => a.notes && a.notes.trim()).length;
    if(withNotes < apps.length){ rows.push(`${apps.length - withNotes} application${apps.length - withNotes === 1 ? '' : 's'} ${apps.length - withNotes === 1 ? 'has' : 'have'} no notes yet — jotting down details helps if you get a callback later.`); }

    el.innerHTML = rows.map(r => `<div class="insight-row"><span class="in-dot"></span><span>${r}</span></div>`).join('');
  }
  renderTrackerInsights();

  /* ================= WELLNESS WEEKLY TIMELINE ================= */
  function renderWellnessWeek(){
    const el = document.getElementById('wellness-week-strip');
    if(!el) return;
    const history = load('dctp_checkin_history', []);
    const days = [];
    for(let i = 6; i >= 0; i--){
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0,10);
      const checked = history.some(h => h.date === key);
      days.push({
        label: d.toLocaleDateString(undefined, { weekday:'short' }),
        checked,
        isToday: i === 0
      });
    }
    el.innerHTML = `<div class="week-strip">${days.map(d => `
      <div class="week-day${d.isToday ? ' today' : ''}">
        <span class="wd-label">${d.label}</span>
        <span class="wd-dot${d.checked ? ' filled' : ''}"></span>
      </div>
    `).join('')}</div>`;
  }
  renderWellnessWeek();

  /* ================= PROFESSIONAL TYPING CHALLENGE ================= */

  const TYPING_INDUSTRIES = [
    { key:"it", label:"IT / Programming", type:"Programming Documentation" },
    { key:"itsupport", label:"IT Support", type:"IT Troubleshooting Guide" },
    { key:"cybersecurity", label:"Cybersecurity", type:"Security Incident Report" },
    { key:"business", label:"Business", type:"Meeting Minutes" },
    { key:"customer", label:"Customer Service / BPO", type:"Customer Support Response" },
    { key:"healthcare", label:"Healthcare", type:"Appointment Reminder" },
    { key:"education", label:"Education", type:"Office Announcement" },
    { key:"marketing", label:"Marketing", type:"Campaign Announcement" },
    { key:"finance", label:"Banking and Finance", type:"Credit Evaluation Report" },
    { key:"hr", label:"Human Resources", type:"Interview Invitation Email" },
    { key:"accounting", label:"Accounting", type:"Bank Reconciliation Report" },
    { key:"engineering", label:"Engineering", type:"Construction Progress Report" },
    { key:"hospitality", label:"Hospitality and Tourism", type:"Guest Complaint Response" }
  ];

  const TYPING_SCENARIOS = {
    it: {
      title:"Documenting a New REST API",
      situation:"You are documenting a newly developed REST API for your development team.",
      task:"Type the technical documentation exactly as shown.",
      career:"This activity simulates documentation tasks commonly performed by Software Developers.",
      texts:{
        easy:"This guide explains how the new user login feature works for the customer portal. When a user visits the login screen, they are asked to enter their registered email address and their password. Once they select the sign in button, the system sends this information to the server for verification. The server checks the email and password against the records stored in the database to confirm that the account exists and that the password is correct. If both details match, the user is granted access and is redirected to their personal dashboard, where they can view their account information and recent activity. If the details do not match, the system displays a clear error message asking the user to try again or reset their password. Developers should make sure that failed login attempts are logged for security purposes, and that passwords are never stored or displayed as plain text anywhere in the system.",
        medium:"This document describes the authentication endpoint recently added to the internal customer portal API, which allows client applications to verify user credentials before granting access to protected resources. The endpoint accepts a POST request containing an email field and a password field, both of which are required and validated on the server before any database lookup is performed. Upon a successful match between the submitted credentials and the stored record, the server generates a signed JSON web token that remains valid for twenty four hours and includes the user's account identifier and assigned role. If the credentials submitted do not match any existing account, the server responds with a 401 status code along with a descriptive error message so the client application can display appropriate feedback to the user. Developers integrating this endpoint should store the returned token securely, preferably in memory rather than local storage, and must attach it to the Authorization header of every subsequent request that requires authentication. Tokens that have expired must trigger a new login request rather than being silently refreshed without the user's awareness.",
        hard:"This technical specification outlines the OAuth2 authorization code flow implemented for the slash api slash v2 slash auth slash token endpoint used across all first party client applications within the organization. Clients must first redirect users to the authorization server together with a client_id, a redirect_uri that has been pre registered in the developer console, and a cryptographically random state parameter that protects the exchange against cross site request forgery attacks. Once the user reviews and grants consent, the authorization server issues a short lived authorization code that is exchanged for an access_token and a refresh_token through a secure server side POST request, ensuring that the client secret is never exposed to the browser. Access tokens expire after 3600 seconds and must be refreshed using the refresh_token grant type well before expiry to avoid interrupting the user session. Rate limiting is enforced at 100 requests per minute per client_id, and any client exceeding this threshold will receive a 429 status code along with a Retry-After header indicating when the next request may be attempted. Engineers responsible for maintaining this endpoint should monitor token issuance volume weekly and review the revocation list to ensure that compromised tokens are invalidated promptly across all downstream services."
      }
    },
    itsupport: {
      title:"Server Outage Incident Report",
      situation:"A company server has become unavailable.",
      task:"Type the incident report.",
      career:"This activity simulates incident documentation commonly performed by IT Support Specialists.",
      texts:{
        easy:"The main office server stopped responding early this morning, and several employees reported that they were unable to log in to the shared network drive or access their company email accounts. The support desk was informed of the issue as soon as the first reports came in, and a ticket was created to track the outage from start to finish. The technical team began checking the server right away to understand what might have caused it to stop working properly. Early signs point to a problem with the storage space on the server, which may have filled up overnight without anyone noticing. The team is now clearing unnecessary files to free up space and plans to restart the affected services once enough room has been created. Staff are asked to save their work often and avoid opening large files until the server issue has been fully resolved and confirmed by the support desk.",
        medium:"At 9:14 AM, the primary file server became unresponsive, preventing staff across three departments from accessing shared drives, internal email, and the document management system used for daily operations. The IT support team was alerted through the automated monitoring system within two minutes of the outage and immediately opened a priority incident ticket to track the response. Initial checks revealed that the server disk usage had reached full capacity overnight due to an unmonitored backup job that failed to rotate old files as scheduled. The support team is currently clearing several gigabytes of temporary files and restarting the affected services in the correct order to avoid triggering a second outage. Department managers have been asked to inform their teams that access may be intermittent for the next hour while services come back online gradually. A full status update, along with a summary of the root cause and any data impact, will be sent to all staff once normal access has been confirmed by the technical team.",
        hard:"At 09:14 AM PST, the primary file server, designated SRV-FS01, became unresponsive, triggering a P1 incident that affected three departments and blocked access to shared drives, the SMTP relay used for outbound email, and the internal ticketing platform relied upon for support requests. Automated monitoring flagged the outage within ninety seconds through a disk utilization alert, which was later traced to an unmonitored nightly backup job that had silently consumed 98 percent of the available storage over the preceding two weeks. The on call engineer has since purged roughly 340GB of stale backup snapshots and is restarting the affected services in a carefully sequenced rolling restart to avoid triggering a full outage recurrence during peak usage hours. Root cause analysis points to a misconfigured retention policy that failed to rotate backups older than thirty days, allowing storage consumption to grow unchecked without triggering an earlier warning. A permanent remediation plan, including automated disk space alerting at the 80 percent threshold and a revised retention schedule reviewed by the infrastructure team, will be deployed by the end of the week. In the meantime, all department leads are asked to communicate the temporary access limitations to their teams and to escalate any unresolved access issues directly to the service desk."
      }
    },
    cybersecurity: {
      title:"Phishing Attack Report",
      situation:"You are reporting a detected phishing attack.",
      task:"Type the security incident report.",
      career:"This activity simulates security incident reporting commonly performed by Cybersecurity Analysts.",
      texts:{
        easy:"An employee in the office received a strange email this week that asked them to confirm their password by clicking on a link. The message looked like it came from the company IT department, but something about it did not seem right, so the employee decided not to click on the link. Instead, they reported the email to the security team right away so it could be checked properly. The security team looked into the message and confirmed that it was a fake email designed to steal passwords from unsuspecting staff members. They are now checking to see if anyone else in the company received the same message and whether any information was accidentally shared. All employees are being reminded once again never to enter their password after clicking a link inside an email, even if the message looks official or urgent.",
        medium:"On Tuesday morning, an employee in the finance department reported a suspicious email requesting login credentials, which had been disguised as an urgent message from the internal IT support team. The email contained a link directing recipients to a fake login page that had been carefully designed to capture usernames and passwords without raising immediate suspicion. Fortunately, the employee did not enter any information into the fake page and instead forwarded the message to the security team as soon as something felt unusual about the request. A quick investigation confirmed that twelve other employees across different departments had received the same phishing attempt within the same hour, though a thorough review found that no credentials had actually been compromised in this instance. The malicious link has since been blocked at the network level to prevent anyone else from accessing the fake page by accident. All staff have once again been reminded to carefully verify sender addresses and to avoid clicking on embedded links before confirming that a request is genuine.",
        hard:"At 08:47 AM, an employee in the finance department flagged a phishing email impersonating the internal IT helpdesk, requesting credential re verification through a spoofed single sign on page hosted on a lookalike domain that closely resembled the company's actual authentication portal. Analysis of the email headers revealed that the message passed the SPF check but failed DKIM alignment, a strong indicator that the sending infrastructure had either been compromised or was being spoofed by an external threat actor. Correlation with existing threat intelligence feeds identified the same campaign targeting twelve additional mailboxes across the organization, although a review of endpoint telemetry confirmed that no credentials were ultimately submitted through the fraudulent page. The malicious domain has since been blocklisted at both the DNS resolver level and the email gateway to prevent further delivery attempts from the same source. Mailbox forwarding rules across the affected accounts have also been audited to rule out any unauthorized persistence mechanisms that attackers sometimes install after an initial compromise attempt. Given the scale and precision of this campaign, a mandatory phishing awareness refresher session will be scheduled for all departments within the next two weeks, along with an updated simulated phishing exercise to measure improvement in staff detection rates."
      }
    },
    business: {
      title:"Preparing the Meeting Minutes",
      situation:"Your manager asks you to prepare the meeting minutes.",
      task:"Type the meeting summary.",
      career:"This activity simulates meeting documentation commonly performed by Business Professionals.",
      texts:{
        easy:"The project team met this morning to talk about how the new product launch is progressing so far. Everyone agreed that the first stage of development should be finished by the end of next month if there are no major delays. The marketing group will begin working on plans for the launch event once the product details are confirmed by the design team. A few concerns were raised about the current budget, and these will be discussed further with the finance department before any final decisions are made. The next team meeting has been scheduled for two weeks from today so everyone can check on progress and address any new issues. A written summary of everything discussed today will be shared with the whole team by the end of the day so nobody misses any important updates.",
        medium:"The project team met this afternoon to review the current timeline for the upcoming product launch scheduled for the third quarter of this year. All members present agreed that the first development phase should be completed by the end of next month, provided that final testing does not uncover any major issues that would require additional development time. The marketing team confirmed that they will begin preparing launch materials immediately and will coordinate closely with the design department to ensure that all visual assets are approved before the campaign goes live. Several budget concerns raised during the discussion, particularly around the cost of external contractors, will be reviewed separately with the finance team before the next planning session takes place. It was also agreed that a shared tracking document would be created so that all departments can monitor progress against the agreed milestones in real time. A follow up meeting has been scheduled for two weeks from today to review progress and address any outstanding concerns.",
        hard:"The cross functional project team convened this afternoon to reassess the third quarter product launch timeline in light of last week's vendor delays affecting the delivery of key hardware components. Stakeholders agreed to compress the remaining development phase by two weeks, contingent on finance approving the expedited quality assurance budget by Friday of this week, since additional overtime hours will be required from the testing team to meet the revised deadline. Marketing will proceed with launch collateral production in parallel rather than waiting on final engineering sign off, effectively absorbing a degree of schedule risk in exchange for maintaining the original launch date that has already been communicated to key retail partners. Concerns were raised regarding resourcing conflicts with the concurrent platform migration project, which several team leads noted would compete for the same senior engineers over the coming weeks, and this conflict will be escalated to the steering committee for prioritization before the end of the month. Legal has also been asked to review the updated vendor agreement to confirm whether the delay entitles the company to any contractual penalties or service credits. A follow up session is scheduled for next Thursday to confirm whether the compressed timeline remains achievable given these constraints."
      }
    },
    customer: {
      title:"Responding to a Delayed Delivery",
      situation:"A customer is requesting assistance regarding a delayed delivery.",
      task:"Type the professional customer response.",
      career:"This activity simulates customer communication handled by Customer Service and BPO Representatives.",
      texts:{
        easy:"Thank you for reaching out to us about the delay with your recent delivery, and we are very sorry for any inconvenience this may have caused you. We completely understand how frustrating it can be to wait longer than expected for an order, especially when you were counting on it to arrive on time. After checking with our shipping partner, we can confirm that your package is currently on its way and should arrive within the next two business days at the latest. As a way of saying sorry for the delay, we would like to offer you a discount code that you can use on your next purchase with us. Please do not hesitate to reach out again if you have any other questions or if your package does not arrive as expected, and we will be happy to help you right away.",
        medium:"Thank you for contacting us regarding the delay with your recent order, and please accept our sincere apologies for the inconvenience this has caused during what we understand is likely a time sensitive situation. After checking directly with our shipping partner, we can confirm that your package is currently in transit and is expected to arrive within the next two business days, based on the most recent tracking update available to our team. As an apology for the delay and the stress it may have caused, we have applied a fifteen percent discount code to your account that can be used toward your next purchase within the next ninety days. We understand that delivery delays can affect your trust in our service, and we want to reassure you that our logistics team is actively working to prevent similar issues from happening again in the future. Please do not hesitate to reach out if you have any further questions or concerns, and one of our representatives will be glad to assist you promptly.",
        hard:"Thank you for reaching out regarding the delay with order number 48213, and I sincerely apologize for the inconvenience this has caused, particularly given that I understand this delivery was intended for a time sensitive occasion. Upon investigation with our logistics partner, the shipment was held at a regional sorting facility due to a temporary capacity issue affecting several routes in your area, and it has now been confirmed to be back in active transit with an estimated arrival within two business days. Given the extended delay beyond our standard delivery window, and in recognition of the disruption this has caused, we have applied a twenty percent discount to your account along with waived shipping charges on your next order, both of which will remain valid for the next six months. I have also personally flagged this shipment for priority tracking on our end so that our team can proactively notify you of any further changes before you need to reach out to us again. If there is anything else at all that I can do to make this situation right, whether that involves further compensation or simply keeping you updated more frequently, please do not hesitate to let me know directly."
      }
    },
    healthcare: {
      title:"Patient Appointment Reminder",
      situation:"You are preparing a patient appointment reminder.",
      task:"Type the notification.",
      career:"This activity simulates patient communication commonly performed by Healthcare Administrative Staff.",
      texts:{
        easy:"This is a friendly reminder that you have an appointment scheduled with Doctor Santos tomorrow morning at ten o'clock at our main clinic location downtown. We kindly ask that you arrive about fifteen minutes before your scheduled time so that our front desk staff can complete your check in process without any delays. Please remember to bring your insurance card along with a valid government issued identification card, as both of these are required before you can be seen by the doctor. If you are currently taking any new medications since your last visit, please bring a list of these so the doctor can review them during your appointment. In case you are unable to attend your appointment as scheduled, please call our office as soon as possible so that we can offer your time slot to another patient who may need it. We truly look forward to seeing you tomorrow and helping you with any health concerns you may have at this time.",
        medium:"This is a friendly reminder that you have an appointment scheduled with Doctor Santos tomorrow at ten in the morning at our main clinic location on the second floor. Please arrive at least fifteen minutes early so that our front desk team can complete your check in process and update any changes to your medical history before your consultation begins. Kindly bring your insurance card, a valid government issued identification card, and a complete list of any current medications you are taking, including any supplements or over the counter drugs you may have started recently. If you have had any recent lab work done outside of our clinic, please bring a copy of those results as well so the doctor can review them alongside your other records. Should you be unable to attend this appointment for any reason, we kindly ask that you contact our office at least twenty four hours in advance so that another patient on our waiting list may be offered your available time slot. We look forward to seeing you and addressing any health concerns you may currently have.",
        hard:"This is a reminder regarding your upcoming appointment with Doctor Santos in the Endocrinology department, scheduled for tomorrow at ten o'clock in the morning at the Main Street clinic, Suite 204, located on the second floor near the main elevator bank. Please arrive fifteen minutes prior to your scheduled appointment time to complete the necessary intake documentation and to confirm any updates to your current medication list, particularly any recent changes to your insulin dosage since your previous visit three months ago. Kindly bring your insurance card, a valid photo identification card, and your most recent glucose monitoring log so that the provider can review your recent readings during the consultation and make any necessary adjustments to your treatment plan. Patients who arrive more than ten minutes late to their appointment may unfortunately be asked to reschedule for a later date, given that the provider maintains a fully booked, back to back appointment schedule throughout the day with very limited flexibility. If you need to cancel or reschedule this appointment for any reason, please notify our office at least twenty four hours in advance to avoid being charged the standard missed appointment fee that applies to all late cancellations. We appreciate your continued cooperation and look forward to supporting your ongoing care."
      }
    },
    education: {
      title:"Class Schedule Change Announcement",
      situation:"Create an announcement regarding class schedule changes.",
      task:"Type the announcement.",
      career:"This activity simulates administrative announcements commonly written by Education Staff and Coordinators.",
      texts:{
        easy:"Please be informed that class schedules across the campus will be changing starting next Monday due to some planned maintenance work in several of our buildings. Morning classes will now begin thirty minutes earlier than they normally do in order to make up for the change in building access hours during this period. Afternoon classes, on the other hand, will continue to follow the same schedule as before with no changes at all. Teachers will be responsible for sharing the updated morning schedule directly with their students sometime this week so that everyone has enough time to adjust. If you have any questions or concerns about how this change might affect you personally, please do not hesitate to speak with your adviser as soon as possible so they can help address them.",
        medium:"This is to inform all students and faculty members that class schedules will be adjusted starting next Monday due to the upcoming facility maintenance work planned for several buildings across campus. Morning classes will now begin thirty minutes earlier than usual in order to accommodate the revised building access hours that will be in effect throughout the maintenance period. Afternoon and evening class schedules, however, will remain completely unchanged for the remainder of the current semester, so students attending only afternoon sessions do not need to make any adjustments. Department heads will be responsible for distributing the updated morning schedule to each of their respective classes through their assigned advisers sometime later this week. Students who have any concerns regarding how this new schedule might affect their existing commitments are strongly encouraged to speak directly with their adviser or to visit the registrar's office for further assistance and clarification.",
        hard:"This announcement serves to formally inform all students, faculty, and staff members that class schedules across the College of Engineering will be adjusted beginning next Monday in order to accommodate the scheduled electrical maintenance work planned for Buildings A and C over the following two weeks. Morning classes originally scheduled between seven and nine in the morning will now begin thirty minutes earlier than usual, while laboratory sessions that require specialized equipment currently housed in the affected buildings will be temporarily relocated to designated rooms within the Annex building for the duration of the maintenance period. Afternoon and evening class schedules will remain largely unaffected by these changes, although students should still anticipate some minor room reassignments that will be communicated in advance through the official student portal as soon as they are finalized. Faculty members are kindly requested to update their attendance records accordingly to reflect the adjusted time blocks throughout the maintenance period, and to notify the registrar's office of any significant scheduling conflicts that arise as a direct result of these temporary changes. Students who anticipate scheduling conflicts, particularly those enrolled in back to back classes located across the two affected buildings, are strongly encouraged to coordinate directly with their department adviser before the end of this current week to make any necessary arrangements."
      }
    },
    marketing: {
      title:"Promotional Campaign Announcement",
      situation:"Prepare a promotional campaign announcement.",
      task:"Type the marketing announcement.",
      career:"This activity simulates campaign communication commonly written by Marketing Professionals.",
      texts:{
        easy:"We are excited to announce that our biggest summer sale of the year will be starting this Friday across all of our store locations as well as on our official online shopping website. Customers who shop with us during this period will be able to enjoy discounts of up to thirty percent off on a wide selection of items throughout the entire week long promotion. To help spread the word even further, our team will be posting daily deals and special offers across all of our social media pages, so be sure to follow us if you have not already done so. We truly appreciate every single one of our loyal customers, and this sale is really our way of saying thank you for your continued support throughout the year.",
        medium:"We are thrilled to officially announce the launch of our biggest summer sale campaign of the year, which will be starting this Friday across all of our physical store locations as well as through our online shopping platform. Customers will be able to enjoy discounts of up to thirty percent off on a wide selection of apparel, footwear, and accessories throughout the entire week long promotional period that follows. In order to maximize our overall reach, our marketing team will also be running daily flash deals across all major social media channels, alongside a series of targeted email campaigns aimed specifically at our most loyal and returning customers. Throughout the duration of the campaign, our team will be closely tracking key engagement metrics in order to properly measure overall performance against the results achieved during the same period last quarter. We strongly encourage every team member to help share the campaign details within their own personal networks in order to help spread the word even further.",
        hard:"We are pleased to formally announce the rollout of our flagship third quarter campaign, internally referred to as Summer Refresh, which will be officially launching this Friday across all retail locations, our e commerce platform, and a range of paid social channels selected specifically for this initiative. The campaign will feature tiered discounts of up to thirty five percent off on a curated selection of high performing product categories, supported by a fully coordinated marketing push across Instagram, TikTok, and email, with several influencer partnerships scheduled to go live simultaneously in order to maximize impressions during the crucial first week of the promotion. Overall campaign performance will be tracked against three primary key metrics throughout the promotional period, namely click through rate, conversion rate, and average order value, with a formal mid campaign review already scheduled for day four in order to reallocate advertising spend toward whichever channels are performing best relative to our internal benchmarks. Our creative team has also prepared a full set of contingency assets in advance, in case any individual platform happens to underperform relative to the projections originally set for this campaign. All regional store managers have been asked to confirm that in store signage has been properly installed no later than Thursday evening, in order to ensure that the campaign launches in a fully synchronized manner across every single location nationwide."
      }
    },
    finance: {
      title:"Personal Loan Credit Evaluation",
      situation:"You are preparing a credit evaluation report for a customer's loan application.",
      task:"Type the credit evaluation report.",
      career:"This activity simulates loan processing and credit evaluation tasks commonly performed by Banking and Finance Professionals.",
      texts:{
        easy:"This report reviews a loan application submitted by a customer who is requesting a personal loan of two hundred thousand pesos to be used for home improvement expenses. The applicant has been a member of the bank for more than five years and currently maintains a savings account with a stable monthly balance. Based on the documents submitted, the applicant has a steady monthly income and no history of late payments on any previous loans with our bank. The credit evaluation team checked the applicant's credit score and found it to be within an acceptable range for approval. A recommendation has been made to approve the loan with a fixed interest rate over a term of three years. The final decision will still need to be confirmed by the branch manager before the loan can be officially released to the applicant.",
        medium:"This credit evaluation report reviews the loan application submitted by a long standing bank customer requesting a personal loan in the amount of two hundred thousand pesos, intended primarily for home improvement expenses. The applicant, who holds account number 4471-208, has maintained an active savings account with our bank for more than five years and has consistently kept a stable average monthly balance throughout that period. A review of the applicant's submitted documents confirms a steady monthly income from full time employment, along with no record of late or missed payments on any previous loans held with our institution. The applicant's credit score was verified through our internal scoring system and found to fall within the acceptable range required for standard loan approval. Based on these findings, the credit evaluation team recommends approving the loan at a fixed interest rate of 8.5 percent over a repayment term of three years. This recommendation will now be forwarded to the branch manager for final review and formal approval before any funds are released to the applicant.",
        hard:"This credit evaluation report presents a detailed review of loan application number LA-20394, submitted by a long standing customer holding savings account number 4471-208 with an average daily balance of 120,000 pesos over the past twelve months. The applicant is requesting a personal loan in the amount of 200,000 pesos, to be disbursed as a lump sum and intended for home improvement expenses, with a proposed repayment term of thirty six months at a fixed interest rate of 8.5 percent per annum. A review of the applicant's submitted payslips and certificate of employment confirms a gross monthly income of 45,000 pesos, resulting in a debt to income ratio of 32 percent once the proposed monthly amortization of 8,400 pesos is factored into existing obligations. The applicant's credit score, verified through our internal credit bureau inquiry, currently stands at 720, which falls comfortably within the acceptable range required for standard approval without requiring additional collateral or a co maker. No delinquencies, write offs, or restructured accounts were found on record across the applicant's existing credit history with this institution or with partner reporting agencies. Based on these findings, the credit evaluation team formally recommends approval of the loan under standard terms, subject to final verification of the applicant's proof of billing and countersignature from the branch credit officer before funds are released."
      }
    },
    hr: {
      title:"Interview Invitation Email",
      situation:"You are sending an interview invitation to a job applicant.",
      task:"Type the professional email.",
      career:"This activity reflects professional email writing commonly performed by Human Resource personnel.",
      texts:{
        easy:"Thank you very much for applying for the Marketing Assistant position that is currently open at our company, and congratulations on making it through the initial stage of our hiring process. Our hiring team took the time to carefully review your resume and were genuinely impressed by your relevant background and overall qualifications for this particular role. Because of this, we would now like to formally invite you to take part in an interview as the very next step in our selection process. This interview has been scheduled for this coming Thursday at two o'clock in the afternoon and will be conducted entirely through a video call platform of our choosing. Kindly reply to this email at your earliest convenience to confirm whether this particular time and date will work well for your current schedule. We sincerely look forward to speaking with you very soon and learning even more about your relevant experience.",
        medium:"Thank you for applying for the Marketing Assistant position currently available with our company, and congratulations on successfully advancing to the next stage of our overall hiring process. After carefully reviewing your application materials in detail, our hiring team was genuinely impressed with your relevant professional background and would now like to invite you to take part in the next stage of our interview process as a result. This interview has been tentatively scheduled for this coming Thursday at two in the afternoon and will be conducted over a video call, with the entire session expected to last approximately forty five minutes from start to finish. Kindly reply directly to this email at your earliest convenience in order to confirm your availability for this particular time slot, or alternatively, feel free to request a different time if the one proposed does not currently work for your schedule. We genuinely look forward to learning even more about your relevant experience and to answering any questions that you may have prepared for us.",
        hard:"Thank you sincerely for your application for the Marketing Assistant position within our Brand Strategy team, and congratulations on being selected to move forward to the next and more advanced stage of our hiring process. Having carefully reviewed both your resume and your submitted creative portfolio in considerable detail, our hiring panel was particularly impressed by your previous campaign work within the retail sector specifically, and would now like to formally invite you to a second round interview, which will include a thirty minute case study discussion followed immediately by a panel style question and answer session with both our marketing director and two senior associates from the same department. This particular interview is tentatively scheduled for this coming Thursday at two in the afternoon and will be conducted entirely over video call, with a total expected duration of approximately ninety minutes, including one short scheduled break roughly halfway through the session. Kindly reply to this message at your earliest convenience in order to confirm whether this proposed time slot works well for you, or alternatively, please let us know if an alternative time sometime within the next five business days would prove to be more suitable given your current schedule. We sincerely look forward to a genuinely productive conversation, and to learning more about precisely how your relevant experience aligns with the specific requirements of this particular role."
      }
    },
    accounting: {
      title:"Monthly Bank Reconciliation Report",
      situation:"You are preparing the monthly bank reconciliation report for review.",
      task:"Type the reconciliation summary.",
      career:"This activity simulates reconciliation and reporting tasks commonly performed by Accounting Staff and Bookkeepers.",
      texts:{
        easy:"This report explains how the bank reconciliation for last month was completed by our accounting team. Every transaction listed on the bank statement was carefully compared against the entries recorded in our company's own accounting system to make sure that both sets of records matched exactly. A few small differences were found during this process, mostly caused by checks that had already been written but had not yet been cashed by the people who received them. These outstanding items were noted separately and will be tracked closely until they finally clear through the bank in the coming weeks. Once every difference had been properly explained and accounted for, the ending balance in our accounting system was confirmed to match the balance shown on the official bank statement. This completed reconciliation will now be filed for our records and reviewed again by the accounting supervisor before the month officially closes.",
        medium:"This report summarizes the monthly bank reconciliation process completed by the accounting department for the general operating account as of the end of last month. Each transaction recorded on the official bank statement was carefully compared line by line against the corresponding entries recorded in our internal accounting system to confirm that both sets of financial records were fully in agreement with one another. During this review, several outstanding checks were identified that had been issued to vendors but had not yet been presented to the bank for payment, along with one deposit that had been recorded internally but had not yet been reflected on the bank's own statement. Each of these reconciling items was documented individually, along with the relevant date and reference number, so that they can be properly tracked until they clear in a future statement period. After accounting for every identified difference, the adjusted ending balance in our system was confirmed to match the bank's reported balance exactly, with no unexplained variance remaining. This completed reconciliation has been forwarded to the accounting supervisor for final review and formal sign off before the monthly books are officially closed.",
        hard:"This report presents the completed bank reconciliation for the general operating account for the period ending on the thirtieth of last month, prepared in accordance with the department's standard month end closing procedures and reviewed against both the general ledger and the original bank statement issued by our primary financial institution. During the course of this reconciliation, a total of six outstanding checks amounting to approximately 12,400 dollars were identified as issued but not yet presented for payment, alongside two deposits in transit totaling 8,200 dollars that had been recorded in the general ledger on the final business day of the month but had not yet posted to the bank's own records at the time the statement was generated. In addition, a bank service charge of 45 dollars and an interest credit of 11 dollars and 20 cents were identified on the statement and have since been recorded as adjusting journal entries within the general ledger to keep both sets of records fully aligned going forward. Following the identification and proper treatment of all reconciling items described above, the adjusted book balance was confirmed to match the adjusted bank balance precisely, resulting in a fully reconciled difference of zero dollars for the period under review. This reconciliation, along with all supporting schedules and documentation, has been submitted to the accounting supervisor for formal review and will be retained as part of the permanent audit trail for this fiscal year."
      }
    },
    engineering: {
      title:"Construction Site Progress Report",
      situation:"You are preparing a weekly progress report for an ongoing construction project.",
      task:"Type the site progress report.",
      career:"This activity simulates project documentation and site reporting commonly performed by Engineers and Project Supervisors.",
      texts:{
        easy:"This report covers the progress made on the building project during the past week at the main construction site. The foundation work for the east wing of the building has now been fully completed and has already passed the required inspection carried out by the city engineer. Work on the concrete columns for the ground floor has also begun as planned and is expected to be finished within the next two weeks if the current good weather continues. A small delay was experienced this week due to a late delivery of steel reinforcement bars from our regular supplier, though this issue has since been resolved without affecting the overall project timeline. All workers on site continued to follow proper safety procedures throughout the week, and no accidents or injuries were reported during this period. The next progress report will be submitted at the end of next week as usual.",
        medium:"This report summarizes the construction progress achieved during the past week at the main residential building site currently under development. The foundation work for the east wing of the structure has now been fully completed and has successfully passed the required inspection conducted by the assigned city engineer earlier this week. Work on the reinforced concrete columns for the ground floor has also commenced as originally scheduled and is expected to be completed within the next two weeks, provided that current favorable weather conditions continue throughout this period. A minor delay of approximately two days was experienced this week due to a late delivery of steel reinforcement bars from our regular supplier, although this particular issue has since been fully resolved without significantly affecting the overall project timeline or the agreed completion date. All personnel working on site continued to follow established safety procedures throughout the week, including proper use of personal protective equipment, and no accidents or injuries of any kind were reported during this reporting period. The next weekly progress report will be submitted to the project owner at the end of next week as per our standard reporting schedule.",
        hard:"This report presents a detailed summary of the construction progress achieved during the past reporting week at the main residential development site, prepared in accordance with the project's standard weekly reporting requirements and submitted for review by both the project owner and the assigned structural engineer of record. The foundation work for the east wing of the structure, comprising a total of forty two individual footings, has now been fully completed and has successfully passed the required structural inspection conducted by the city engineer, with all concrete compression test results returning values above the required twenty eight day strength specification of 4,000 pounds per square inch. Work on the reinforced concrete columns for the ground floor has commenced as originally scheduled and is currently tracking approximately three days ahead of the baseline schedule, primarily due to favorable weather conditions and the early mobilization of an additional formwork crew. A minor delay of approximately two days was experienced midweek due to a late delivery of grade sixty steel reinforcement bars from our regular supplier, though this issue has since been resolved through an expedited air freight arrangement at no additional cost to the project budget. All personnel on site continued to comply fully with the project's site specific safety plan throughout the week, including mandatory toolbox talks conducted each morning, and zero recordable incidents or near misses were logged during this reporting period. The next detailed progress report, including updated cost variance figures, will be submitted to the project owner at the end of next week."
      }
    },
    hospitality: {
      title:"Guest Complaint Response Letter",
      situation:"A hotel guest has raised a complaint about their recent stay.",
      task:"Type the guest service response.",
      career:"This activity simulates guest relations and service recovery communication commonly handled by Hospitality and Tourism professionals.",
      texts:{
        easy:"Thank you very much for taking the time to share your feedback with us regarding your recent stay at our hotel, and please accept our sincere apologies for the issues you experienced with the air conditioning in your room. We completely understand how uncomfortable this must have been, especially considering how warm the weather has been lately in our area. Our maintenance team has since inspected the unit in your room and confirmed that the problem has now been fully repaired and is working properly again. As a gesture of goodwill for the inconvenience caused during your stay, we would like to offer you a complimentary night at our hotel that you may use at any time within the next twelve months. We truly value you as one of our guests and sincerely hope that you will give us the opportunity to welcome you back again very soon.",
        medium:"Thank you for taking the time to share your detailed feedback regarding your recent stay with us, and please accept our sincere apologies for the discomfort caused by the malfunctioning air conditioning unit in your assigned room during a particularly warm week in our city. We fully understand how this issue would have significantly affected the overall quality of your stay, especially given that you had specifically requested a quiet and comfortable room for what we understand was a special anniversary celebration. Our maintenance team was immediately dispatched following your initial complaint and has since confirmed that the unit has been fully repaired and thoroughly tested to ensure the issue does not occur again for future guests staying in that particular room. As a gesture of goodwill and in recognition of the inconvenience experienced during your stay, we would like to offer you a complimentary one night stay in one of our upgraded suites, valid for use at any time within the next twelve months from today. We genuinely value your continued loyalty as a returning guest and sincerely hope you will allow us the opportunity to provide you with the exceptional experience you truly deserve on your next visit.",
        hard:"Thank you sincerely for taking the time to share such detailed feedback regarding your recent three night stay with us, and please accept our most sincere apologies for the considerable discomfort caused by the malfunctioning air conditioning unit in your assigned suite during what was, by all accounts, an unusually warm week across the entire region. We fully recognize how significantly this issue would have affected the overall quality of your stay, particularly given that this visit was intended to celebrate your fifteenth wedding anniversary, an occasion that our team deeply regrets not being able to make as memorable as it truly deserved to be under the circumstances. Upon receiving your initial complaint through our front desk team, our maintenance department was dispatched within the hour and has since confirmed that the unit has been fully repaired, thoroughly pressure tested, and inspected a second time the following morning to ensure the same issue does not recur for any future guests assigned to that particular suite. As a gesture of genuine goodwill, and in recognition of the significant inconvenience experienced throughout your stay, we would like to offer you a complimentary two night stay in one of our premier oceanview suites, along with a private dinner reservation at our rooftop restaurant, both of which remain valid for use at any time within the next eighteen months from today's date. We deeply value your continued loyalty as a long standing guest of our hotel and sincerely hope that you will grant us the opportunity to restore your confidence in us during your very next visit."
      }
    }
  };

  function getTypingLevel(wpm){
    if(wpm < 30) return 'Beginner';
    if(wpm < 46) return 'Developing';
    if(wpm < 61) return 'Competent';
    if(wpm < 76) return 'Professional';
    return 'Advanced Professional';
  }

  // Splits a base scenario paragraph into sentence-bounded short/medium/long variants
  function sliceByLength(text, length){
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    let count;
    if(length === 'short') count = Math.min(2, sentences.length);
    else if(length === 'long') count = sentences.length;
    else count = Math.min(4, sentences.length);
    return sentences.slice(0, count).join(' ').trim();
  }

  const TYPING_HISTORY_KEY = 'dctp_typing_history';
  const typingCfg = { industry:'it', difficulty:'medium', duration:60, length:'medium' };
  let typingState = null; // active run state

  function renderPillGroup(containerId, options, currentValue, onSelect){
    const el = document.getElementById(containerId);
    if(!el) return;
    el.innerHTML = options.map(opt => `
      <button type="button" class="track-pill ${opt.value === currentValue ? 'active' : ''}" data-value="${escapeHtml(String(opt.value))}">${escapeHtml(opt.label)}</button>
    `).join('');
    el.querySelectorAll('.track-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        onSelect(btn.dataset.value);
        el.querySelectorAll('.track-pill').forEach(b => b.classList.toggle('active', b === btn));
      });
    });
  }

  function renderTypingSetup(){
    renderPillGroup('typing-industry-pills', TYPING_INDUSTRIES.map(i => ({ value:i.key, label:i.label })), typingCfg.industry, v => typingCfg.industry = v);
    renderPillGroup('typing-difficulty-pills', [{value:'easy',label:'Easy'},{value:'medium',label:'Medium'},{value:'hard',label:'Hard'}], typingCfg.difficulty, v => typingCfg.difficulty = v);
    renderPillGroup('typing-duration-pills', [{value:'30',label:'30 Seconds'},{value:'60',label:'60 Seconds'},{value:'120',label:'120 Seconds'}], String(typingCfg.duration), v => typingCfg.duration = parseInt(v,10));
    renderPillGroup('typing-length-pills', [{value:'short',label:'Short'},{value:'medium',label:'Medium'},{value:'long',label:'Long'}], typingCfg.length, v => typingCfg.length = v);
  }

  function generateTypingChallenge(){
    const scenario = TYPING_SCENARIOS[typingCfg.industry];
    const industryMeta = TYPING_INDUSTRIES.find(i => i.key === typingCfg.industry);
    const baseText = scenario.texts[typingCfg.difficulty];
    const targetText = sliceByLength(baseText, typingCfg.length);

    typingState = {
      industry: typingCfg.industry, difficulty: typingCfg.difficulty, duration: typingCfg.duration,
      targetText, typedLength:0, correctChars:0, incorrectChars:0, startTime:null, timerId:null,
      secondsLeft: typingCfg.duration, finished:false, wpmSamples:[]
    };

    document.getElementById('typing-scenario-industry-tag').textContent = industryMeta.label + ' · ' + industryMeta.type;
    document.getElementById('typing-scenario-title').textContent = scenario.title;
    document.getElementById('typing-scenario-situation').textContent = scenario.situation;
    document.getElementById('typing-scenario-task').textContent = scenario.task;

    document.getElementById('typing-setup-card').style.display = 'none';
    document.getElementById('typing-scenario-card').style.display = '';
    document.getElementById('typing-arena-card').style.display = 'none';
    document.getElementById('typing-result-card').style.display = 'none';
  }

  // Returns the start/end character index of every whitespace-separated word
  // in the target text, computed once per challenge and cached on typingState
  // so re-renders on every keystroke don't repeat the scan.
  function getTypingWordSpans(target){
    const words = [];
    const re = /\S+/g;
    let m;
    while((m = re.exec(target))) words.push({ start:m.index, end:m.index + m[0].length });
    return words;
  }

  function renderTypingTextDisplay(){
    const display = document.getElementById('typing-text-display');
    const target = typingState.targetText;
    const typed = document.getElementById('typing-input').value;
    const currentIndex = typed.length;
    const words = typingState.wordSpans || (typingState.wordSpans = getTypingWordSpans(target));
    // The "current" word is the first one not yet fully typed; once the whole
    // text is typed, every word.end <= currentIndex so this stays -1 and every
    // word below falls into the "done" branch instead.
    const currentWordIdx = words.findIndex(w => w.end > currentIndex);

    let html = '';
    let i = 0;
    let wordPos = 0;
    while(i < target.length){
      const ch = target[i];
      if(/\s/.test(ch)){
        const cls = i < currentIndex ? (typed[i] === ch ? 'tc-correct' : 'tc-incorrect') : (i === currentIndex ? 'tc-current' : '');
        html += `<span class="${cls}">${escapeHtml(ch)}</span>`;
        i++;
        continue;
      }
      const w = words[wordPos];
      let inner = '';
      for(let j = w.start; j < w.end; j++){
        const c = target[j];
        const cls = j < currentIndex ? (typed[j] === c ? 'tc-correct' : 'tc-incorrect') : (j === currentIndex ? 'tc-current' : '');
        inner += `<span class="${cls}">${escapeHtml(c)}</span>`;
      }
      const state = w.end <= currentIndex ? 'ty-word-done' : (wordPos === currentWordIdx ? 'ty-word-current' : 'ty-word-upcoming');
      const idAttr = state === 'ty-word-current' ? ' id="ty-current-word"' : '';
      html += `<span class="ty-word ${state}"${idAttr}>${inner}</span>`;
      i = w.end;
      wordPos++;
    }
    display.innerHTML = html;
    scrollTypingToCurrentWord();
  }

  // Keeps the active word vertically centered inside the fixed-height typing
  // box so the user never has to drag the scrollbar to see where they are.
  function scrollTypingToCurrentWord(){
    const container = document.getElementById('typing-text-display');
    const current = document.getElementById('ty-current-word') || container.querySelector('.tc-current');
    if(!container || !current) return;
    const containerRect = container.getBoundingClientRect();
    const currentRect = current.getBoundingClientRect();
    const offset = (currentRect.top - containerRect.top) - (container.clientHeight / 2) + (currentRect.height / 2);
    if(Math.abs(offset) > 2) container.scrollBy({ top:offset, behavior:'smooth' });
  }

  function renderTypingLiveStats(wpm, accuracy, errors, elapsed, remainingChars, completionPct){
    const el = document.getElementById('typing-live-stats');
    const stats = [
      { label:'WPM', value: wpm },
      { label:'Accuracy', value: accuracy + '%' },
      { label:'Errors', value: errors },
      { label:'Completion', value: completionPct + '%' },
      { label:'Elapsed', value: elapsed + 's' }
    ];
    el.innerHTML = stats.map(s => `
      <div class="typing-live-stat"><div class="tls-value">${s.value}</div><div class="tls-label">${escapeHtml(s.label)}</div></div>
    `).join('');
    document.getElementById('typing-remaining-chars').textContent = remainingChars + ' characters left';
  }

  function computeLiveMetrics(){
    const typed = document.getElementById('typing-input').value;
    const target = typingState.targetText;
    let correct = 0, incorrect = 0;
    for(let i = 0; i < typed.length; i++){
      if(i >= target.length) break;
      if(typed[i] === target[i]) correct++; else incorrect++;
    }
    typingState.correctChars = correct;
    typingState.incorrectChars = incorrect;
    typingState.typedLength = typed.length;
    const elapsedMs = typingState.startTime ? (Date.now() - typingState.startTime) : 0;
    const elapsedSec = Math.max(1, Math.round(elapsedMs / 1000));
    const safeElapsedMs = Math.max(elapsedMs, 800); // floors WPM spikes from near-instant input (paste, first keystroke)
    const wpm = Math.round((correct / 5) / (safeElapsedMs / 60000));
    const accuracy = (correct + incorrect) > 0 ? Math.round((correct / (correct + incorrect)) * 100) : 100;
    const completionPct = Math.min(100, Math.round((typed.length / target.length) * 100));
    const remainingChars = Math.max(0, target.length - typed.length);
    return { wpm: isFinite(wpm) ? Math.max(0, wpm) : 0, accuracy, elapsedSec, completionPct, remainingChars, correct, incorrect };
  }

  function startTypingTimerIfNeeded(){
    if(typingState.timerId) return;
    typingState.startTime = Date.now();
    typingState.timerId = setInterval(() => {
      typingState.secondsLeft--;
      const m = computeLiveMetrics();
      typingState.wpmSamples.push(m.wpm);
      document.getElementById('typing-timer').textContent = Math.max(0, typingState.secondsLeft) + 's';
      if(typingState.secondsLeft <= 0){
        finishTypingChallenge();
      }
    }, 1000);
  }

  function handleTypingInput(){
    if(typingState.finished) return;
    startTypingTimerIfNeeded();
    renderTypingTextDisplay();
    const m = computeLiveMetrics();
    renderTypingLiveStats(m.wpm, m.accuracy, m.incorrect, m.elapsedSec, m.remainingChars, m.completionPct);
    document.getElementById('typing-progress-fill').style.width = m.completionPct + '%';
    const typed = document.getElementById('typing-input').value;
    if(typed.length >= typingState.targetText.length){
      finishTypingChallenge();
    }
  }

  function computeConsistency(samples){
    if(samples.length < 2) return 100;
    const mean = samples.reduce((a,b)=>a+b,0) / samples.length;
    const variance = samples.reduce((a,b)=>a + Math.pow(b-mean,2), 0) / samples.length;
    const stdev = Math.sqrt(variance);
    return Math.max(0, Math.round(100 - Math.min(60, stdev * 3)));
  }

  function generateTypingFeedback(wpm, accuracy){
    if(accuracy < 85) return 'Focus on improving accuracy — slow down slightly to reduce errors, then rebuild speed.';
    if(accuracy >= 95 && wpm >= 60) return 'Excellent typing speed and accuracy — you are workplace ready.';
    if(accuracy >= 90 && wpm < 45) return 'Great job maintaining high accuracy. Now work on building your speed.';
    if(wpm >= 45 && accuracy >= 90) return 'Solid, balanced performance. Keep practicing to push both numbers higher.';
    return 'Steady effort — consistent daily practice will improve both your speed and accuracy.';
  }

  function finishTypingChallenge(){
    if(typingState.finished) return;
    typingState.finished = true;
    if(typingState.timerId){ clearInterval(typingState.timerId); typingState.timerId = null; }
    document.getElementById('typing-input').disabled = true;

    const m = computeLiveMetrics();
    const consistency = computeConsistency(typingState.wpmSamples);
    const level = getTypingLevel(m.wpm);
    const feedback = generateTypingFeedback(m.wpm, m.accuracy);
    const scenario = TYPING_SCENARIOS[typingState.industry];
    const industryMeta = TYPING_INDUSTRIES.find(i => i.key === typingState.industry);

    const session = {
      industry: industryMeta.label, difficulty: typingState.difficulty, wpm: m.wpm, accuracy: m.accuracy,
      errors: m.incorrect, charsTyped: typingState.typedLength, consistency, level,
      date: new Date().toISOString()
    };
    const history = load(TYPING_HISTORY_KEY, []);
    history.unshift(session);
    save(TYPING_HISTORY_KEY, history.slice(0, 100));

    document.getElementById('typing-arena-card').style.display = 'none';
    document.getElementById('typing-scenario-card').style.display = 'none';
    document.getElementById('typing-result-card').style.display = '';
    document.getElementById('typing-result-ring').innerHTML = progressRing(m.accuracy, { color:'var(--gold)' });
    document.getElementById('typing-result-level').textContent = level;
    document.getElementById('typing-result-feedback').textContent = feedback;
    document.getElementById('typing-career-connection').textContent = scenario.career;

    const resultStats = [
      { label:'Final WPM', value:m.wpm },
      { label:'Accuracy', value:m.accuracy + '%' },
      { label:'Mistakes', value:m.incorrect },
      { label:'Characters Typed', value:typingState.typedLength },
      { label:'Typing Time', value:(typingCfg.duration - Math.max(0, typingState.secondsLeft)) + 's' },
      { label:'Consistency', value:consistency + '%' }
    ];
    document.getElementById('typing-result-stats').innerHTML = resultStats.map(s => `
      <div class="stat-card"><div class="label">${escapeHtml(s.label)}</div><div class="value">${s.value}</div></div>
    `).join('');

    renderTypingStats();
    renderTypingHistory();
    renderTypingAchievements();
    renderTypingChart();
  }

  function resetTypingArena(){
    document.getElementById('typing-input').value = '';
    document.getElementById('typing-input').disabled = false;
    document.getElementById('typing-timer').textContent = typingCfg.duration + 's';
    document.getElementById('typing-progress-fill').style.width = '0%';
    renderTypingTextDisplay();
    const m = computeLiveMetrics();
    renderTypingLiveStats(0, 100, 0, 0, typingState.targetText.length, 0);
  }

  function renderTypingStats(){
    const el = document.getElementById('typing-stats');
    if(!el) return;
    const history = load(TYPING_HISTORY_KEY, []);
    const bestWpm = history.length ? Math.max(...history.map(h => h.wpm)) : 0;
    const avgAccuracy = history.length ? Math.round(history.reduce((a,h) => a + h.accuracy, 0) / history.length) : 0;
    const completed = history.length;
    const currentLevel = history.length ? history[0].level : '—';
    const stats = [
      { label:'Best WPM', value:bestWpm },
      { label:'Average Accuracy', value:avgAccuracy + '%' },
      { label:'Completed Simulations', value:completed },
      { label:'Current Typing Level', value:currentLevel }
    ];
    el.innerHTML = stats.map(s => `
      <div class="stat-card"><div class="label">${escapeHtml(s.label)}</div><div class="value">${s.value}</div></div>
    `).join('');
  }

  function renderTypingHistory(){
    const history = load(TYPING_HISTORY_KEY, []);
    const rows = document.getElementById('typing-history-rows');
    const empty = document.getElementById('typing-history-empty');
    if(!rows) return;
    if(history.length === 0){
      rows.innerHTML = '';
      if(empty) empty.style.display = '';
      return;
    }
    if(empty) empty.style.display = 'none';
    rows.innerHTML = history.slice(0, 15).map(h => `
      <tr>
        <td>${escapeHtml(h.industry)}</td>
        <td>${escapeHtml(h.difficulty)}</td>
        <td>${h.wpm}</td>
        <td>${h.accuracy}%</td>
        <td>${new Date(h.date).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  function renderTypingAchievements(){
    const el = document.getElementById('typing-achievements');
    if(!el) return;
    const history = load(TYPING_HISTORY_KEY, []);
    const bestWpm = history.length ? Math.max(...history.map(h => h.wpm)) : 0;
    const bestAccuracy = history.length ? Math.max(...history.map(h => h.accuracy)) : 0;
    const badges = [
      { label:'First Simulation', sub:'Completed your first workplace simulation', unlocked: history.length >= 1 },
      { label:'50 WPM', sub:'Reached 50 words per minute', unlocked: bestWpm >= 50 },
      { label:'70 WPM', sub:'Reached 70 words per minute', unlocked: bestWpm >= 70 },
      { label:'95% Accuracy', sub:'Typed a session at 95% or higher', unlocked: bestAccuracy >= 95 },
      { label:'10 Simulations', sub:'Completed ten workplace simulations', unlocked: history.length >= 10 },
      { label:'Typing Professional', sub:'Reached Professional level or higher', unlocked: bestWpm >= 61 }
    ];
    el.innerHTML = badges.map(b => `
      <div class="badge-tile ${b.unlocked ? 'unlocked' : ''}">
        <span class="badge-shape">★</span>
        <div class="badge-label">${escapeHtml(b.label)}</div>
        <div class="badge-sub">${escapeHtml(b.sub)}</div>
      </div>
    `).join('');
  }

  let typingChartInstance = null;
  function renderTypingChart(){
    const canvas = document.getElementById('typing-chart');
    const emptyMsg = document.getElementById('typing-chart-empty');
    if(!canvas || typeof Chart === 'undefined') return;
    const history = load(TYPING_HISTORY_KEY, []).slice(0, 15).reverse();
    if(history.length === 0){
      if(emptyMsg) emptyMsg.style.display = '';
      canvas.style.display = 'none';
      return;
    }
    if(emptyMsg) emptyMsg.style.display = 'none';
    canvas.style.display = '';
    const labels = history.map((h,i) => 'Session ' + (i+1));
    const wpmData = history.map(h => h.wpm);
    if(typingChartInstance){
      typingChartInstance.data.labels = labels;
      typingChartInstance.data.datasets[0].data = wpmData;
      typingChartInstance.update();
      return;
    }
    const styles = getComputedStyle(document.documentElement);
    typingChartInstance = new Chart(canvas.getContext('2d'), {
      type:'line',
      data:{ labels, datasets:[{
        label:'WPM', data:wpmData, borderColor:'#2563EB', backgroundColor:'rgba(37,99,235,.12)',
        tension:0.35, fill:true, pointRadius:4, pointBackgroundColor:'#1E40AF', borderWidth:2
      }]},
      options:{
        responsive:true, plugins:{ legend:{ display:false } },
        scales:{
          y:{ beginAtZero:true, grid:{ color:'rgba(148,163,184,.18)' } },
          x:{ grid:{ display:false } }
        }
      }
    });
  }

  function initTypingChallenge(){
    if(!document.getElementById('view-typing')) return;
    renderTypingSetup();
    renderTypingStats();
    renderTypingHistory();
    renderTypingAchievements();
    renderTypingChart();

    document.getElementById('typing-generate').addEventListener('click', generateTypingChallenge);

    document.getElementById('typing-begin').addEventListener('click', () => {
      document.getElementById('typing-scenario-card').style.display = 'none';
      document.getElementById('typing-arena-card').style.display = '';
      resetTypingArena();
      document.getElementById('typing-input').focus();
    });

    document.getElementById('typing-input').addEventListener('input', handleTypingInput);

    document.getElementById('typing-restart').addEventListener('click', () => {
      if(typingState.timerId){ clearInterval(typingState.timerId); typingState.timerId = null; }
      typingState.finished = false;
      typingState.secondsLeft = typingCfg.duration;
      typingState.startTime = null;
      typingState.wpmSamples = [];
      resetTypingArena();
    });

    document.getElementById('typing-practice-again').addEventListener('click', () => {
      generateTypingChallenge();
    });
    document.getElementById('typing-change-industry').addEventListener('click', () => {
      document.getElementById('typing-result-card').style.display = 'none';
      document.getElementById('typing-setup-card').style.display = '';
    });
    document.getElementById('typing-view-progress').addEventListener('click', () => {
      document.getElementById('typing-chart-card').scrollIntoView({ behavior:'smooth', block:'start' });
    });
    document.getElementById('typing-return-dashboard').addEventListener('click', () => {
      showView('dashboard');
    });

    const motivations = [
      'Practice daily to improve workplace productivity.',
      'Small improvements every day lead to professional confidence.',
      'Speed comes with repetition — accuracy comes with focus.'
    ];
    const mEl = document.getElementById('typing-motivation');
    if(mEl) mEl.innerHTML = `<span>Keep Going</span>${escapeHtml(motivations[Math.floor(Math.random()*motivations.length)])}`;
  }

  /* ---------------- INIT ---------------- */
  initTypingChallenge();
  renderDashboard();
  syncTopbarChrome();

})();