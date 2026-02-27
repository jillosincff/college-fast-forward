import React from 'react';

// Simple navigation utilities to replace the deleted SimpleRouter
export const navigate = (page, params = {}) => {
  let hash = `#${page}`;
  if (Object.keys(params).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      hash += `?${queryString}`;
    }
  }
  window.location.hash = hash;
};

function parseHashParams() {
  try {
    const hashPart = window.location.hash.split('?')[1] || '';
    const searchParams = new URLSearchParams(hashPart);
    const paramsObj = {};
    for (const [key, value] of searchParams) {
      paramsObj[key] = value;
    }
    return paramsObj;
  } catch (error) {
    console.error('Error parsing URL params:', error);
    return {};
  }
}

export const useParams = () => {
  // Initialize synchronously from URL to avoid blank-screen race condition
  const [params, setParams] = React.useState(() => parseHashParams());
  
  React.useEffect(() => {
    const updateParams = () => {
      setParams(parseHashParams());
    };
    
    // Re-parse in case hash changed between initial render and effect
    updateParams();
    window.addEventListener('hashchange', updateParams);
    return () => window.removeEventListener('hashchange', updateParams);
  }, []);
  
  return params;
};

export const useRouter = () => {
  return { navigate };
};