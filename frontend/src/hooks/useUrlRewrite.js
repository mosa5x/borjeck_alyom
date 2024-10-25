// hooks/useUrlRewrite.js
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useUrlRewrite = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    const prettyUrl = path
      .replace('/برج/', 'برج-')
      .replace('/اليوم', '-اليوم')
      .replace('/صفات-برج/', 'صفات-برج-');

    if (path !== prettyUrl) {
      window.history.replaceState(null, '', prettyUrl);
    }
  }, [location]);
};