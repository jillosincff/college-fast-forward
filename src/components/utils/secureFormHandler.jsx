// Secure form handler that combines rate limiting, CSRF protection, and validation
import { rateLimiter } from './rateLimiter';
import { csrf } from './csrfProtection';
import { validateAndSanitize } from './validation';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/components/ui/use-toast';

export const useSecureFormHandler = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const secureSubmit = async (actionType, formData, submitFunction, validationRules = {}) => {
    try {
      // 1. Authentication check
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to continue.",
          variant: "destructive"
        });
        return { success: false, error: 'Authentication required' };
      }

      // 2. Rate limiting check
      const rateLimitCheck = rateLimiter.checkAction(user.id, actionType);
      if (!rateLimitCheck.allowed) {
        toast({
          title: "Too many requests",
          description: `Please wait ${rateLimitCheck.retryAfter} seconds before trying again.`,
          variant: "destructive"
        });
        return { success: false, error: 'Rate limited' };
      }

      // 3. Input validation and sanitization
      let sanitizedData = {};
      for (const [field, value] of Object.entries(formData)) {
        const rule = validationRules[field];
        const validation = validateAndSanitize(value, rule?.type || 'text', rule?.options || {});
        
        if (!validation.isValid) {
          toast({
            title: "Invalid input",
            description: validation.error,
            variant: "destructive"
          });
          return { success: false, error: validation.error };
        }
        
        sanitizedData[field] = validation.value;
      }

      // 4. Add CSRF protection
      const headers = csrf.addToHeaders({
        'Content-Type': 'application/json'
      });

      // 5. Submit with security headers
      const result = await submitFunction(sanitizedData, headers);
      
      return { success: true, data: result };

    } catch (error) {
      console.error(`Secure form submission failed for ${actionType}:`, error);
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  return { secureSubmit };
};