import { v4 as uuidv4 } from 'uuid';
import { useApp } from '../context/AppContext';

// In-memory storage for audit logs until we have a backend
let auditLogs = [];

const auditService = {
  // Get all logs with optional filtering
  getLogs: async (filters = {}) => {
    let filteredLogs = [...auditLogs];

    // Apply filters
    if (filters.userId) {
      filteredLogs = filteredLogs.filter(log => log.userId === filters.userId);
    }

    if (filters.action) {
      filteredLogs = filteredLogs.filter(log => log.action === filters.action);
    }

    if (filters.entityType) {
      filteredLogs = filteredLogs.filter(log => log.entityType === filters.entityType);
    }

    if (filters.startDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) >= new Date(filters.startDate)
      );
    }

    if (filters.endDate) {
      filteredLogs = filteredLogs.filter(log => 
        new Date(log.timestamp) <= new Date(filters.endDate)
      );
    }

    // Sort by timestamp descending (newest first)
    return filteredLogs.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  },

  // Create a new audit log entry
  createLog: async (logData) => {
    const newLog = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...logData,
      // Add browser info
      userAgent: navigator.userAgent,
      // In a real app, we'd get this from the server
      ipAddress: '127.0.0.1'
    };

    auditLogs.push(newLog);
    return newLog;
  },

  // Export logs to CSV
  exportLogs: async (filters = {}) => {
    const logs = await auditService.getLogs(filters);
    
    // Convert logs to CSV format
    const headers = [
      'Timestamp',
      'Action',
      'Entity Type',
      'Entity ID',
      'User ID',
      'Changes',
      'IP Address'
    ];

    const rows = logs.map(log => [
      log.timestamp,
      log.action,
      log.entityType,
      log.entityId,
      log.userId,
      JSON.stringify(log.changes || {}),
      log.ipAddress
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    return csvContent;
  },

  // Clear all logs (admin only)
  clearLogs: async () => {
    auditLogs = [];
  }
};

export default auditService; 