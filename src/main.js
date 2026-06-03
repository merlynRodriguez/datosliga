import './style.css';
import { supabase, getPublicUrl } from './supabaseClient.js';

// ============================================
// STATE
// ============================================
let currentView = 'form'; // 'form' | 'admin-list' | 'admin-detail'
let currentTeam = null;
let isAuthenticated = false;
let teams = [];

// File state
let logoFile = null;
let carnetAnversoFile = null;
let carnetReversoFile = null;
let galeriaFiles = [];

// ============================================
// SVG ICONS
// ============================================
const ICONS = {
  shield: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  upload: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
  camera: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  image: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
  send: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  lock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  arrow: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
  arrowLeft: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  download: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  logout: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
  close: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  trophy: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`,
  users: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  idCard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>`,
  text: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>`,
  gallery: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`,
};

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderApp() {
  const app = document.getElementById('app');

  if (currentView === 'form') {
    app.innerHTML = renderNavbar() + renderHero() + renderForm() + renderFooter();
    attachFormListeners();
  } else if (currentView === 'admin-list') {
    app.innerHTML = renderNavbar(true) + renderAdminList();
    attachAdminListListeners();
  } else if (currentView === 'admin-detail') {
    app.innerHTML = renderNavbar(true) + renderAdminDetail();
    attachAdminDetailListeners();
  }
}

function renderNavbar(isAdmin = false) {
  return `
    <nav class="navbar" id="navbar">
      <div class="navbar-brand">
        <img src="/logo.png" alt="Liga de Fútbol Vinto" class="navbar-logo" id="navbar-logo" />
        <div class="navbar-title-group">
          <h1 class="navbar-title">Datos de Equipos</h1>
          <p class="navbar-subtitle">Datos que aparecerán en el sistema de gestión digital de la liga de fútbol vinto</p>
        </div>
      </div>
      ${isAdmin
        ? `<button class="btn-logout" id="btn-logout">${ICONS.logout} Cerrar Sesión</button>`
        : `<button class="btn-admin" id="btn-admin">${ICONS.lock} Admin</button>`
      }
    </nav>
  `;
}

function renderHero() {
  return `
    <section class="hero-section">
      <div class="hero-badge">
        <span class="dot"></span>
        Registro abierto
      </div>
      <h2 class="hero-title">Registra tu <span>Equipo</span></h2>
      <p class="hero-description">
        Completa el formulario con los datos de tu club para aparecer en el sistema de gestión digital de la Liga de Fútbol Vinto.
      </p>
    </section>
  `;
}

function renderForm() {
  return `
    <div class="form-container">
      <form class="form-card" id="registration-form" novalidate>

        <!-- SECTION: Team Info -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="icon">${ICONS.trophy}</span>
            Información del Equipo
          </div>

          <div class="form-group">
            <label class="form-label" for="nombre_equipo">
              Nombre del Equipo / Club <span class="required">*</span>
            </label>
            <input
              type="text"
              id="nombre_equipo"
              class="form-input"
              placeholder="Ej: Club Deportivo Avaroa, Sixers F.C."
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="categoria">
              Categoría <span class="optional">(opcional)</span>
            </label>
            <input
              type="text"
              id="categoria"
              class="form-input"
              placeholder="Ej: Primeras de Honor, Primeras de Ascenso, Segundas de Ascenso..."
            />
          </div>
        </div>

        <div class="form-divider"></div>

        <!-- SECTION: Logo -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="icon">${ICONS.shield}</span>
            Logo del Equipo
          </div>

          <div class="form-group">
            <label class="form-label">
              Logo o escudo del equipo <span class="required">*</span>
            </label>
            <div class="upload-zone" id="logo-zone">
              <input type="file" id="logo-input" accept="image/*" capture="environment" />
              <div class="upload-icon">${ICONS.upload}</div>
              <div class="upload-text">
                <strong>Haz clic o arrastra</strong> para subir el logo de tu equipo
              </div>
              <div class="upload-hint">JPG, PNG o WEBP • Máximo 5MB</div>
            </div>
            <div class="upload-preview" id="logo-preview"></div>
          </div>
        </div>

        <div class="form-divider"></div>

        <!-- SECTION: Carnet -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="icon">${ICONS.idCard}</span>
            Carnet de Identidad del Encargado
          </div>

          <div class="form-group">
            <label class="form-label">
              Fotografías del carnet de identidad <span class="required">*</span>
            </label>
            <p style="font-size: 0.82rem; color: var(--gray-500); margin-bottom: var(--space-4);">
              Sube fotografías claras del anverso y reverso del carnet de identidad del encargado o representante del equipo.
            </p>
            <div class="carnet-grid">
              <div>
                <div class="carnet-label">📋 Anverso (frente)</div>
                <div class="upload-zone" id="carnet-anverso-zone">
                  <input type="file" id="carnet-anverso-input" accept="image/*" capture="environment" />
                  <div class="upload-icon">${ICONS.camera}</div>
                  <div class="upload-text">
                    <strong>Sube o toma foto</strong> del frente del carnet
                  </div>
                  <div class="upload-hint">JPG, PNG • Máximo 5MB</div>
                </div>
                <div class="upload-preview" id="carnet-anverso-preview"></div>
              </div>
              <div>
                <div class="carnet-label">📋 Reverso (dorso)</div>
                <div class="upload-zone" id="carnet-reverso-zone">
                  <input type="file" id="carnet-reverso-input" accept="image/*" capture="environment" />
                  <div class="upload-icon">${ICONS.camera}</div>
                  <div class="upload-text">
                    <strong>Sube o toma foto</strong> del reverso del carnet
                  </div>
                  <div class="upload-hint">JPG, PNG • Máximo 5MB</div>
                </div>
                <div class="upload-preview" id="carnet-reverso-preview"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="form-divider"></div>

        <!-- SECTION: History -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="icon">${ICONS.text}</span>
            Reseña Histórica
          </div>

          <div class="form-group">
            <label class="form-label" for="resena_historica">
              Breve reseña histórica del club <span class="optional">(opcional)</span>
            </label>
            <textarea
              id="resena_historica"
              class="form-textarea"
              placeholder="Cuéntanos la historia de tu club: año de fundación, logros más importantes, títulos ganados, trayectoria deportiva, jugadores destacados..."
            ></textarea>
          </div>
        </div>

        <div class="form-divider"></div>

        <!-- SECTION: Gallery -->
        <div class="form-section">
          <div class="form-section-title">
            <span class="icon">${ICONS.gallery}</span>
            Galería de Fotos
          </div>

          <div class="form-group">
            <label class="form-label">
              Fotografías del club <span class="optional">(opcional)</span>
            </label>
            <div class="upload-zone" id="galeria-zone">
              <input type="file" id="galeria-input" accept="image/*" multiple capture="environment" />
              <div class="upload-icon">${ICONS.image}</div>
              <div class="upload-text">
                <strong>Haz clic o arrastra</strong> para subir fotos del equipo, miembros o dirigentes
              </div>
              <div class="upload-hint">Puedes seleccionar múltiples imágenes • JPG, PNG o WEBP • Máximo 10MB cada una</div>
            </div>
            <div class="upload-preview" id="galeria-preview"></div>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="btn-submit" id="btn-submit">
          <span>Enviar Datos del Equipo</span>
          ${ICONS.send}
        </button>

        <div id="progress-area"></div>
      </form>
    </div>
  `;
}

function renderFooter() {
  return `
    <footer class="footer">
      © ${new Date().getFullYear()} <strong>Liga de Fútbol Vinto</strong> — Sistema de Gestión Digital
    </footer>
  `;
}

function renderAdminList() {
  return `
    <div class="admin-header">
      <h2 class="admin-header-title">Panel <span>Administrativo</span></h2>
    </div>
    <div class="admin-stats">
      <div class="stat-card">
        <div class="stat-value">${teams.length}</div>
        <div class="stat-label">Equipos registrados</div>
      </div>
    </div>
    ${teams.length === 0
      ? `<div class="empty-state">
           <div class="icon">⚽</div>
           <p>No hay equipos registrados aún</p>
           <p style="font-size: 0.82rem;">Los datos aparecerán aquí cuando los equipos completen el formulario</p>
         </div>`
      : `<div class="team-grid">
           ${teams.map(team => `
             <div class="team-card" data-team-id="${team.id}">
               <img
                 src="${team.logo_url}"
                 alt="${team.nombre_equipo}"
                 class="team-card-logo"
                 onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%231f2937%22 width=%2260%22 height=%2260%22/><text x=%2230%22 y=%2235%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2220%22>⚽</text></svg>'"
               />
               <div class="team-card-info">
                 <div class="team-card-name">${escapeHtml(team.nombre_equipo)}</div>
                 <div class="team-card-category">${team.categoria ? escapeHtml(team.categoria) : 'Sin categoría'}</div>
                 <div class="team-card-date">${formatDate(team.created_at)}</div>
               </div>
               <div class="team-card-arrow">${ICONS.arrow}</div>
             </div>
           `).join('')}
         </div>`
    }
    ${renderFooter()}
  `;
}

function renderAdminDetail() {
  const team = currentTeam;
  if (!team) return '';

  const galeriaUrls = team.galeria_urls || [];

  return `
    <div class="detail-container">
      <button class="btn-back" id="btn-back">${ICONS.arrowLeft} Volver a la lista</button>

      <div class="detail-header">
        <img
          src="${team.logo_url}"
          alt="${escapeHtml(team.nombre_equipo)}"
          class="detail-logo"
          onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%231f2937%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2260%22 text-anchor=%22middle%22 fill=%22%236b7280%22 font-size=%2232%22>⚽</text></svg>'"
        />
        <div>
          <div class="detail-team-name">${escapeHtml(team.nombre_equipo)}</div>
          <div class="detail-team-category">${team.categoria ? escapeHtml(team.categoria) : 'Sin categoría especificada'}</div>
          <div class="detail-team-date">Registrado el ${formatDate(team.created_at)}</div>
        </div>
      </div>

      <!-- Logo Download -->
      <div class="detail-section">
        <div class="detail-section-title">${ICONS.shield} Logo del Equipo</div>
        <div class="detail-images-grid">
          <div class="detail-image-item" data-url="${team.logo_url}" data-name="logo_${team.nombre_equipo}">
            <img src="${team.logo_url}" alt="Logo" />
            <div class="download-overlay">
              <button class="btn-download" onclick="event.stopPropagation();" data-download-url="${team.logo_url}" data-download-name="logo_${sanitizeFilename(team.nombre_equipo)}">${ICONS.download} Descargar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Carnet -->
      <div class="detail-section">
        <div class="detail-section-title">${ICONS.idCard} Carnet de Identidad</div>
        <div class="carnet-detail-grid">
          <div class="carnet-detail-item">
            <div class="carnet-detail-label">Anverso (frente)</div>
            <div class="detail-image-item" data-url="${team.carnet_anverso_url}" data-name="carnet_anverso_${team.nombre_equipo}">
              <img src="${team.carnet_anverso_url}" alt="Carnet Anverso" />
              <div class="download-overlay">
                <button class="btn-download" onclick="event.stopPropagation();" data-download-url="${team.carnet_anverso_url}" data-download-name="carnet_anverso_${sanitizeFilename(team.nombre_equipo)}">${ICONS.download} Descargar</button>
              </div>
            </div>
          </div>
          <div class="carnet-detail-item">
            <div class="carnet-detail-label">Reverso (dorso)</div>
            <div class="detail-image-item" data-url="${team.carnet_reverso_url}" data-name="carnet_reverso_${team.nombre_equipo}">
              <img src="${team.carnet_reverso_url}" alt="Carnet Reverso" />
              <div class="download-overlay">
                <button class="btn-download" onclick="event.stopPropagation();" data-download-url="${team.carnet_reverso_url}" data-download-name="carnet_reverso_${sanitizeFilename(team.nombre_equipo)}">${ICONS.download} Descargar</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${team.resena_historica ? `
      <!-- Reseña -->
      <div class="detail-section">
        <div class="detail-section-title">${ICONS.text} Reseña Histórica</div>
        <div class="detail-text">${escapeHtml(team.resena_historica)}</div>
      </div>
      ` : ''}

      ${galeriaUrls.length > 0 ? `
      <!-- Galería -->
      <div class="detail-section">
        <div class="detail-section-title">${ICONS.gallery} Galería de Fotos (${galeriaUrls.length} fotos)</div>
        <div class="detail-images-grid">
          ${galeriaUrls.map((url, i) => `
            <div class="detail-image-item" data-url="${url}" data-name="galeria_${i + 1}_${team.nombre_equipo}">
              <img src="${url}" alt="Foto ${i + 1}" />
              <div class="download-overlay">
                <button class="btn-download" onclick="event.stopPropagation();" data-download-url="${url}" data-download-name="galeria_${i + 1}_${sanitizeFilename(team.nombre_equipo)}">${ICONS.download} Descargar</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
    </div>
    ${renderFooter()}
  `;
}

// ============================================
// EVENT LISTENERS
// ============================================

function attachFormListeners() {
  // Admin button
  document.getElementById('btn-admin')?.addEventListener('click', showLoginModal);

  // File upload zones
  setupFileUpload('logo-input', 'logo-zone', 'logo-preview', (files) => {
    logoFile = files[0] || null;
  }, false);

  setupFileUpload('carnet-anverso-input', 'carnet-anverso-zone', 'carnet-anverso-preview', (files) => {
    carnetAnversoFile = files[0] || null;
  }, false);

  setupFileUpload('carnet-reverso-input', 'carnet-reverso-zone', 'carnet-reverso-preview', (files) => {
    carnetReversoFile = files[0] || null;
  }, false);

  setupFileUpload('galeria-input', 'galeria-zone', 'galeria-preview', (files) => {
    galeriaFiles = files;
  }, true);

  // Form submit
  document.getElementById('registration-form')?.addEventListener('submit', handleFormSubmit);
}

function attachAdminListListeners() {
  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);

  // Team cards
  document.querySelectorAll('.team-card').forEach(card => {
    card.addEventListener('click', () => {
      const teamId = card.dataset.teamId;
      currentTeam = teams.find(t => t.id === teamId);
      currentView = 'admin-detail';
      renderApp();
    });
  });
}

function attachAdminDetailListeners() {
  // Logout
  document.getElementById('btn-logout')?.addEventListener('click', handleLogout);

  // Back button
  document.getElementById('btn-back')?.addEventListener('click', () => {
    currentView = 'admin-list';
    currentTeam = null;
    renderApp();
  });

  // Image lightbox
  document.querySelectorAll('.detail-image-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.closest('.btn-download')) return;
      const url = item.dataset.url;
      const name = item.dataset.name;
      showLightbox(url, name);
    });
  });

  // Download buttons
  document.querySelectorAll('.btn-download').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.dataset.downloadUrl;
      const name = btn.dataset.downloadName;
      downloadImage(url, name);
    });
  });
}

// ============================================
// FILE UPLOAD SETUP
// ============================================

function setupFileUpload(inputId, zoneId, previewId, onFilesChange, multiple) {
  const input = document.getElementById(inputId);
  const zone = document.getElementById(zoneId);
  const preview = document.getElementById(previewId);

  if (!input || !zone || !preview) return;

  // Drag and drop
  zone.addEventListener('dragover', (e) => {
    e.preventDefault();
    zone.classList.add('dragover');
  });

  zone.addEventListener('dragleave', () => {
    zone.classList.remove('dragover');
  });

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    zone.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      if (!multiple) {
        const filesArr = [files[0]];
        onFilesChange(filesArr);
        renderPreviews(preview, filesArr, onFilesChange, multiple, zone);
      } else {
        const currentFiles = [...galeriaFiles, ...files];
        onFilesChange(currentFiles);
        renderPreviews(preview, currentFiles, onFilesChange, multiple, zone);
      }
    }
  });

  // File input change
  input.addEventListener('change', () => {
    const files = Array.from(input.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      if (!multiple) {
        onFilesChange(files);
        renderPreviews(preview, files, onFilesChange, multiple, zone);
      } else {
        const currentFiles = [...galeriaFiles, ...files];
        onFilesChange(currentFiles);
        renderPreviews(preview, currentFiles, onFilesChange, multiple, zone);
      }
    }
  });
}

function renderPreviews(previewContainer, files, onFilesChange, multiple, zone) {
  previewContainer.innerHTML = '';
  if (files.length > 0) {
    zone.classList.add('has-file');
  } else {
    zone.classList.remove('has-file');
  }

  files.forEach((file, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);
    img.alt = file.name;

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.textContent = '✕';
    removeBtn.type = 'button';
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const newFiles = files.filter((_, i) => i !== index);
      onFilesChange(newFiles.length > 0 ? newFiles : (multiple ? [] : null));
      renderPreviews(previewContainer, newFiles, onFilesChange, multiple, zone);
    });

    item.appendChild(img);
    item.appendChild(removeBtn);
    previewContainer.appendChild(item);
  });
}

// ============================================
// FORM SUBMISSION
// ============================================

async function handleFormSubmit(e) {
  e.preventDefault();

  const nombre = document.getElementById('nombre_equipo').value.trim();
  const categoria = document.getElementById('categoria').value.trim();
  const resena = document.getElementById('resena_historica').value.trim();

  // Validation
  if (!nombre) {
    showToast('Por favor ingresa el nombre del equipo', 'error');
    document.getElementById('nombre_equipo').focus();
    return;
  }
  if (!logoFile) {
    showToast('Por favor sube el logo de tu equipo', 'error');
    return;
  }
  if (!carnetAnversoFile) {
    showToast('Por favor sube la foto del anverso del carnet de identidad', 'error');
    return;
  }
  if (!carnetReversoFile) {
    showToast('Por favor sube la foto del reverso del carnet de identidad', 'error');
    return;
  }

  const submitBtn = document.getElementById('btn-submit');
  const progressArea = document.getElementById('progress-area');
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<div class="spinner"></div> <span>Subiendo datos...</span>`;

  // Show progress
  progressArea.innerHTML = `
    <div class="progress-container">
      <div class="progress-bar"><div class="progress-fill" id="progress-fill"></div></div>
      <div class="progress-text" id="progress-text">Preparando archivos...</div>
    </div>
  `;

  try {
    const timestamp = Date.now();
    const sanitizedName = sanitizeFilename(nombre);

    // Upload logo
    updateProgress(10, 'Subiendo logo del equipo...');
    const logoPath = `${sanitizedName}_${timestamp}/logo.${getExtension(logoFile)}`;
    const { error: logoError } = await supabase.storage
      .from('logos')
      .upload(logoPath, logoFile, { cacheControl: '3600', upsert: false });
    if (logoError) throw new Error(`Error subiendo logo: ${logoError.message}`);

    // Upload carnet anverso
    updateProgress(30, 'Subiendo carnet (anverso)...');
    const anversoPath = `${sanitizedName}_${timestamp}/anverso.${getExtension(carnetAnversoFile)}`;
    const { error: anversoError } = await supabase.storage
      .from('carnets')
      .upload(anversoPath, carnetAnversoFile, { cacheControl: '3600', upsert: false });
    if (anversoError) throw new Error(`Error subiendo carnet anverso: ${anversoError.message}`);

    // Upload carnet reverso
    updateProgress(50, 'Subiendo carnet (reverso)...');
    const reversoPath = `${sanitizedName}_${timestamp}/reverso.${getExtension(carnetReversoFile)}`;
    const { error: reversoError } = await supabase.storage
      .from('carnets')
      .upload(reversoPath, carnetReversoFile, { cacheControl: '3600', upsert: false });
    if (reversoError) throw new Error(`Error subiendo carnet reverso: ${reversoError.message}`);

    // Upload gallery images
    const galeriaUrlsList = [];
    if (galeriaFiles.length > 0) {
      for (let i = 0; i < galeriaFiles.length; i++) {
        const pct = 60 + Math.round((i / galeriaFiles.length) * 25);
        updateProgress(pct, `Subiendo foto de galería ${i + 1} de ${galeriaFiles.length}...`);
        const gPath = `${sanitizedName}_${timestamp}/foto_${i + 1}.${getExtension(galeriaFiles[i])}`;
        const { error: gError } = await supabase.storage
          .from('galeria')
          .upload(gPath, galeriaFiles[i], { cacheControl: '3600', upsert: false });
        if (gError) throw new Error(`Error subiendo foto ${i + 1}: ${gError.message}`);
        galeriaUrlsList.push(getPublicUrl('galeria', gPath));
      }
    }

    // Get URLs
    const logoUrl = getPublicUrl('logos', logoPath);
    // For carnets, we store the path (private bucket, need signed URLs for admin)
    const carnetAnversoUrl = `carnets/${anversoPath}`;
    const carnetReversoUrl = `carnets/${reversoPath}`;

    // Insert into database
    updateProgress(90, 'Guardando datos...');
    const { error: insertError } = await supabase
      .from('equipos')
      .insert({
        nombre_equipo: nombre,
        categoria: categoria || null,
        logo_url: logoUrl,
        carnet_anverso_url: carnetAnversoUrl,
        carnet_reverso_url: carnetReversoUrl,
        resena_historica: resena || null,
        galeria_urls: galeriaUrlsList
      });

    if (insertError) throw new Error(`Error guardando datos: ${insertError.message}`);

    updateProgress(100, '¡Completado!');

    // Success
    showToast('¡Datos del equipo enviados exitosamente! Gracias por registrar tu club.', 'success');

    // Reset form
    setTimeout(() => {
      logoFile = null;
      carnetAnversoFile = null;
      carnetReversoFile = null;
      galeriaFiles = [];
      renderApp();
    }, 2000);

  } catch (err) {
    console.error('Error:', err);
    showToast(err.message || 'Error al enviar los datos. Intenta de nuevo.', 'error');
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<span>Enviar Datos del Equipo</span>${ICONS.send}`;
    progressArea.innerHTML = '';
  }
}

function updateProgress(percent, text) {
  const fill = document.getElementById('progress-fill');
  const textEl = document.getElementById('progress-text');
  if (fill) fill.style.width = `${percent}%`;
  if (textEl) textEl.textContent = text;
}

// ============================================
// LOGIN MODAL
// ============================================

function showLoginModal() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'login-modal';
  overlay.innerHTML = `
    <div class="modal-card" onclick="event.stopPropagation();">
      <div class="modal-title">Panel Administrativo</div>
      <div class="modal-subtitle">Ingresa tus credenciales para acceder al panel de administración</div>

      <div class="form-group">
        <label class="form-label" for="login-email">Correo electrónico</label>
        <input type="email" id="login-email" class="form-input" placeholder="tu@correo.com" />
      </div>

      <div class="form-group">
        <label class="form-label" for="login-password">Contraseña</label>
        <input type="password" id="login-password" class="form-input" placeholder="Ingresa tu contraseña" />
      </div>

      <div id="login-error"></div>

      <div class="modal-actions">
        <button class="btn-modal-cancel" id="login-cancel">Cancelar</button>
        <button class="btn-modal-submit" id="login-submit">Ingresar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLoginModal();
  });

  // Cancel
  document.getElementById('login-cancel').addEventListener('click', closeLoginModal);

  // Submit
  document.getElementById('login-submit').addEventListener('click', handleLogin);

  // Enter key
  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  document.getElementById('login-email').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('login-password').focus();
  });

  // Focus
  setTimeout(() => document.getElementById('login-email')?.focus(), 100);
}

function closeLoginModal() {
  document.getElementById('login-modal')?.remove();
}

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const submitBtn = document.getElementById('login-submit');

  if (!email || !password) {
    errorEl.innerHTML = `<div class="modal-error">Por favor completa todos los campos</div>`;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Ingresando...';

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    isAuthenticated = true;
    closeLoginModal();

    // Load teams
    await loadTeams();
    currentView = 'admin-list';
    renderApp();

  } catch (err) {
    errorEl.innerHTML = `<div class="modal-error">Credenciales incorrectas. Verifica tu correo y contraseña.</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Ingresar';
  }
}

async function handleLogout() {
  await supabase.auth.signOut();
  isAuthenticated = false;
  currentView = 'form';
  currentTeam = null;
  teams = [];
  renderApp();
}

// ============================================
// ADMIN DATA LOADING
// ============================================

async function loadTeams() {
  const { data, error } = await supabase
    .from('equipos')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error loading teams:', error);
    showToast('Error al cargar los equipos', 'error');
    return;
  }

  // For each team, resolve carnet URLs (they are private, need signed URLs)
  for (const team of data) {
    try {
      if (team.carnet_anverso_url && team.carnet_anverso_url.startsWith('carnets/')) {
        const path = team.carnet_anverso_url.replace('carnets/', '');
        const { data: signedData } = await supabase.storage
          .from('carnets')
          .createSignedUrl(path, 3600);
        if (signedData) team.carnet_anverso_url = signedData.signedUrl;
      }
      if (team.carnet_reverso_url && team.carnet_reverso_url.startsWith('carnets/')) {
        const path = team.carnet_reverso_url.replace('carnets/', '');
        const { data: signedData } = await supabase.storage
          .from('carnets')
          .createSignedUrl(path, 3600);
        if (signedData) team.carnet_reverso_url = signedData.signedUrl;
      }
    } catch (e) {
      console.warn('Could not get signed URL for carnet:', e);
    }
  }

  teams = data || [];
}

// ============================================
// LIGHTBOX
// ============================================

function showLightbox(url, name) {
  const overlay = document.createElement('div');
  overlay.className = 'lightbox-overlay';
  overlay.innerHTML = `
    <button class="lightbox-close">${ICONS.close}</button>
    <img src="${url}" alt="${name || 'Imagen'}" />
    <button class="lightbox-download" data-url="${url}" data-name="${name || 'imagen'}">
      ${ICONS.download} Descargar imagen
    </button>
  `;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  overlay.querySelector('.lightbox-close').addEventListener('click', () => overlay.remove());

  overlay.querySelector('.lightbox-download').addEventListener('click', (e) => {
    e.stopPropagation();
    const btn = e.currentTarget;
    downloadImage(btn.dataset.url, btn.dataset.name);
  });

  document.body.appendChild(overlay);
}

// ============================================
// DOWNLOAD HELPER
// ============================================

async function downloadImage(url, filename) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const ext = blob.type.split('/')[1] || 'jpg';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${filename || 'imagen'}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  } catch (err) {
    // Fallback: open in new tab
    window.open(url, '_blank');
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'success') {
  // Remove existing toasts
  document.querySelectorAll('.message-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `message-toast ${type}`;
  toast.innerHTML = `
    ${type === 'success' ? '✅' : '❌'}
    <span>${message}</span>
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

// ============================================
// UTILITIES
// ============================================

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function sanitizeFilename(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .substring(0, 50);
}

function getExtension(file) {
  const name = file.name || '';
  const parts = name.split('.');
  return parts.length > 1 ? parts.pop().toLowerCase() : 'jpg';
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-BO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// ============================================
// CHECK EXISTING SESSION ON LOAD
// ============================================

async function checkSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    isAuthenticated = true;
    await loadTeams();
    currentView = 'admin-list';
  }
  renderApp();
}

// ============================================
// INIT
// ============================================

checkSession();
