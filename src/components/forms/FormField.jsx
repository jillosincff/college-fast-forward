import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, Check } from 'lucide-react';

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  success,
  required = false,
  placeholder,
  disabled = false,
  rows = 3,
  maxLength,
  helpText,
  className = ''
}) {
  const hasError = !!error;
  const hasSuccess = !!success;

  const inputClasses = `
    ${hasError ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
    ${hasSuccess ? 'border-green-300 focus:border-green-500 focus:ring-green-500' : ''}
    ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
  `.trim();

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        <InputComponent
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(name, e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          rows={type === 'textarea' ? rows : undefined}
          maxLength={maxLength}
          className={`w-full ${inputClasses}`}
        />
        
        {/* Success/Error Icons */}
        {(hasError || hasSuccess) && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {hasError && <AlertCircle className="w-4 h-4 text-red-500" />}
            {hasSuccess && <Check className="w-4 h-4 text-green-500" />}
          </div>
        )}
      </div>

      {/* Character Count */}
      {maxLength && type === 'textarea' && (
        <div className="flex justify-end">
          <span className={`text-xs ${
            value?.length > maxLength * 0.9 ? 'text-amber-600' : 'text-gray-500'
          }`}>
            {value?.length || 0}/{maxLength}
          </span>
        </div>
      )}
      
      {/* Error Message */}
      {hasError && (
        <div className="flex items-center gap-1 text-red-600 text-sm">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </div>
      )}
      
      {/* Success Message */}
      {hasSuccess && (
        <div className="flex items-center gap-1 text-green-600 text-sm">
          <Check className="w-3 h-3 flex-shrink-0" />
          {success}
        </div>
      )}
      
      {/* Help Text */}
      {helpText && !hasError && (
        <p className="text-xs text-gray-500">{helpText}</p>
      )}
    </div>
  );
}

// Form validation helpers
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateRequired = (value) => {
  return value && value.trim().length > 0;
};

export const validateMinLength = (value, min) => {
  return value && value.length >= min;
};

export const validateURL = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};