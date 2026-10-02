const App = {
  init() {
    UI.init();
    this.setGreeting();
    document.getElementById('menuToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('open');
      document.getElementById('sidebarBackdrop').classList.toggle('visible');
    });
    document.getElementById('sidebarBackdrop').addEventListener('click', () => Router.closeSidebar());

    const globalSearch = document.getElementById('globalSearch');
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const q = globalSearch.value.trim();
        if (Router.current === 'patients' || Router.current === 'patient-profile') {
          Router.navigate('patients');
          PatientsModule.load(q);
        } else if (Router.current === 'doctors' || Router.current === 'doctor-profile') {
          Router.navigate('doctors');
          DoctorsModule.load(q);
        } else {
          Router.navigate('patients');
          PatientsModule.load(q);
        }
      }
    });

    Router.init();
  },

  setGreeting() {
    const h = new Date().getHours();
    let text = 'Good evening';
    if (h < 12) text = 'Good morning';
    else if (h < 17) text = 'Good afternoon';
    document.getElementById('greetingSub').textContent = `${text}, Hospital Admin`;
  },

  renderPage(page) {
    switch (page) {
      case 'dashboard': DashboardModule.render(); break;
      case 'patients': PatientsModule.render(); break;
      case 'patient-profile': PatientsModule.renderProfile(Router.profilePatientId); break;
      case 'doctors': DoctorsModule.render(); break;
      case 'doctor-profile': DoctorsModule.renderProfile(Router.profileDoctorId); break;
      case 'appointments': AppointmentsModule.render(); break;
      case 'records': RecordsModule.render(); break;
      default: DashboardModule.render();
    }
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
