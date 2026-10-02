const API = {
  async request(path, options = {}) {
    const config = {
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    };
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    const res = await fetch(path, config);
    if (res.status === 204) return null;
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = new Error(data.message || 'Request failed');
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  },

  dashboardStats() {
    return this.request('/api/dashboard/stats');
  },

  patients(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/patients${q}`);
  },
  patient(id) {
    return this.request(`/api/patients/${id}`);
  },
  createPatient(body) {
    return this.request('/api/patients', { method: 'POST', body });
  },
  updatePatient(id, body) {
    return this.request(`/api/patients/${id}`, { method: 'PUT', body });
  },
  deletePatient(id) {
    return this.request(`/api/patients/${id}`, { method: 'DELETE' });
  },

  doctors(search) {
    const q = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request(`/api/doctors${q}`);
  },
  doctor(id) {
    return this.request(`/api/doctors/${id}`);
  },
  createDoctor(body) {
    return this.request('/api/doctors', { method: 'POST', body });
  },
  updateDoctor(id, body) {
    return this.request(`/api/doctors/${id}`, { method: 'PUT', body });
  },
  deleteDoctor(id) {
    return this.request(`/api/doctors/${id}`, { method: 'DELETE' });
  },

  appointments(params = {}) {
    const sp = new URLSearchParams();
    if (params.search) sp.set('search', params.search);
    if (params.status) sp.set('status', params.status);
    if (params.date) sp.set('date', params.date);
    const q = sp.toString();
    return this.request(`/api/appointments${q ? `?${q}` : ''}`);
  },
  appointmentsByPatient(patientId) {
    return this.request(`/api/appointments/patient/${patientId}`);
  },
  createAppointment(body) {
    return this.request('/api/appointments', { method: 'POST', body });
  },
  updateAppointment(id, body) {
    return this.request(`/api/appointments/${id}`, { method: 'PUT', body });
  },
  updateAppointmentStatus(id, status) {
    return this.request(`/api/appointments/${id}/status`, { method: 'PATCH', body: { status } });
  },
  deleteAppointment(id) {
    return this.request(`/api/appointments/${id}`, { method: 'DELETE' });
  },

  records(params = {}) {
    const sp = new URLSearchParams();
    if (params.patientId) sp.set('patientId', params.patientId);
    if (params.search) sp.set('search', params.search);
    const q = sp.toString();
    return this.request(`/api/medical-records${q ? `?${q}` : ''}`);
  },
  createRecord(body) {
    return this.request('/api/medical-records', { method: 'POST', body });
  },
  updateRecord(id, body) {
    return this.request(`/api/medical-records/${id}`, { method: 'PUT', body });
  },
  deleteRecord(id) {
    return this.request(`/api/medical-records/${id}`, { method: 'DELETE' });
  }
};
