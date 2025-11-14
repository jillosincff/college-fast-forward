// Input validation and sanitization utilities without external dependencies

// Basic HTML/script sanitization without DOMPurify
const basicSanitize = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove script tags, event handlers, and other potentially dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers like onclick=
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Remove iframes
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '') // Remove objects
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '') // Remove embeds
    .trim();
};

// Validation rules
export const validators = {
  email: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length <= 254;
  },
  
  name: (name) => {
    // Allow letters, spaces, hyphens, apostrophes
    const nameRegex = /^[a-zA-Z\s'-]{1,50}$/;
    return nameRegex.test(name.trim());
  },
  
  url: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  graduationYear: (year) => {
    const currentYear = new Date().getFullYear();
    const numYear = parseInt(year);
    return numYear >= 1900 && numYear <= currentYear + 10;
  },
  
  phone: (phone) => {
    const phoneRegex = /^\+?[\d\s-()]{10,15}$/;
    return phoneRegex.test(phone);
  }
};

// Sanitization functions
export const sanitize = {
  text: (input) => {
    if (typeof input !== 'string') return '';
    return basicSanitize(input.trim());
  },
  
  html: (input) => {
    if (typeof input !== 'string') return '';
    // Allow only basic formatting tags
    const cleaned = basicSanitize(input);
    // Keep only safe HTML tags
    return cleaned.replace(/<(?!\/?(?:p|br|strong|em|u)\b)[^>]*>/gi, '');
  },
  
  url: (input) => {
    if (typeof input !== 'string') return '';
    const sanitized = input.trim();
    if (!validators.url(sanitized)) return '';
    return sanitized;
  }
};

// Enhanced validation and sanitization function
export const validateAndSanitize = (value, type, options = {}) => {
  const { required = false, maxLength = null, minLength = null } = options;
  
  // Handle null/undefined
  if (value === null || value === undefined || value === '') {
    if (required) {
      return { isValid: false, error: 'This field is required.', value: '' };
    }
    return { isValid: true, value: '', error: null };
  }
  
  // Convert to string and sanitize
  let sanitizedValue = String(value);
  
  switch (type) {
    case 'text':
      sanitizedValue = sanitize.text(sanitizedValue);
      break;
    case 'longText':
      sanitizedValue = sanitize.text(sanitizedValue);
      break;
    case 'html':
      sanitizedValue = sanitize.html(sanitizedValue);
      break;
    case 'email':
      sanitizedValue = sanitize.text(sanitizedValue).toLowerCase();
      if (!validators.email(sanitizedValue)) {
        return { isValid: false, error: 'Please enter a valid email address.', value: sanitizedValue };
      }
      break;
    case 'url':
      sanitizedValue = sanitize.url(sanitizedValue);
      if (sanitizedValue && !validators.url(sanitizedValue)) {
        return { isValid: false, error: 'Please enter a valid URL.', value: sanitizedValue };
      }
      break;
    default:
      sanitizedValue = sanitize.text(sanitizedValue);
  }
  
  // Length validation
  if (maxLength && sanitizedValue.length > maxLength) {
    return { 
      isValid: false, 
      error: `Must be ${maxLength} characters or less.`, 
      value: sanitizedValue 
    };
  }
  
  if (minLength && sanitizedValue.length < minLength) {
    return { 
      isValid: false, 
      error: `Must be at least ${minLength} characters.`, 
      value: sanitizedValue 
    };
  }
  
  // Check if required field is now empty after sanitization
  if (required && (!sanitizedValue || sanitizedValue.trim() === '')) {
    return { isValid: false, error: 'This field is required.', value: sanitizedValue };
  }
  
  return { isValid: true, value: sanitizedValue, error: null };
};

// Form validation helper
export const validateForm = (data, rules) => {
  const errors = {};
  
  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];
    
    // Check if required field is missing
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors[field] = rule.message || `${field} is required`;
      return;
    }
    
    // Skip validation if field is empty and not required
    if (!value || value.toString().trim() === '') {
      return;
    }
    
    // Run validator function
    if (rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Common validation rules
export const commonRules = {
  email: {
    required: true,
    validator: validators.email,
    message: 'Please enter a valid email address'
  },
  
  fullName: {
    required: true,
    validator: validators.name,
    message: 'Please enter a valid name (letters, spaces, hyphens, apostrophes only)'
  },
  
  graduationYear: {
    required: true,
    validator: validators.graduationYear,
    message: 'Please enter a valid graduation year'
  },
  
  linkedinUrl: {
    required: false,
    validator: (url) => !url || validators.url(url),
    message: 'Please enter a valid LinkedIn URL'
  }
};