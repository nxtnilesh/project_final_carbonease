import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

// Token management
export const setToken = (token) => {
  Cookies.set('token', token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
};

export const getToken = () => {
  return Cookies.get('token');
};

export const removeToken = () => {
  Cookies.remove('token');
};

// User data management
export const setUser = (user) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
};

export const getUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null;
};

export const removeUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
};

// Token validation
export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch (error) {
    return false;
  }
};

export const getTokenExpiration = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// User role helpers
export const isBuyer = () => {
  const user = getUser();
  return user?.role === 'buyer';
};

export const isSeller = () => {
  const user = getUser();
  return user?.role === 'seller';
};

export const isAdmin = () => {
  const user = getUser();
  return user?.role === 'admin';
};

// Authentication state
export const isAuthenticated = () => {
  return isTokenValid() && getUser() !== null;
};

// Logout helper
export const logout = () => {
  removeToken();
  removeUser();
  if (typeof window !== 'undefined') {
    window.location.href = '/auth/login';
  }
};

// Protected route helper
export const requireAuth = (callback) => {
  return (context) => {
    if (!isAuthenticated()) {
      return {
        redirect: {
          destination: '/auth/login',
          permanent: false,
        },
      };
    }
    return callback ? callback(context) : {};
  };
};

// Role-based route protection
export const requireRole = (allowedRoles) => {
  return (callback) => {
    return (context) => {
      if (!isAuthenticated()) {
        return {
          redirect: {
            destination: '/auth/login',
            permanent: false,
          },
        };
      }

      const user = getUser();
      if (!allowedRoles.includes(user.role)) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          },
        };
      }

      return callback ? callback(context) : {};
    };
  };
};

// Format user name
export const getUserDisplayName = () => {
  const user = getUser();
  if (!user) return '';
  return `${user.firstName} ${user.lastName}`;
};

// Check if user has verified email
export const isEmailVerified = () => {
  const user = getUser();
  return user?.isEmailVerified || false;
};

// Get user initials
export const getUserInitials = () => {
  const user = getUser();
  if (!user) return '';
  return `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase();
};
