const Router = {
  current: 'dashboard',
  profilePatientId: null,
  profileDoctorId: null,

  titles: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    'patient-profile': 'Patient Profile',
    doctors: 'Doctors',
    'doctor-profile': 'Doctor Profile',
    appointments: 'Appointments',
    records: 'Medical Records'
  },

  init() {
    window.addEventListener('hashchange', () => this.resolve());
    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 960) this.closeSidebar();
      });
    });
    this.resolve();
  },

  navigate(hash) {
    window.location.hash = hash;
  },

  resolve() {
    const raw = (window.location.hash || '#dashboard').slice(1);
    const parts = raw.split('/');
    const route = parts[0] || 'dashboard';

    this.profilePatientId = route === 'patient' ? parts[1] : null;
    this.profileDoctorId = route === 'doctor' ? parts[1] : null;

    let page = route;
    if (route === 'patient') page = 'patient-profile';
    if (route === 'doctor') page = 'doctor-profile';

    this.current = page;
    document.querySelectorAll('.page.view').forEach(v => v.classList.remove('active'));
    const view = document.getElementById(`view-${page}`);
    if (view) view.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(link => {
      const r = link.dataset.route;
      const active = (page === 'patient-profile' && r === 'patients')
        || (page === 'doctor-profile' && r === 'doctors')
        || r === page;
      link.classList.toggle('active', active);
    });

    document.getElementById('pageTitle').textContent = this.titles[page] || 'MEDORA';
    App.renderPage(page);
  },

  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarBackdrop').classList.remove('visible');
  }
};
