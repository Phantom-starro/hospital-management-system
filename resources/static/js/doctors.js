const DoctorsModule = {
  searchTerm: '',
  specializations: ['General Medicine', 'Cardiology', 'Pediatrics', 'Dentistry', 'Dermatology', 'Orthopedics'],

  render() {
    const el = document.getElementById('view-doctors');
    el.innerHTML = `
      <div class="page-header">
        <div><h2>Doctors</h2><p>Clinical team and specializations.</p></div>
        <button type="button" class="btn btn-primary" id="addDoctorBtn">+ Add Doctor</button>
      </div>
      <div class="toolbar">
        <div class="search-pill" style="flex:1;max-width:360px">
          <span>⌕</span>
          <input type="search" id="doctorSearch" placeholder="Search name or specialization…" value="${this.searchTerm}">
        </div>
      </div>
      <div id="doctorsTableHost">${UI.skeletonTable()}</div>`;
    document.getElementById('addDoctorBtn').addEventListener('click', () => this.openForm());
    document.getElementById('doctorSearch').addEventListener('input', UI.debounce((e) => {
      this.searchTerm = e.target.value.trim();
      this.load(this.searchTerm);
    }));
    this.load(this.searchTerm);
  },

  async load(search = '') {
    const host = document.getElementById('doctorsTableHost');
    if (!host) return;
    try {
      const doctors = await API.doctors(search);
      if (!doctors.length) {
        host.innerHTML = `<div class="empty-state"><h3>No doctors yet</h3><p>Add doctors to enable appointment booking.</p><button type="button" class="btn btn-primary" id="emptyAddDoctor">+ Add Doctor</button></div>`;
        document.getElementById('emptyAddDoctor')?.addEventListener('click', () => this.openForm());
        return;
      }
      host.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Doctor</th><th>Specialization</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody class="stagger">
              ${doctors.map((d, i) => `
                <tr style="animation-delay:${i * 0.03}s">
                  <td><a href="#doctor/${d.id}" class="action-link">${d.fullName}</a><div style="font-size:0.75rem;color:var(--text-muted)">${d.doctorId}</div></td>
                  <td>${d.specialization}</td>
                  <td>${d.phone}</td>
                  <td><span class="${UI.badgeClass(d.status)}">${d.status}</span></td>
                  <td class="row-actions">
                    <a href="#doctor/${d.id}" class="action-link">Profile</a>
                    <button type="button" class="action-link" data-edit="${d.id}">Edit</button>
                    <button type="button" class="action-link danger" data-del="${d.id}">Delete</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      host.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => {
        const d = await API.doctor(b.dataset.edit);
        this.openForm(d);
      }));
      host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => this.deleteDoctor(b.dataset.del)));
    } catch (err) {
      host.innerHTML = `<div class="empty-state"><h3>Error loading doctors</h3><p>${err.message}</p></div>`;
    }
  },

  formHtml(d = {}) {
    return `
      <form id="doctorForm" class="form-grid">
        <div class="form-field full" data-field="fullName"><label>Full name *</label><input name="fullName" required value="${d.fullName || ''}"></div>
        <div class="form-field" data-field="specialization"><label>Specialization *</label>
          <select name="specialization" required>
            <option value="">Select…</option>
            ${this.specializations.map(s => `<option ${d.specialization === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <div class="form-field" data-field="phone"><label>Phone *</label><input name="phone" required value="${d.phone || ''}"></div>
        <div class="form-field" data-field="email"><label>Email</label><input name="email" value="${d.email || ''}"></div>
        <div class="form-field" data-field="status"><label>Status</label>
          <select name="status">
            ${['Available', 'On Leave', 'Busy'].map(s => `<option ${ (d.status || 'Available') === s ? 'selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
      </form>`;
  },

  openForm(d = null) {
    const isEdit = !!d?.id;
    UI.openModal({
      title: isEdit ? 'Edit Doctor' : 'Add Doctor',
      bodyHtml: this.formHtml(d || {}),
      footerHtml: `<button type="button" class="btn btn-ghost" data-cancel>Cancel</button><button type="button" class="btn btn-primary" data-save>Save</button>`,
      onMount(backdrop, close) {
        backdrop.querySelector('[data-cancel]').addEventListener('click', close);
        backdrop.querySelector('[data-save]').addEventListener('click', async () => {
          const form = backdrop.querySelector('#doctorForm');
          const fd = new FormData(form);
          const body = {
            fullName: fd.get('fullName')?.trim(),
            specialization: fd.get('specialization'),
            phone: fd.get('phone')?.trim(),
            email: fd.get('email')?.trim() || '',
            status: fd.get('status')
          };
          const btn = backdrop.querySelector('[data-save]');
          btn.classList.add('loading');
          try {
            if (isEdit) await API.updateDoctor(d.id, body);
            else await API.createDoctor(body);
            UI.toast(isEdit ? 'Doctor updated successfully.' : 'Doctor added successfully.');
            close();
            DoctorsModule.load(DoctorsModule.searchTerm);
          } catch (err) {
            UI.applyFieldErrors(form, UI.showError(err));
          } finally {
            btn.classList.remove('loading');
          }
        });
      }
    });
  },

  deleteDoctor(id) {
    UI.confirm({
      title: 'Delete Doctor?',
      message: 'This will permanently remove this doctor from the system.',
      onConfirm: async () => {
        await API.deleteDoctor(id);
        UI.toast('Doctor deleted successfully.');
        this.load(this.searchTerm);
      }
    });
  },

  async renderProfile(id) {
    const el = document.getElementById('view-doctor-profile');
    el.innerHTML = UI.skeletonTable(3, 3);
    if (!id) {
      el.innerHTML = `<div class="empty-state"><h3>Doctor not found</h3></div>`;
      return;
    }
    try {
      const doctor = await API.doctor(id);
      const appointments = await API.appointments({ search: doctor.fullName.split(' ').pop() });
      const related = appointments.filter(a => a.doctorId === id);
      el.innerHTML = `
        <button type="button" class="btn btn-ghost btn-sm" id="backDoctors">← Back to Doctors</button>
        <div class="profile-hero" style="margin-top:1rem">
          <div class="profile-avatar">${UI.initials(doctor.fullName)}</div>
          <div class="profile-meta">
            <h2>${doctor.fullName}</h2>
            <div class="profile-id">${doctor.doctorId} • ${doctor.specialization} • <span class="${UI.badgeClass(doctor.status)}">${doctor.status}</span></div>
            <div class="profile-stats">
              <div><div class="profile-stat-label">Phone</div><div class="profile-stat-value">${doctor.phone}</div></div>
              <div><div class="profile-stat-label">Email</div><div class="profile-stat-value">${doctor.email || '—'}</div></div>
              <div><div class="profile-stat-label">Appointments</div><div class="profile-stat-value">${related.length}</div></div>
            </div>
          </div>
        </div>
        <div class="card">
          <h3 class="section-title">Recent Appointments</h3>
          ${related.length ? `<div class="table-wrap"><table class="data-table"><thead><tr><th>Patient</th><th>Date</th><th>Time</th><th>Status</th></tr></thead><tbody>
            ${related.slice(0, 8).map(a => `<tr><td>${a.patientName}</td><td>${UI.formatDate(a.date)}</td><td>${UI.formatTime(a.time)}</td><td><span class="${UI.badgeClass(a.status)}">${a.status}</span></td></tr>`).join('')}
          </tbody></table></div>` : '<p style="color:var(--text-muted)">No appointments linked yet.</p>'}
        </div>`;
      document.getElementById('backDoctors').addEventListener('click', () => Router.navigate('doctors'));
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><h3>Unable to load profile</h3><p>${err.message}</p></div>`;
    }
  }
};
