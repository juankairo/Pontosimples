/* ===================== DATA STORE ===================== */
const DB = {
  get(key) { try { return JSON.parse(localStorage.getItem('sp_' + key)) || []; } catch { return []; } },
  set(key, val) { localStorage.setItem('sp_' + key, JSON.stringify(val)); },
  getObj(key, def = null) { try { return JSON.parse(localStorage.getItem('sp_' + key)) || def; } catch { return def; } },
  setObj(key, val) { localStorage.setItem('sp_' + key, JSON.stringify(val)); }
};

/* ===================== ROUTE GUARD ===================== */
(function checkAuth() {
  const path = window.location.pathname;
  const isAdmPage = path.includes('/pages/adm/');
  const user = DB.getObj('currentUser', null);

  if (isAdmPage && !user) {
    window.location.href = '/pages/login/index.html';
  }
})();

/* ===================== INIT ===================== */
function initData() {
  const versionKey = 'sp_v4';
  if (localStorage.getItem(versionKey)) return;
  
  const users = [
    { id: 1, name: 'Administrador', email: 'admin@stylleponto.com', password: 'ponto123', role: 'admin', status: 'ativo', createdAt: '2026-01-01', bankBalance: 0 },
    { id: 2, name: 'Juan Kairo', email: 'juankairo21@gmail.com', password: 'ponto123', role: 'admin', status: 'ativo', createdAt: '2026-01-01', bankBalance: 0 },
  ];

  const companies = [];
  const sectors = [];
  const functions = [];
  const workloads = [
    { id: 1, name: '8h Diárias', hoursPerDay: 8, type: 'standard' },
    { id: 2, name: '6h Diárias', hoursPerDay: 6, type: 'standard' }
  ];

  const justifications = [
    { id: 1, name: 'Atestado Médico' },
    { id: 2, name: 'Licença' },
    { id: 3, name: 'Falta Justificada' },
    { id: 4, name: 'Serviço Externo' }
  ];

  const holidays = [
    { id: 1, date: '2026-01-01', name: 'Confraternização Universal', companyId: null },
    { id: 2, date: '2026-02-16', name: 'Carnaval', companyId: null },
    { id: 3, date: '2026-04-03', name: 'Paixão de Cristo', companyId: null },
    { id: 4, date: '2026-04-21', name: 'Tiradentes', companyId: null },
    { id: 5, date: '2026-05-01', name: 'Dia do Trabalho', companyId: null },
    { id: 6, date: '2026-06-04', name: 'Corpus Christi', companyId: null },
    { id: 7, date: '2026-09-07', name: 'Independência do Brasil', companyId: null },
    { id: 8, date: '2026-10-12', name: 'Nossa Senhora Aparecida', companyId: null },
    { id: 9, date: '2026-11-02', name: 'Finados', companyId: null },
    { id: 10, date: '2026-11-15', name: 'Proclamação da República', companyId: null },
    { id: 11, date: '2026-12-25', name: 'Natal', companyId: null }
  ];

  const records = [];
  const bank = [];
  const audit = [
    { id: 1, date: '2026-06-27', time: '00:00', user: 'Administrador', action: 'Sistema redefinido (Limpeza de dados)', record: '-' }
  ];

  DB.set('users', users);
  DB.set('companies', companies);
  DB.set('sectors', sectors);
  DB.set('functions', functions);
  DB.set('workloads', workloads);
  DB.set('justifications', justifications);
  DB.set('holidays', holidays);
  DB.set('records', records);
  DB.set('bank', bank);
  DB.set('audit', audit);
  DB.set('notifications', []);
  DB.setObj('settings', {
    systemName: 'Ponto Eletrônico', primaryColor: '#0b1d4d', secondaryColor: '#2563EB',
    senderEmail: 'noreply@stylleponto.com', delayTolerance: 10, overtimeMinimum: 10
  });
  
  localStorage.setItem(versionKey, '1');
  DB.setObj('currentUser', null);
}

/* ===================== CURRENT USER ===================== */
function getCurrentUser() {
  return DB.getObj('currentUser', null);
}

function logout() {
  DB.setObj('currentUser', null);
  window.location.href = '/pages/login/index.html';
}

/* ===================== AUDIT ===================== */
function logAudit(action, record='-') {
  const user = getCurrentUser();
  if (!user) return;
  const audit = DB.get('audit');
  const now = new Date();
  audit.unshift({
    id: Date.now(),
    date: now.toLocaleDateString('pt-BR'),
    time: now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}),
    user: user.name, action, record
  });
  DB.set('audit', audit);
}

/* ===================== NOTIFICATIONS ===================== */
function addNotification(text) {
  const notifs = DB.get('notifications');
  notifs.unshift({ id:Date.now(), text, read:false, date:new Date().toLocaleDateString('pt-BR') });
  DB.set('notifications', notifs);
}
function getUnreadCount() { return DB.get('notifications').filter(n=>!n.read).length; }

/* ===================== HELPERS ===================== */
function avatar(name) { return (name||'?').charAt(0).toUpperCase(); }
function fmtDate(d) { if(!d) return '-'; const [y,m,dd]=d.split('-'); return `${dd}/${m}/${y}`; }
function nextId(arr) { return arr.length ? Math.max(...arr.map(x=>x.id))+1 : 1; }

function getCompanyName(id) { return DB.get('companies').find(c=>c.id===id)?.name || '-'; }
function getSectorName(id) { return DB.get('sectors').find(s=>s.id===id)?.name || '-'; }
function getSectorNames(ids=[]) {
  if (typeof ids === 'number') ids = [ids];
  const sectors = DB.get('sectors');
  return (ids||[]).map(id=>sectors.find(s=>s.id===id)?.name).filter(Boolean).join(', ') || '-';
}
function getWorkloadName(id) { return DB.get('workloads').find(w=>w.id===id)?.name || '-'; }
function getFunctionName(id) { return DB.get('functions').find(f=>f.id===id)?.name || '-'; }
function getFunctionNames(ids=[]) {
  const fns = DB.get('functions');
  return ids.map(id=>fns.find(f=>f.id===id)?.name).filter(Boolean).join(', ') || '-';
}

function toast(msg, type='success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=>t.classList.add('show'), 10);
  setTimeout(()=>{ t.classList.remove('show'); setTimeout(()=>t.remove(),300); }, 3000);
}

function confirmDlg(msg, cb) {
  if (confirm(msg)) cb();
}

/* ===================== SIDEBAR SVG LOGO ===================== */
const LOGO_SVG = `<svg width="155" height="42" viewBox="0 0 220 60" fill="none" xmlns="http://www.w3.org/2000/svg">
  <circle cx="30" cy="30" r="20" stroke="#FFFFFF" stroke-width="5" stroke-linecap="round" stroke-dasharray="85 35"/>
  <circle cx="30" cy="30" r="20" stroke="#2563EB" stroke-width="5" stroke-linecap="round" stroke-dasharray="35 85"/>
  <path d="M22 30 L28 36 L40 24" stroke="#2563EB" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="65" y="28" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="#FFFFFF">PONTO</text>
  <text x="65" y="46" font-family="Inter, Arial, sans-serif" font-size="10" letter-spacing="2" fill="#60A5FA">ELETRÔNICO</text>
</svg>`;

/* ===================== SIDEBAR RENDER ===================== */
function renderSidebar() {
  const page = window.location.pathname.split('/').pop() || 'dashboard.html';
  const pending = DB.get('users').filter(u=>u.status==='pendente').length;
  
  const pages_usuarios = ['solicitacoes.html','associar.html'];
  const pages_registrar = ['empresas.html','setores-funcoes.html','feriados.html','carga-horaria.html','justificativas.html'];

  const link = (href, label, icon) => {
    const isCurrent = href.endsWith(page) || (page === 'index.html' && href.endsWith('dashboard.html'));
    return `
      <a href="${href}" class="nav-item ${isCurrent?'active':''}">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icon}</svg>
        ${label}
      </a>`;
  };

  const user = getCurrentUser() || { name: 'Usuário', role: 'funcionario' };
  const userRoleLabel = user.role === 'admin' ? 'Administrador' : user.role === 'supervisor' ? 'Supervisor' : 'Funcionário';

  let navItemsHtml = '';

  if (user.role === 'admin' || user.role === 'rh') {
    navItemsHtml = `
      ${link('/pages/adm/dashboard.html','Dashboard','<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>')}

      <div class="nav-item nav-expandable ${pages_usuarios.includes(page)?'open active-parent':''}" onclick="toggleMenu(this)">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5"/><circle cx="17.5" cy="8.5" r="2.7"/><path d="M16 13.7c2.7.3 4.8 2.7 4.8 5.6"/></svg>
        Usuários
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
        ${pending>0?`<span class="badge">${pending}</span>`:''}
      </div>
      <div class="sub-menu" style="display:${pages_usuarios.includes(page)?'flex':'none'}">
        <a href="/pages/adm/solicitacoes.html" class="nav-sub ${page==='solicitacoes.html'?'active':''}">Aceitar Solicitações ${pending>0?`<span class="badge-sm">${pending}</span>`:''}</a>
        <a href="/pages/adm/associar.html" class="nav-sub ${page==='associar.html'?'active':''}">Associar Funcionários</a>
      </div>

      ${link('/pages/adm/relatorios.html','Relatórios','<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>')}
      ${link('/pages/adm/cartao-ponto.html','Cartão de Ponto','<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3"/>')}
      ${link('/pages/adm/banco-horas.html','Banco de Horas','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>')}

      <div class="nav-item nav-expandable ${pages_registrar.includes(page)?'open active-parent':''}" onclick="toggleMenu(this)">
        <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        Registrar
        <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      <div class="sub-menu" style="display:${pages_registrar.includes(page)?'flex':'none'}">
        <a href="/pages/adm/empresas.html" class="nav-sub ${page==='empresas.html'?'active':''}">Empresas</a>
        <a href="/pages/adm/setores-funcoes.html" class="nav-sub ${page==='setores-funcoes.html'?'active':''}">Setores e Funções</a>
        <a href="/pages/adm/feriados.html" class="nav-sub ${page==='feriados.html'?'active':''}">Feriados</a>
        <a href="/pages/adm/carga-horaria.html" class="nav-sub ${page==='carga-horaria.html'?'active':''}">Carga Horária</a>
        <a href="/pages/adm/justificativas.html" class="nav-sub ${page==='justificativas.html'?'active':''}">Justificativas</a>
      </div>

      ${link('/pages/adm/auditoria.html','Auditoria','<path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>')}
      ${link('/pages/adm/configuracoes.html','Configurações','<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>')}
    `;
  } else if (user.role === 'supervisor') {
    navItemsHtml = `
      ${link('/pages/adm/dashboard.html','Dashboard','<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>')}
      ${link('/pages/adm/banco-horas.html','Banco de Horas','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>')}
    `;
  } else {
    navItemsHtml = `
      ${link('/pages/adm/dashboard.html','Dashboard','<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>')}
      ${link('/pages/adm/cartao-ponto.html','Cartão de Ponto','<rect x="3" y="4.5" width="18" height="16" rx="2"/><path d="M3 9.5h18M8 3v3M16 3v3"/>')}
      ${link('/pages/adm/banco-horas.html','Banco de Horas','<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>')}
    `;
  }

  const html = `<aside class="sidebar">
    <div class="logo">${LOGO_SVG}</div>
    <div class="menu-label">MENU</div>
    <nav>
      ${navItemsHtml}
    </nav>
    <div class="sidebar-footer" style="display:flex; align-items:center; justify-content:space-between; width:100%; gap:8px;">
      <div style="display:flex; align-items:center; gap:8px; overflow:hidden; flex:1;">
        <div class="avatar avatar-sm">${avatar(user.name)}</div>
        <div style="overflow:hidden;">
          <div class="sf-name" style="white-space:nowrap; text-overflow:ellipsis; overflow:hidden; font-weight:600; font-size:13px;">${user.name}</div>
          <span class="badge-admin-small">${userRoleLabel}</span>
        </div>
      </div>
      <button onclick="logout()" title="Sair" style="background:none; border:none; color:rgba(255,255,255,0.6); cursor:pointer; padding:6px; display:flex; align-items:center; justify-content:center; transition:color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='rgba(255,255,255,0.6)'">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  </aside>`;
  document.getElementById('sidebar-container').innerHTML = html;
}

/* ===================== TOPBAR ===================== */
function renderTopbar(title, sub='') {
  const unread = getUnreadCount();
  const user = getCurrentUser() || { role: 'funcionario' };
  const roleLabels = { admin: 'Administrador', supervisor: 'Supervisor', funcionario: 'Funcionário', rh: 'RH' };
  const roleLabel = roleLabels[user.role] || 'Usuário';

  document.getElementById('topbar-container').innerHTML = `
  <div class="top-row">
    <div>
      <h1>${title}</h1>
      ${sub?`<p>${sub}</p>`:''}
    </div>
    <div class="topbar-right">
      <div class="notif-btn" onclick="toggleNotifications()" title="Notificações">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
        ${unread>0?`<span class="notif-count">${unread}</span>`:''}
      </div>
      <div class="pill-admin">${roleLabel}</div>
    </div>
  </div>
  <div class="notif-panel" id="notifPanel" style="display:none">
    <div style="padding:12px 16px;border-bottom:1px solid var(--border);font-weight:700;font-size:13px;">Notificações</div>
    ${renderNotifItems()}
  </div>`;
}

function renderNotifItems() {
  const notifs = DB.get('notifications');
  if (!notifs.length) return '<p class="notif-empty">Nenhuma notificação</p>';
  return notifs.slice(0,10).map(n=>`
    <div class="notif-item ${n.read?'':'unread'}" onclick="markRead(${n.id})">
      <div class="notif-dot"></div>
      <div>
        <div class="notif-text">${n.text}</div>
        <div class="notif-date">${n.date}</div>
      </div>
    </div>`).join('');
}

function toggleNotifications() {
  const p = document.getElementById('notifPanel');
  p.style.display = p.style.display==='none'?'block':'none';
}

function markRead(id) {
  const notifs = DB.get('notifications');
  const n = notifs.find(x=>x.id===id);
  if (n) n.read = true;
  DB.set('notifications', notifs);
  renderTopbar(document.title.split(' - ')[0]);
}

function toggleMenu(el) {
  el.classList.toggle('open');
  const sub = el.nextElementSibling;
  sub.style.display = sub.style.display==='flex'?'none':'flex';
}

/* ===================== BOOT ===================== */
document.addEventListener('DOMContentLoaded', () => {
  initData();
  const path = window.location.pathname;
  // Só renderiza sidebar e topbar em páginas da adm
  if (path.includes('/pages/adm/')) {
    if (document.getElementById('sidebar-container')) renderSidebar();
    if (document.getElementById('topbar-container')) renderTopbar(document.title.split(' - ')[0] || 'Dashboard');
  }
  document.addEventListener('click', e => {
    if (!e.target.closest('.notif-btn') && !e.target.closest('.notif-panel')) {
      const p = document.getElementById('notifPanel');
      if (p) p.style.display = 'none';
    }
  });
});

/* ===================== HAMBURGER MENU ===================== */
function injectHamburger() {
  if (document.getElementById('hamburger')) return;
  const btn = document.createElement('div');
  btn.id = 'hamburger'; btn.className = 'hamburger';
  btn.innerHTML = '<span></span><span></span><span></span>';
  btn.onclick = toggleSidebar;
  document.body.appendChild(btn);

  const overlay = document.createElement('div');
  overlay.id = 'sidebarOverlay'; overlay.className = 'sidebar-overlay';
  overlay.onclick = closeSidebar;
  document.body.appendChild(overlay);
}

function toggleSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const btn = document.getElementById('hamburger');
  if (!sidebar) return;
  sidebar.classList.toggle('open');
  overlay.classList.toggle('open');
  btn.classList.toggle('open');
}

function closeSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const btn = document.getElementById('hamburger');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('open');
  if (btn) btn.classList.remove('open');
}

// Hook into renderSidebar
const _origRenderSidebar = renderSidebar;
renderSidebar = function() {
  _origRenderSidebar();
  injectHamburger();
};
