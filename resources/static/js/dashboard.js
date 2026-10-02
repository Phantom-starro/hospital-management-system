const DashboardModule = {
  async render() {
    const el = document.getElementById('view-dashboard');
    el.innerHTML = UI.skeletonStats() + UI.skeletonTable();
    try {
      const stats = await API.dashboardStats();
      el.innerHTML = this.template(stats);
      this.bind(stats);
      UI.animateCounter(document.getElementById('statPatients'), stats.totalPatients);
      UI.animateCounter(document.getElementById('statDoctors'), stats.totalDoctors);
      UI.animateCounter(document.getElementById('statToday'), stats.todayAppointments);
      UI.animateCounter(document.getElementById('statPending'), stats.pendingAppointments);
    } catch (err) {
      el.innerHTML = `<div class="empty-state"><h3>Unable to load dashboard</h3><p>${err.message}</p></div>`;
    }
  },

  template(stats) {
    const breakdown = stats.appointmentStatusBreakdown || {};
    const total = Object.values(breakdown).reduce((a, b) => a + b, 0) || 1;
    const scheduled = breakdown.Scheduled || 0;
    const completed = breakdown.Completed || 0;
    const cancelled = breakdown.Cancelled || 0;
    const degScheduled = (scheduled / total) * 360;
    const degCompleted = (completed / total) * 360;
    const donutBg = `conic-gradient(var(--accent) 0deg ${degScheduled}deg, var(--info) ${degScheduled}deg ${degScheduled + degCompleted}deg, var(--danger) ${degScheduled + degCompleted}deg 360deg)`;

    const weeklyBars = (stats.weeklyAppointments || []).map((w, i) => {
      const max = Math.max(...stats.weeklyAppointments.map(x => x.count), 1);
      const h = Math.max(8, (w.count / max) * 100);
      return `<div class="chart-bar-wrap"><div class="chart-bar" style="height:${h}%"></div><span class="chart-label">${w.label}</span></div>`;
    }).join('');

    const trendBars = (stats.patientRegistrationTrend || []).map((w, i) => {
      const max = Math.max(...stats.patientRegistrationTrend.map(x => x.count), 1);
      const h = Math.max(8, (w.count / max) * 100);
      return `<div class="chart-bar-wrap"><div class="chart-bar alt" style="height:${h}%;animation-delay:${i * 0.05}s"></div><span class="chart-label">${w.label}</span></div>`;
    }).join('');

    const recentRows = (stats.recentAppointments || []).map((a, i) => `
      <tr style="animation-delay:${i * 0.04}s">
        <td>${a.patientName || '—'}</td>
        <td>${a.doctorName || '—'}</td>
        <td>${UI.formatDate(a.date)}</td>
        <td>${UI.formatTime(a.time)}</td>
        <td><span class="${UI.badgeClass(a.status)}">${a.status}</span></td>
        <td><a href="#appointments" class="action-link">Manage</a></td>
      </tr>`).join('');

    return `
      <div class="stat-grid stagger">
        <div class="card stat-card card-hover"><div class="stat-label">Total Patients</div><div class="stat-value" id="statPatients">0</div><div class="stat-meta">Registered in Medora</div></div>
        <div class="card stat-card card-hover"><div class="stat-label">Total Doctors</div><div class="stat-value" id="statDoctors">0</div><div class="stat-meta">Clinical staff</div></div>
        <div class="card stat-card card-hover"><div class="stat-label">Today's Appointments</div><div class="stat-value" id="statToday">0</div><div class="stat-meta">Scheduled for today</div></div>
        <div class="card stat-card card-hover"><div class="stat-label">Pending Appointments</div><div class="stat-value" id="statPending">0</div><div class="stat-meta">Awaiting completion</div></div>
      </div>

      <div class="dashboard-grid" style="margin-top:1rem">
        <div class="dashboard-main">
          <div class="analytics-row">
            <div class="card">
              <h3 class="section-title">Appointment Status</h3>
              <div class="donut-wrap">
                <div class="donut" style="background:${donutBg}"><div class="donut-hole">${total}<br>total</div></div>
                <div class="legend">
                  <div class="legend-item"><span class="legend-dot" style="background:var(--accent)"></span> Scheduled (${scheduled})</div>
                  <div class="legend-item"><span class="legend-dot" style="background:var(--info)"></span> Completed (${completed})</div>
                  <div class="legend-item"><span class="legend-dot" style="background:var(--danger)"></span> Cancelled (${cancelled})</div>
                </div>
              </div>
            </div>
            <div class="card">
              <h3 class="section-title">Weekly Appointments</h3>
              <div class="chart-bars">${weeklyBars || '<p style="color:var(--text-muted)">No data</p>'}</div>
            </div>
          </div>
          <div class="card">
            <h3 class="section-title">Recent Appointments</h3>
            <div class="table-wrap">
              <table class="data-table">
                <thead><tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>${recentRows || '<tr><td colspan="6">No appointments yet</td></tr>'}</tbody>
              </table>
            </div>
          </div>
        </div>
        <div>
          <div class="card" style="margin-bottom:1rem">
            <h3 class="section-title">Quick Actions</h3>
            <div class="quick-actions">
              <button type="button" class="quick-action" data-action="patient"><strong>Register Patient</strong><span>Add a new patient record</span></button>
              <button type="button" class="quick-action" data-action="doctor"><strong>Add Doctor</strong><span>Expand clinical team</span></button>
              <button type="button" class="quick-action" data-action="appointment"><strong>Book Appointment</strong><span>Schedule a visit</span></button>
              <button type="button" class="quick-action" data-action="record"><strong>Add Medical Record</strong><span>Document diagnosis</span></button>
            </div>
          </div>
          <div class="card">
            <h3 class="section-title">Patient Registration Trend</h3>
            <div class="chart-bars">${trendBars}</div>
          </div>
        </div>
      </div>`;
  },

  bind() {
    document.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const a = btn.dataset.action;
        if (a === 'patient') { Router.navigate('patients'); PatientsModule.openForm(); }
        if (a === 'doctor') { Router.navigate('doctors'); DoctorsModule.openForm(); }
        if (a === 'appointment') { Router.navigate('appointments'); AppointmentsModule.openForm(); }
        if (a === 'record') { Router.navigate('records'); RecordsModule.openForm(); }
      });
    });
  }
};
