// src/services/inventoryService.js
import { v4 as uuidv4 } from 'uuid';
import auditService from './auditService';

// Temporary storage until we have a backend
let inventoryItems = [
  {
    id: uuidv4(),
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    quantity: 10,
    price: 999.99,
    category: 'electronics',
    sku: 'LAP-001',
    minStock: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Office Chair',
    description: 'Ergonomic office chair with lumbar support',
    quantity: 15,
    price: 199.99,
    category: 'furniture',
    sku: 'CHR-001',
    minStock: 8,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: uuidv4(),
    name: 'Wireless Mouse',
    description: 'Bluetooth wireless mouse',
    quantity: 30,
    price: 29.99,
    category: 'electronics',
    sku: 'MOU-001',
    minStock: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export const inventoryService = {
  // Get all items with optional filtering and sorting
  getItems: async (filters = {}, sort = {}) => {
    let filteredItems = [...inventoryItems];

    // Apply filters
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.sku?.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filteredItems = filteredItems.filter(item => 
        item.category === filters.category
      );
    }

    // Price range filter
    if (filters.minPrice) {
      filteredItems = filteredItems.filter(item => 
        item.price >= parseFloat(filters.minPrice)
      );
    }
    if (filters.maxPrice) {
      filteredItems = filteredItems.filter(item => 
        item.price <= parseFloat(filters.maxPrice)
      );
    }

    // Quantity range filter
    if (filters.minQuantity) {
      filteredItems = filteredItems.filter(item => 
        item.quantity >= parseInt(filters.minQuantity)
      );
    }
    if (filters.maxQuantity) {
      filteredItems = filteredItems.filter(item => 
        item.quantity <= parseInt(filters.maxQuantity)
      );
    }

    // Apply sorting
    if (sort.field) {
      filteredItems.sort((a, b) => {
        let aValue = a[sort.field];
        let bValue = b[sort.field];

        // Handle numeric fields
        if (sort.field === 'price' || sort.field === 'quantity') {
          aValue = parseFloat(aValue) || 0;
          bValue = parseFloat(bValue) || 0;
        }
        // Handle string fields
        else {
          aValue = String(aValue).toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (sort.direction === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filteredItems;
  },

  // Get a single item by ID
  getItemById: async (id) => {
    const item = inventoryItems.find(item => item.id === id);
    if (!item) throw new Error('Item not found');
    return item;
  },

  // Add a new item
  addItem: async (itemData, userId) => {
    const newItem = {
      id: uuidv4(),
      ...itemData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: userId
    };

    inventoryItems.push(newItem);

    // Create audit log entry
    await auditService.createLog({
      action: 'create',
      entityType: 'inventory_item',
      entityId: newItem.id,
      userId,
      changes: { newValues: newItem }
    });

    return newItem;
  },

  // Update an existing item
  updateItem: async (id, updates, userId) => {
    const index = inventoryItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');

    const oldItem = { ...inventoryItems[index] };
    const updatedItem = {
      ...oldItem,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    inventoryItems[index] = updatedItem;

    // Create audit log entry
    await auditService.createLog({
      action: 'update',
      entityType: 'inventory_item',
      entityId: id,
      userId,
      changes: {
        oldValues: oldItem,
        newValues: updatedItem
      }
    });

    return updatedItem;
  },

  // Delete an item
  deleteItem: async (id, userId) => {
    const index = inventoryItems.findIndex(item => item.id === id);
    if (index === -1) throw new Error('Item not found');

    const deletedItem = inventoryItems[index];
    inventoryItems = inventoryItems.filter(item => item.id !== id);

    // Create audit log entry
    await auditService.createLog({
      action: 'delete',
      entityType: 'inventory_item',
      entityId: id,
      userId,
      changes: { oldValues: deletedItem }
    });

    return deletedItem;
  },

  // Bulk operations
  bulkUpdate: async (items, userId) => {
    const updatedItems = [];
    for (const item of items) {
      if (item.id) {
        updatedItems.push(await inventoryService.updateItem(item.id, item, userId));
      } else {
        updatedItems.push(await inventoryService.addItem(item, userId));
      }
    }
    return updatedItems;
  }
};

export default inventoryService; 