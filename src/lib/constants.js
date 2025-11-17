// User Roles
export const USER_ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  EMPLOYEE: "employee",
};

export const USER_ROLES_ARRAY = Object.values(USER_ROLES);

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  PREPARING: "preparing",
  SERVED: "served",
  PAID: "paid",
};

export const ORDER_STATUS_ARRAY = Object.values(ORDER_STATUS);

// Order Types
export const ORDER_TYPES = {
  DINE_IN: "dine-in",
  TAKEAWAY: "takeaway",
};

export const ORDER_TYPES_ARRAY = Object.values(ORDER_TYPES);

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const PAYMENT_STATUS_ARRAY = Object.values(PAYMENT_STATUS);

// Payment Methods
export const PAYMENT_METHODS = {
  CASH: "cash",
  CARD: "card",
  FONEPAY: "fonepay",
  ESEWA: "esewa",
  MOBILE_BANKING: "mobile-banking",
};

export const PAYMENT_METHODS_ARRAY = Object.values(PAYMENT_METHODS);

// Menu Categories
export const MENU_CATEGORIES = {
  APPETIZER: "appetizer",
  MAIN: "main",
  DESSERT: "dessert",
  BEVERAGE: "beverage",
  OTHER: "other",
};

export const MENU_CATEGORIES_ARRAY = Object.values(MENU_CATEGORIES);

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Validation
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_REGEX: /^[0-9]{10,15}$/,
  MIN_PRICE: 0,
  MAX_PRICE: 999999,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 100,
};

// Rate Limiting
export const RATE_LIMIT = {
  LOGIN_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  LOGIN_MAX_ATTEMPTS: 50,
  API_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  API_MAX_REQUESTS: 100,
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
};

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access forbidden",
  NOT_FOUND: "Resource not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  EMAIL_EXISTS: "Email already registered",
  INVALID_INPUT: "Invalid input data",
  SERVER_ERROR: "Internal server error",
  RATE_LIMIT_EXCEEDED: "Too many requests, please try again later",
  INVALID_TOKEN: "Invalid or expired token",
  OUTLET_REQUIRED: "Outlet is required for this role",
  PRICE_MISMATCH: "Price does not match menu item",
};
