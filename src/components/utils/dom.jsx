// Null-safe event wire-up to prevent extension crashes
export function on(selector, event, handler) {
  const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
  if (!el) return false;
  el.addEventListener(event, handler);
  return true;
}

// Safe query selector
export function qs(selector, root = document) {
  try {
    return root.querySelector(selector);
  } catch (e) {
    console.warn('[DOM] Invalid selector:', selector, e);
    return null;
  }
}

// Safe share modal bindings with event delegation
let shareModalInitialized = false;

export function initShareModalBindings() {
  if (shareModalInitialized) return;
  
  // Use event delegation to handle share modals across route changes
  document.addEventListener('click', (e) => {
    const openBtn = e.target.closest('[data-share-open]');
    if (openBtn) {
      const modal = qs('#share-modal');
      if (modal) modal.removeAttribute('hidden');
      return;
    }
    
    const closeBtn = e.target.closest('[data-share-close]');
    if (closeBtn) {
      const modal = qs('#share-modal');
      if (modal) modal.setAttribute('hidden', '');
      return;
    }
  });
  
  shareModalInitialized = true;
}

// Initialize on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShareModalBindings);
  } else {
    initShareModalBindings();
  }
}