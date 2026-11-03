// Auth state management helper

export const auth = {
  getToken: () => localStorage.getItem('land_records_token'),
  
  getUser: () => {
    const raw = localStorage.getItem('land_records_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return Boolean(localStorage.getItem('land_records_token'));
  },

  isAdmin: () => {
    const user = auth.getUser();
    return user?.role === 'admin';
  },

  setSession: (token, user) => {
    localStorage.setItem('land_records_token', token);
    localStorage.setItem('land_records_user', JSON.stringify(user));
    window.dispatchEvent(new Event('auth_state_changed'));
  },

  clearSession: () => {
    localStorage.removeItem('land_records_token');
    localStorage.removeItem('land_records_user');
    window.dispatchEvent(new Event('auth_state_changed'));
  }
};
