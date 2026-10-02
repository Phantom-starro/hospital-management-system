const UI = {
  toastStack: null,

  init() {
    this.toastStack = document.getElementById('toastStack');
  },

  toast(message, type = 'success') {
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.textContent = message;
    this.toastStack.appendChild(el);
    setTimeout(() => {
      el.classList.add('toast-out');
      setTimeout(() => el.remove(), 350);
    }, 3200);
  },

  showError(err) {
    const fieldErrors = err.data?.fieldErrors;
    if (fieldErrors) {
      const first = Object.values(fieldErrors)[0];
      this.toast(first || err.message, 'error');
      return fieldErrors;
    }
    this.toast(err.message || 'Something went wrong', 'error');
    return null;
  },

  badgeClass(status) {
    const s = (status || '').toLowerCase().replace(/\s+/g, '-');
    return `badge badge-${s}`;
  },

  formatDate(d) {
    if (!d) return '—';
    const date = new Date(d + 'T00:00:00');
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  },

  formatTime(t) {
    if (!t) return '—';
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const h12 = hour % 12 || 12;
    return `${h12}:${m} ${ampm}`;
  },

  initials(name) {
    return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(n => n[0]).join('').toUpperCase();
  },

  animateCounter(el, target, duration = 900) {
    const start = 0;
    const startTime = performance.now();
    const step = (now) => {
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(start + (target - start) * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  skeletonStats(count = 4) {
    return `<div class="stat-grid">${Array(count).fill('').map(() =>
      `<div class="card stat-card"><div class="skeleton" style="height:14px;width:60%"></div><div class="skeleton" style="height:36px;width:40%;margin-top:12px"></div></div>`
    ).join('')}</div>`;
  },

  skeletonTable(rows = 5, cols = 6) {
    return `<div class="table-wrap">${Array(rows).fill('').map(() =>
      `<div class="skeleton" style="height:44px;margin:8px;border-radius:8px"></div>`
    ).join('')}</div>`;
  },

  openModal({ title, bodyHtml, footerHtml, onMount }) {
    const root = document.getElementById('modalRoot');
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.innerHTML = `
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-header">
          <h3>${title}</h3>
          <button type="button" class="modal-close" aria-label="Close">✕</button>
        </div>
        <div class="modal-body">${bodyHtml}</div>
        ${footerHtml ? `<div class="modal-footer">${footerHtml}</div>` : ''}
      </div>`;
    const close = () => backdrop.remove();
    backdrop.querySelector('.modal-close').addEventListener('click', close);
    backdrop.addEventListener('click', (e) => { if (e.target === backdrop) close(); });
    root.appendChild(backdrop);
    if (onMount) onMount(backdrop, close);
    return { close, backdrop };
  },

  confirm({ title, message, confirmLabel = 'Delete', onConfirm }) {
    this.openModal({
      title,
      bodyHtml: `<p style="color:var(--text-secondary);margin:0;line-height:1.6">${message}</p>`,
      footerHtml: `
        <button type="button" class="btn btn-ghost" data-cancel>Cancel</button>
        <button type="button" class="btn btn-danger" data-confirm>${confirmLabel}</button>`,
      onMount(backdrop, close) {
        backdrop.querySelector('[data-cancel]').addEventListener('click', close);
        backdrop.querySelector('[data-confirm]').addEventListener('click', async () => {
          const btn = backdrop.querySelector('[data-confirm]');
          btn.classList.add('loading');
          btn.textContent = 'Working…';
          try {
            await onConfirm();
            close();
          } catch (err) {
            UI.showError(err);
            btn.classList.remove('loading');
            btn.textContent = confirmLabel;
          }
        });
      }
    });
  },

  applyFieldErrors(form, fieldErrors) {
    if (!fieldErrors) return;
    form.querySelectorAll('.form-field').forEach(f => f.classList.remove('field-invalid'));
    form.querySelectorAll('.error').forEach(e => e.remove());
    Object.entries(fieldErrors).forEach(([field, msg]) => {
      const wrap = form.querySelector(`[data-field="${field}"]`);
      if (!wrap) return;
      wrap.classList.add('field-invalid');
      const err = document.createElement('span');
      err.className = 'error';
      err.textContent = msg;
      wrap.appendChild(err);
    });
  },

  debounce(fn, ms = 280) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }
};
