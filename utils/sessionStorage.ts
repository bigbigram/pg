export const storeSession = (session: any) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('userSession', JSON.stringify(session));
  }
};

export const getStoredSession = () => {
  if (typeof window !== 'undefined') {
    const session = localStorage.getItem('userSession');
    return session ? JSON.parse(session) : null;
  }
  return null;
};
