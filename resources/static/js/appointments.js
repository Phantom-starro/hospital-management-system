const AppointmentsModule = {
  filters: { search: '', status: '', date: '' },

  render() {
    const el = document.getElementById('view-appointments');
    el.innerHTML = `
      <div class="page-header">
        <div><h2>Appointments</h2><p>Book, schedule, and track patient visits.</p></div>
        <button type="button" class="btn btn-primary" id="bookApptBtn">+ Book Appointment</button>
      </div>
      <div class="toolbar">
        <div class="search-pill" style="flex:1;min-width:200px;max-width:280px"><span>⌕</span><input type="search" id="apptSearch" placeholder="Search…" value="${this.filters.search}"></div>
        <select id="apptStatusFilter">
          <option value="">All statuses</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
        <input type="date" id="apptDateFilter" value="${this.filters.date}">
        <button type="button" class="btn btn-ghost btn-sm" id="clearApptFilters">Clear</button>
      </div>
      <div id="apptTableHost">${UI.skeletonTable()}</div>`;
    document.getElementById('bookApptBtn').addEventListener('click', () => this.openForm());
    document.getElementById('apptStatusFilter').value = this.filters.status;
    document.getElementById('apptSearch').addEventListener('input', UI.debounce((e) => {
      this.filters.search = e.target.value.trim();
      this.load();
    }));
    document.getElementById('apptStatusFilter').addEventListener('change', (e) => {
      this.filters.status = e.target.value;
      this.load();
    });
    document.getElementById('apptDateFilter').addEventListener('change', (e) => {
      this.filters.date = e.target.value;
      this.load();
    });
    document.getElementById('clearApptFilters').addEventListener('click', () => {
      this.filters = { search: '', status: '', date: '' };
      this.render();
    });
    this.load();
  },

  async load() {
    const host = document.getElementById('apptTableHost');
    if (!host) return;
    try {
      const list = await API.appointments(this.filters);
      if (!list.length) {
        host.innerHTML = `<div class="empty-state"><h3>No appointments found</h3><p>Book an appointment to get started.</p><button class="btn btn-primary" id="emptyBook">+ Book Appointment</button></div>`;
        document.getElementById('emptyBook')?.addEventListener('click', () => this.openForm());
        return;
      }
      host.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody class="stagger">
              ${list.map((a, i) => `
                <tr style="animation-delay:${i * 0.03}s">
                  <td>${a.appointmentId}</td>
                  <td>${a.patientName || '—'}</td>
                  <td>${a.doctorName || '—'}</td>
                  <td>${UI.formatDate(a.date)}</td>
                  <td>${UI.formatTime(a.time)}</td>
                  <td><span class="${UI.badgeClass(a.status)}">${a.status}</span></td>
                  <td class="row-actions">
                    <button type="button" class="action-link" data-edit="${a.id}">Edit</button>
                    ${a.status === 'Scheduled' ? `<button type="button" class="action-link" data-complete="${a.id}">Complete</button><button type="button" class="action-link" data-cancel="${a.id}">Cancel</button>` : ''}
                    <button type="button" class="action-link danger" data-del="${a.id}">Delete</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      host.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => {
        const appt = list.find(x => x.id === b.dataset.edit);
        this.openForm(appt);
      }));
      host.querySelectorAll('[data-complete]').forEach(b => b.addEventListener('click', async () => {
        await API.updateAppointmentStatus(b.dataset.complete, 'Completed');
        UI.toast('Appointment marked as completed.');
        this.load();
        if (Router.current === 'dashboard') DashboardModule.render();
      }));
      host.querySelectorAll('[data-cancel]').forEach(b => b.addEventListener('click', async () => {
        await API.updateAppointmentStatus(b.dataset.cancel, 'Cancelled');
        UI.toast('Appointment cancelled.');
        this.load();
      }));
      host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
        UI.confirm({
          title: 'Delete Appointment?',
          message: 'This appointment will be permanently removed.',
          onConfirm: async () => {
            await API.deleteAppointment(b.dataset.del);
            UI.toast('Appointment deleted.');
            this.load();
          }
        });
      }));
    } catch (err) {
      host.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  },

  async formHtml(a = {}) {
    const [patients, doctors] = await Promise.all([API.patients(), API.doctors()]);
    const patientOpts = patients.map(p => `<option value="${p.id}" ${a.patientId === p.id ? 'selected' : ''}>${p.fullName} (${p.patientId})</option>`).join('');
    const doctorOpts = doctors.map(d => `<option value="${d.id}" ${a.doctorId === d.id ? 'selected' : ''}>${d.fullName} — ${d.specialization}</option>`).join('');
    return `
      <form id="apptForm" class="form-grid">
        <div class="form-field" data-field="patientId"><label>Patient *</label><select name="patientId" required><option value="">Select patient…</option>${patientOpts}</select></div>
        <div class="form-field" data-field="doctorId"><label>Doctor *</label><select name="doctorId" required><option value="">Select doctor…</option>${doctorOpts}</select></div>
        <div class="form-field" data-field="date"><label>Date *</label><input type="date" name="date" required value="${a.date || ''}"></div>
        <div class="form-field" data-field="time"><label>Time *</label><input type="time" name="time" required value="${a.time ? a.time.slice(0, 5) : ''}"></div>
        <div class="form-field full" data-field="reason"><label>Reason *</label><textarea name="reason" rows="2" required>${a.reason || ''}</textarea></div>
        ${a.id ? `<div class="form-field" data-field="status"><label>Status</label>
          <select name="status">
            ${['Scheduled', 'Completed', 'Cancelled'].map(s => `<option ${a.status === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select></div>` : ''}
      </form>`;
  },

  async openForm(a = null) {
    const isEdit = !!a?.id;
    const bodyHtml = await this.formHtml(a || {});
    UI.openModal({
      title: isEdit ? 'Edit Appointment' : 'Book Appointment',
      bodyHtml,
      footerHtml: `<button type="button" class="btn btn-ghost" data-cancel>Cancel</button><button type="button" class="btn btn-primary" data-save>${isEdit ? 'Save' : 'Book'}</button>`,
      onMount(backdrop, close) {
        backdrop.querySelector('[data-cancel]').addEventListener('click', close);
        backdrop.querySelector('[data-save]').addEventListener('click', async () => {
          const form = backdrop.querySelector('#apptForm');
          const fd = new FormData(form);
          const body = {
            patientId: fd.get('patientId'),
            doctorId: fd.get('doctorId'),
            date: fd.get('date'),
            time: fd.get('time') + ':00',
            reason: fd.get('reason')?.trim(),
            status: fd.get('status') || 'Scheduled'
          };
          const btn = backdrop.querySelector('[data-save]');
          btn.classList.add('loading');
          try {
            if (isEdit) await API.updateAppointment(a.id, body);
            else await API.createAppointment(body);
            UI.toast(isEdit ? 'Appointment updated successfully.' : 'Appointment booked successfully.');
            close();
            AppointmentsModule.load();
            if (Router.current === 'dashboard') DashboardModule.render();
          } catch (err) {
            UI.applyFieldErrors(form, UI.showError(err));
          } finally {
            btn.classList.remove('loading');
          }
        });
      }
    });
  }
};
