import { z } from "zod";
import {
  USER_ROLES_ARRAY,
  ORDER_STATUS_ARRAY,
  ORDER_TYPES_ARRAY,
  PAYMENT_STATUS_ARRAY,
  PAYMENT_METHODS_ARRAY,
  MENU_CATEGORIES_ARRAY,
  VALIDATION,
} from "./constants";

// Auth Validations
export const loginSchema = z.object({
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(255, "Email too long"),
  password: z
    .string()
    .min(1, "Password is required")
    .max(255, "Password too long"),
});

export const signupSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH, `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`)
    .max(VALIDATION.NAME_MAX_LENGTH, `Name must not exceed ${VALIDATION.NAME_MAX_LENGTH} characters`)
    .trim(),
  email: z
    .string()
    .email("Invalid email format")
    .min(1, "Email is required")
    .max(255, "Email too long")
    .toLowerCase(),
  password: z
    .string()
    .min(VALIDATION.PASSWORD_MIN_LENGTH, `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`)
    .max(255, "Password too long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  role: z.enum(USER_ROLES_ARRAY, {
    errorMap: () => ({ message: "Invalid role" }),
  }),
  outlet: z.string().optional(),
});

// User Validations
export const createUserSchema = signupSchema;

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH)
    .max(VALIDATION.NAME_MAX_LENGTH)
    .trim()
    .optional(),
  email: z.string().email().toLowerCase().optional(),
  role: z.enum(USER_ROLES_ARRAY).optional(),
  outlet: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Outlet Validations
export const createOutletSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH, "Outlet name is required")
    .max(VALIDATION.NAME_MAX_LENGTH, "Outlet name too long")
    .trim(),
  location: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH, "Location is required")
    .max(255, "Location too long")
    .trim(),
  address: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH, "Address is required")
    .max(500, "Address too long")
    .trim(),
  phone: z
    .string()
    .regex(VALIDATION.PHONE_REGEX, "Invalid phone number format")
    .trim(),
  manager: z.string().optional(),
  totalTables: z
    .number()
    .int()
    .min(1, "Must have at least 1 table")
    .max(1000, "Too many tables")
    .default(10),
  theme: z.enum(["orange", "green", "blue", "purple", "red"]).default("orange").optional(),
  isActive: z.boolean().default(true),
});

export const updateOutletSchema = createOutletSchema.partial();

// MenuItem Validations
export const createMenuItemSchema = z.object({
  name: z
    .string()
    .min(VALIDATION.NAME_MIN_LENGTH, "Item name is required")
    .max(VALIDATION.NAME_MAX_LENGTH, "Item name too long")
    .trim(),
  description: z.string().max(1000, "Description too long").trim().optional(),
  category: z.enum(MENU_CATEGORIES_ARRAY, {
    errorMap: () => ({ message: "Invalid category" }),
  }),
  price: z
    .number()
    .min(VALIDATION.MIN_PRICE, "Price must be positive")
    .max(VALIDATION.MAX_PRICE, "Price too high"),
  image: z.string().url("Invalid image URL").optional().or(z.literal("")),
  outlet: z.string().min(1, "Outlet is required"),
  isAvailable: z.boolean().default(true),
});

export const updateMenuItemSchema = createMenuItemSchema.partial();

// Order Validations
export const orderItemSchema = z.object({
  menuItem: z.string().min(1, "Menu item ID is required"),
  quantity: z
    .number()
    .int()
    .min(VALIDATION.MIN_QUANTITY, "Quantity must be at least 1")
    .max(VALIDATION.MAX_QUANTITY, "Quantity too high"),
  price: z
    .number()
    .min(VALIDATION.MIN_PRICE, "Price must be positive")
    .max(VALIDATION.MAX_PRICE, "Price too high"),
});

export const createOrderSchema = z.object({
  outlet: z.string().min(1, "Outlet is required"),
  orderType: z.enum(ORDER_TYPES_ARRAY, {
    errorMap: () => ({ message: "Invalid order type" }),
  }),
  tableNumber: z.number().int().min(1).optional(),
  items: z
    .array(orderItemSchema)
    .min(1, "Order must contain at least one item")
    .max(50, "Too many items in order"),
  paymentMethod: z.enum(PAYMENT_METHODS_ARRAY).optional(),
}).refine(
  (data) => {
    // If orderType is dine-in, tableNumber is required
    if (data.orderType === "dine-in") {
      return data.tableNumber !== undefined && data.tableNumber > 0;
    }
    return true;
  },
  {
    message: "Table number is required for dine-in orders",
    path: ["tableNumber"],
  }
);

export const updateOrderSchema = z.object({
  status: z.enum(ORDER_STATUS_ARRAY).optional(),
  paymentMethod: z.enum(PAYMENT_METHODS_ARRAY).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS_ARRAY).optional(),
});

// Payment Validations
export const createPaymentSchema = z.object({
  order: z.string().min(1, "Order ID is required"),
  amount: z
    .number()
    .min(VALIDATION.MIN_PRICE, "Amount must be positive")
    .max(VALIDATION.MAX_PRICE, "Amount too high"),
  method: z.enum(PAYMENT_METHODS_ARRAY, {
    errorMap: () => ({ message: "Invalid payment method" }),
  }),
  transactionId: z.string().max(255).optional(),
});

export const updatePaymentSchema = z.object({
  status: z.enum(PAYMENT_STATUS_ARRAY).optional(),
  transactionId: z.string().max(255).optional(),
});

// Query Validations
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export const orderQuerySchema = paginationSchema.extend({
  status: z.enum(ORDER_STATUS_ARRAY).optional(),
  outlet: z.string().optional(),
});

export const menuQuerySchema = paginationSchema.extend({
  category: z.enum(MENU_CATEGORIES_ARRAY).optional(),
  outlet: z.string().optional(),
});

// Validation Helper Function
export function validateData(schema, data) {
  try {
    return {
      success: true,
      data: schema.parse(data),
    };
  } catch (error) {
    return {
      success: false,
      errors: error.errors.map((err) => ({
        path: err.path.join("."),
        message: err.message,
      })),
    };
  }
}

// Async validation helper for API routes
export async function validateRequest(schema, data) {
  const result = validateData(schema, data);
  if (!result.success) {
    return {
      valid: false,
      errors: result.errors,
      data: null,
    };
  }
  return {
    valid: true,
    errors: null,
    data: result.data,
  };
}
