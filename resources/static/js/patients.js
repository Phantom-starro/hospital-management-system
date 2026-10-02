const PatientsModule = {
  searchTerm: '',

  render() {
    const el = document.getElementById('view-patients');
    el.innerHTML = `
      <div class="page-header">
        <div><h2>Patients</h2><p>Manage patient registration and profiles.</p></div>
        <button type="button" class="btn btn-primary" id="addPatientBtn">+ Register Patient</button>
      </div>
      <div class="toolbar">
        <div class="search-pill" style="flex:1;max-width:360px">
          <span>⌕</span>
          <input type="search" id="patientSearch" placeholder="Search name, ID, or phone…" value="${this.searchTerm}">
        </div>
      </div>
      <div id="patientsTableHost">${UI.skeletonTable()}</div>`;
    document.getElementById('addPatientBtn').addEventListener('click', () => this.openForm());
    document.getElementById('patientSearch').addEventListener('input', UI.debounce((e) => {
      this.searchTerm = e.target.value.trim();
      this.load(this.searchTerm);
    }));
    this.load(this.searchTerm);
  },

  async load(search = '') {
    const host = document.getElementById('patientsTableHost');
    if (!host) return;
    try {
      const patients = await API.patients(search);
      if (!patients.length) {
        host.innerHTML = `<div class="empty-state"><h3>No patients yet</h3><p>Register your first patient to begin managing hospital records.</p><button type="button" class="btn btn-primary" id="emptyAddPatient">+ Register Patient</button></div>`;
        document.getElementById('emptyAddPatient')?.addEventListener('click', () => this.openForm());
        return;
      }
      host.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Patient ID</th><th>Name</th><th>Age</th><th>Gender</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody class="stagger">
              ${patients.map((p, i) => `
                <tr style="animation-delay:${i * 0.03}s">
                  <td>${p.patientId}</td>
                  <td><a href="#patient/${p.id}" class="action-link">${p.fullName}</a></td>
                  <td>${p.age}</td>
                  <td>${p.gender}</td>
                  <td>${p.phone}</td>
                  <td><span class="${UI.badgeClass(p.status)}">${p.status}</span></td>
                  <td class="row-actions">
                    <a href="#patient/${p.id}" class="action-link">Profile</a>
                    <button type="button" class="action-link" data-edit="${p.id}">Edit</button>
                    <button type="button" class="action-link danger" data-del="${p.id}">Delete</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      host.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => {
        const p = await API.patient(b.dataset.edit);
        this.openForm(p);
      }));
      host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
        this.deletePatient(b.dataset.del);
      }));
    } catch (err) {
      host.innerHTML = `<div class="empty-state"><h3>Error loading patients</h3><p>${err.message}</p></div>`;
    }
  },

  formHtml(p = {}) {
    return `
      <form id="patientForm" class="form-grid">
        <div class="form-field" data-field="fullName"><label>Full name *</label><input name="fullName" required value="${p.fullName || ''}"></div>
        <div class="form-field" data-field="age"><label>Age *</label><input name="age" type="number" min="0" max="150" required value="${p.age ?? ''}"></div>
        <div class="form-field" data-field="gender"><label>Gender *</label>
          <select name="gender" required>
            <option value="">Select…</option>
            ${['Male', 'Female', 'Other'].map(g => `<option ${p.gender === g ? 'selected' : ''}>${g}</option>`).join('')}
          </select>
        </div>
        <div class="form-field" data-field="phone"><label>Phone *</label><input name="phone" required value="${p.phone || ''}"></div>
        <div class="form-field" data-field="email"><label>Email</label><input name="email" type="email" value="${p.email || ''}"></div>
        <div class="form-field" data-field="status"><label>Status</label>
          <select name="status">
            ${['Active', 'Inactive'].map(s => `<option ${ (p.status || 'Active') === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-field full" data-field="address"><label>Address</label><textarea name="address" rows="2">${p.address || ''}</textarea></div>
      </form>`;
  },

  openForm(p = null) {
    const isEdit = !!p?.id;
    UI.openModal({
      title: isEdit ? 'Edit Patient' : 'Register Patient',
      bodyHtml: this.formHtml(p || {}),
      footerHtml: `<button type="button" class="btn btn-ghost" data-cancel>Cancel</button><button type="button" class="btn btn-primary" data-save>${isEdit ? 'Save Changes' : 'Register'}</button>`,
      onMount(backdrop, close) {
        backdrop.querySelector('[data-cancel]').addEventListener('click', close);
        backdrop.querySelector('[data-save]').addEventListener('click', async () => {
          const form = backdrop.querySelector('#patientForm');
          const fd = new FormData(form);
          const body = {
            fullName: fd.get('fullName')?.trim(),
            age: parseInt(fd.get('age'), 10),
            gender: fd.get('gender'),
            phone: fd.get('phone')?.trim(),
            email: fd.get('email')?.trim() || '',
            address: fd.get('address')?.trim() || '',
            status: fd.get('status')
          };
          const btn = backdrop.querySelector('[data-save]');
          btn.classList.add('loading');
          try {
            if (isEdit) await API.updatePatient(p.id, body);
            else await API.createPatient(body);
            UI.toast(isEdit ? 'Patient updated successfully.' : 'Patient registered successfully.');
            close();
            PatientsModule.load(PatientsModule.searchTerm);
            if (Router.current === 'dashboard') DashboardModule.render();
          } catch (err) {
            const fe = UI.showError(err);
            UI.applyFieldErrors(form, fe);
          } finally {
            btn.classList.remove('loading');
          }
        });
      }
    });
  },

  deletePatient(id) {
    UI.confirm({
      title: 'Delete Patient?',
      message: 'This will permanently remove this patient from the system.',
      onConfirm: async () => {
        await API.deletePatient(id);
        UI.toast('Patient deleted successfully.');
        this.load(this.searchTerm);
      }
    });
  },

  async renderProfile(id) {
    const el = document.getElementById('view-patient-profile');
    el.innerHTML = UI.skeletonTable(4, 4);
    if (!id) {
      el.innerHTML = `<div class="empty-state"><h3>Patient not found</h3></div>`;
      return;
    }
    try {
      const [patient, appointments, records] = await Promise.all([
        API.patient(id),
        API.appointmentsByPatient(id),
        API.records({ patientId: id })
      ]);
      const upcoming = appointments.find(a => a.status === 'Scheduled');
      el.innerHTML = `
        <button type="button" class="btn btn-ghost btn-sm" id="backPatients">← Back to Patients</button>
        <div class="profile-hero" style="margin-top:1rem">
          <div class="profile-avatar">${UI.initials(patient.fullName)}</div>
          <div class="profile-meta">
            <h2>${patient.fullName}</h2>
            <div class="profile-id">${patient.patientId} • <span class="${UI.badgeClass(patient.status)}">${patient.status}</span></div>
            <div class="profile-stats">
              <div><div class="profile-stat-label">Age</div><div class="profile-stat-value">${patient.age}</div></div>
              <div><div class="profile-stat-label">Gender</div><div class="profile-stat-value">${patient.gender}</div></div>
              <div><div class="profile-stat-label">Phone</div><div class="profile-stat-value">${patient.phone}</div></div>
            </div>
          </div>
        </div>
        <div class="tabs">
          <button class="tab active" data-tab="overview">Overview</button>
          <button class="tab" data-tab="appointments">Appointments</button>
          <button class="tab" data-tab="records">Medical Records</button>
        </div>
        <div id="profileTabContent"></div>`;
      document.getElementById('backPatients').addEventListener('click', () => Router.navigate('patients'));
      const renderTab = (tab) => {
        document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
        const host = document.getElementById('profileTabContent');
        if (tab === 'overview') {
          host.innerHTML = `
            <div class="analytics-row">
              <div class="card"><h3 class="section-title">Personal Information</h3>
                <p><strong>Registered:</strong> ${UI.formatDate(patient.dateRegistered)}</p>
                <p><strong>Email:</strong> ${patient.email || '—'}</p>
                <p><strong>Address:</strong> ${patient.address || '—'}</p>
              </div>
              <div class="card"><h3 class="section-title">Upcoming Appointment</h3>
                ${upcoming ? `<p><strong>${UI.formatDate(upcoming.date)}</strong> at ${UI.formatTime(upcoming.time)}</p><p>Dr. ${upcoming.doctorName} — ${upcoming.reason}</p>` : '<p style="color:var(--text-muted)">No upcoming scheduled appointment.</p>'}
              </div>
            </div>`;
        } else if (tab === 'appointments') {
          host.innerHTML = appointments.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>
            ${appointments.map(a => `<tr><td>${a.appointmentId}</td><td>${a.doctorName}</td><td>${UI.formatDate(a.date)}</td><td>${UI.formatTime(a.time)}</td><td><span class="${UI.badgeClass(a.status)}">${a.status}</span></td></tr>`).join('')}
          </tbody></table></div>` : `<div class="empty-state"><h3>No appointments</h3></div>`;
        } else {
          host.innerHTML = records.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>ID</th><th>Date</th><th>Doctor</th><th>Diagnosis</th><th>Treatment</th></tr></thead><tbody>
            ${records.map(r => `<tr><td>${r.recordId}</td><td>${UI.formatDate(r.date)}</td><td>${r.doctorName}</td><td>${r.diagnosis}</td><td>${r.treatment || '—'}</td></tr>`).join('')}
          </tbody></table></div>` : `<div class="empty-state"><h3>No medical records</h3><button class="btn btn-primary" id="addRecFromProfile">+ Add Medical Record</button></div>`;
          document.getElementById('addRecFromProfile')?.addEventListener('click', () => RecordsModule.openForm(null, patient.id));
        }
      };
      document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => renderTab(t.dataset.tab)));
      renderTab('overview');
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><h3>Unable to load profile</h3><p>${err.message}</p></div>`;
    }
  }
};
