/**
 * Security utility for sanitizing user inputs to prevent XSS attacks
 */

/**
 * Sanitize string input by removing potentially dangerous characters and scripts
 * @param input - The string to sanitize
 * @returns Sanitized string safe for database storage and display
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  
  return input
    .trim()
    // Remove script tags and their content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove on* event handlers (onclick, onerror, etc.)
    .replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol (can be used for XSS)
    .replace(/data:text\/html/gi, '')
    // Limit to reasonable length to prevent DoS
    .slice(0, 10000);
}

/**
 * Sanitize HTML by escaping special characters
 * Use this when displaying user content in HTML
 * @param html - The HTML string to escape
 * @returns Escaped HTML string
 */
export function escapeHtml(html: string): string {
  if (!html || typeof html !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

/**
 * Sanitize object with multiple fields
 * @param obj - Object with string values to sanitize
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }
  
  return sanitized;
}

/**
 * Validate and sanitize email
 * @param email - Email to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  
  const sanitized = email.trim().toLowerCase();
  const emailRegex = /^[a-zA-Z0-9._+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Validate and sanitize phone number
 * @param phone - Phone number to validate
 * @returns Sanitized phone number or empty string if invalid
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return '';
  
  // Remove all non-digit characters except + at the start
  const sanitized = phone.trim().replace(/[^\d+]/g, '');
  
  // Basic validation: 10-15 digits, optional + at start
  const phoneRegex = /^\+?\d{10,15}$/;
  
  return phoneRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param url - URL to sanitize
 * @returns Safe URL or empty string
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return '';
  
  const sanitized = url.trim();
  
  // Only allow http, https, and relative URLs
  if (
    sanitized.startsWith('http://') ||
    sanitized.startsWith('https://') ||
    sanitized.startsWith('/')
  ) {
    return sanitized;
  }
  
  return '';
}

/**
 * Sanitize filename for safe file uploads
 * @param filename - Original filename
 * @returns Safe filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'file';
  
  return filename
    .trim()
    // Remove path traversal attempts
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    // Remove special characters, keep alphanumeric, dash, underscore, dot
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    // Limit length
    .slice(0, 255);
}
