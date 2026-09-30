const RecordsModule = {
  searchTerm: '',

  render() {
    const el = document.getElementById('view-records');
    el.innerHTML = `
      <div class="page-header">
        <div><h2>Medical Records</h2><p>Simple diagnosis and treatment documentation.</p></div>
        <button type="button" class="btn btn-primary" id="addRecordBtn">+ Add Medical Record</button>
      </div>
      <div class="toolbar">
        <div class="search-pill" style="flex:1;max-width:360px">
          <span>⌕</span>
          <input type="search" id="recordSearch" placeholder="Search patient, doctor, diagnosis…" value="${this.searchTerm}">
        </div>
      </div>
      <div id="recordsTableHost">${UI.skeletonTable()}</div>`;
    document.getElementById('addRecordBtn').addEventListener('click', () => this.openForm());
    document.getElementById('recordSearch').addEventListener('input', UI.debounce((e) => {
      this.searchTerm = e.target.value.trim();
      this.load();
    }));
    this.load();
  },

  async load() {
    const host = document.getElementById('recordsTableHost');
    if (!host) return;
    try {
      const records = await API.records({ search: this.searchTerm });
      if (!records.length) {
        host.innerHTML = `<div class="empty-state"><h3>No medical records</h3><p>Create a record after a consultation.</p><button class="btn btn-primary" id="emptyAddRecord">+ Add Medical Record</button></div>`;
        document.getElementById('emptyAddRecord')?.addEventListener('click', () => this.openForm());
        return;
      }
      host.innerHTML = `
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Record ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Diagnosis</th><th>Actions</th></tr></thead>
            <tbody class="stagger">
              ${records.map((r, i) => `
                <tr style="animation-delay:${i * 0.03}s">
                  <td>${r.recordId}</td>
                  <td><a href="#patient/${r.patientId}" class="action-link">${r.patientName || '—'}</a></td>
                  <td>${r.doctorName || '—'}</td>
                  <td>${UI.formatDate(r.date)}</td>
                  <td>${r.diagnosis}</td>
                  <td class="row-actions">
                    <button type="button" class="action-link" data-edit="${r.id}">Edit</button>
                    <button type="button" class="action-link danger" data-del="${r.id}">Delete</button>
                  </td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
      host.querySelectorAll('[data-edit]').forEach(b => b.addEventListener('click', async () => {
        const all = await API.records({});
        const rec = all.find(x => x.id === b.dataset.edit);
        this.openForm(rec);
      }));
      host.querySelectorAll('[data-del]').forEach(b => b.addEventListener('click', () => {
        UI.confirm({
          title: 'Delete Medical Record?',
          message: 'This record will be permanently removed.',
          onConfirm: async () => {
            await API.deleteRecord(b.dataset.del);
            UI.toast('Medical record deleted.');
            this.load();
          }
        });
      }));
    } catch (err) {
      host.innerHTML = `<div class="empty-state"><h3>Error</h3><p>${err.message}</p></div>`;
    }
  },

  async formHtml(r = {}, presetPatientId = '') {
    const [patients, doctors] = await Promise.all([API.patients(), API.doctors()]);
    const pid = r.patientId || presetPatientId;
    const patientOpts = patients.map(p => `<option value="${p.id}" ${pid === p.id ? 'selected' : ''}>${p.fullName}</option>`).join('');
    const doctorOpts = doctors.map(d => `<option value="${d.id}" ${r.doctorId === d.id ? 'selected' : ''}>${d.fullName}</option>`).join('');
    return `
      <form id="recordForm" class="form-grid">
        <div class="form-field" data-field="patientId"><label>Patient *</label><select name="patientId" required><option value="">Select…</option>${patientOpts}</select></div>
        <div class="form-field" data-field="doctorId"><label>Doctor *</label><select name="doctorId" required><option value="">Select…</option>${doctorOpts}</select></div>
        <div class="form-field" data-field="date"><label>Date *</label><input type="date" name="date" required value="${r.date || new Date().toISOString().slice(0, 10)}"></div>
        <div class="form-field full" data-field="diagnosis"><label>Diagnosis *</label><input name="diagnosis" required value="${r.diagnosis || ''}"></div>
        <div class="form-field full" data-field="treatment"><label>Treatment</label><textarea name="treatment" rows="2">${r.treatment || ''}</textarea></div>
        <div class="form-field full" data-field="notes"><label>Notes</label><textarea name="notes" rows="2">${r.notes || ''}</textarea></div>
      </form>`;
  },

  async openForm(r = null, presetPatientId = '') {
    const isEdit = !!r?.id;
    const bodyHtml = await this.formHtml(r || {}, presetPatientId);
    UI.openModal({
      title: isEdit ? 'Edit Medical Record' : 'Add Medical Record',
      bodyHtml,
      footerHtml: `<button type="button" class="btn btn-ghost" data-cancel>Cancel</button><button type="button" class="btn btn-primary" data-save>Save</button>`,
      onMount(backdrop, close) {
        backdrop.querySelector('[data-cancel]').addEventListener('click', close);
        backdrop.querySelector('[data-save]').addEventListener('click', async () => {
          const form = backdrop.querySelector('#recordForm');
          const fd = new FormData(form);
          const body = {
            patientId: fd.get('patientId'),
            doctorId: fd.get('doctorId'),
            date: fd.get('date'),
            diagnosis: fd.get('diagnosis')?.trim(),
            treatment: fd.get('treatment')?.trim() || '',
            notes: fd.get('notes')?.trim() || ''
          };
          const btn = backdrop.querySelector('[data-save]');
          btn.classList.add('loading');
          try {
            if (isEdit) await API.updateRecord(r.id, body);
            else await API.createRecord(body);
            UI.toast('Medical record saved.');
            close();
            RecordsModule.load();
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
