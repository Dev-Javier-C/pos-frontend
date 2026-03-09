// src/types/index.js

/**
 * User roles in the system
 */
export const USER_ROLES = {
    ADMIN: 'admin',
    MANAGER: 'manager', 
    VIEWER: 'viewer'
  };
  
  /**
   * Audit log action types
   */
  export const AUDIT_ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'login',
    LOGOUT: 'logout',
    VIEW: 'view'
  };
  
  /**
   * Inventory item categories
   */
  export const ITEM_CATEGORIES = {
    ELECTRONICS: 'electronics',
    CLOTHING: 'clothing',
    BOOKS: 'books',
    FOOD: 'food',
    TOOLS: 'tools',
    FURNITURE: 'furniture',
    OTHER: 'other'
  };
  
  /**
   * User data structure
   * @typedef {Object} User
   * @property {string} id - Unique identifier
   * @property {string} username - User's login name
   * @property {string} email - User's email address
   * @property {string} role - User's role (admin, manager, viewer)
   * @property {string} firstName - User's first name
   * @property {string} lastName - User's last name
   * @property {Date} createdAt - When the user was created
   * @property {Date} lastLogin - When the user last logged in
   * @property {boolean} isActive - Whether the user account is active
   */
  
  /**
   * Inventory item data structure
   * @typedef {Object} InventoryItem
   * @property {string} id - Unique identifier
   * @property {string} name - Item name
   * @property {string} description - Item description
   * @property {number} quantity - Current quantity in stock
   * @property {number} price - Item price
   * @property {string} category - Item category
   * @property {string} sku - Stock Keeping Unit (optional)
   * @property {number} minStock - Minimum stock level for alerts
   * @property {string} location - Storage location (optional)
   * @property {Date} createdAt - When the item was created
   * @property {Date} updatedAt - When the item was last updated
   * @property {string} createdBy - ID of user who created the item
   * @property {string} updatedBy - ID of user who last updated the item
   */
  
  /**
   * Audit log entry data structure
   * @typedef {Object} AuditLog
   * @property {string} id - Unique identifier
   * @property {string} action - Type of action performed
   * @property {string} entityType - Type of entity (user, inventory_item, etc.)
   * @property {string} entityId - ID of the entity that was affected
   * @property {string} userId - ID of user who performed the action
   * @property {Object} oldValues - Previous values (for updates)
   * @property {Object} newValues - New values (for creates/updates)
   * @property {Date} timestamp - When the action occurred
   * @property {string} ipAddress - IP address of the user (optional)
   * @property {string} userAgent - Browser/device info (optional)
   */
  
  /**
   * API response structure
   * @typedef {Object} ApiResponse
   * @property {boolean} success - Whether the request was successful
   * @property {*} data - Response data
   * @property {string} message - Success or error message
   * @property {Array} errors - Array of validation errors (if any)
   */
  
  /**
   * Permission levels for different roles
   */
  export const ROLE_PERMISSIONS = {
    [USER_ROLES.ADMIN]: {
      inventory: ['create', 'read', 'update', 'delete'],
      users: ['create', 'read', 'update', 'delete'],
      audit: ['read'],
      reports: ['read', 'export']
    },
    [USER_ROLES.MANAGER]: {
      inventory: ['create', 'read', 'update'],
      users: ['read'],
      audit: ['read'],
      reports: ['read', 'export']
    },
    [USER_ROLES.VIEWER]: {
      inventory: ['read'],
      users: [],
      audit: [],
      reports: ['read']
    }
  };
  
  /**
   * Helper function to check if user has permission
   * @param {string} userRole - User's role
   * @param {string} resource - Resource type (inventory, users, etc.)
   * @param {string} action - Action type (create, read, update, delete)
   * @returns {boolean} - Whether the user has permission
   */
  export const hasPermission = (userRole, resource, action) => {
    const permissions = ROLE_PERMISSIONS[userRole];
    if (!permissions || !permissions[resource]) {
      return false;
    }
    return permissions[resource].includes(action);
  };