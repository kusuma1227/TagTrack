import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * useAuth — convenience hook for consuming AuthContext.
 * Throws if used outside an AuthProvider.
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
