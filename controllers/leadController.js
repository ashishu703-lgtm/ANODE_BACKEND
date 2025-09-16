const Lead = require('../models/Lead');
const { validationResult } = require('express-validator');

class LeadController {
  // Create a new lead
  async create(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const leadData = {
        ...req.body,
        createdBy: req.user.email // Assuming user email is available in req.user
      };

      const result = await Lead.create(leadData);
      
      res.status(201).json({
        success: true,
        message: 'Lead created successfully',
        data: {
          id: result.insertId,
          ...leadData
        }
      });
    } catch (error) {
      console.error('Error creating lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create lead',
        error: error.message
      });
    }
  }

  // Get all leads with pagination and filters
  async getAll(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        state,
        productType,
        connectedStatus,
        createdBy
      } = req.query;

      const filters = {};
      if (search) filters.search = search;
      if (state) filters.state = state;
      if (productType) filters.productType = productType;
      if (connectedStatus) filters.connectedStatus = connectedStatus;
      if (createdBy) filters.createdBy = createdBy;

      const pagination = {
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      };

      const leads = await Lead.getAll(filters, pagination);
      const stats = await Lead.getStats(req.user.email);

      res.json({
        success: true,
        data: leads,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: stats.total
        },
        stats
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch leads',
        error: error.message
      });
    }
  }

  // Get lead by ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const lead = await Lead.getById(id);

      if (!lead) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.json({
        success: true,
        data: lead
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lead',
        error: error.message
      });
    }
  }

  // Update lead
  async update(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const updateData = req.body;

      const result = await Lead.update(id, updateData);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      const updatedLead = await Lead.getById(id);

      res.json({
        success: true,
        message: 'Lead updated successfully',
        data: updatedLead
      });
    } catch (error) {
      console.error('Error updating lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update lead',
        error: error.message
      });
    }
  }

  // Delete lead
  async delete(req, res) {
    try {
      const { id } = req.params;
      const result = await Lead.delete(id);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.json({
        success: true,
        message: 'Lead deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete lead',
        error: error.message
      });
    }
  }

  // Import leads from CSV
  async importCSV(req, res) {
    try {
      console.log('Import CSV request received:', {
        body: req.body,
        user: req.user,
        leadsCount: req.body.leads ? req.body.leads.length : 0
      });

      if (!req.user) {
        console.log('No user found in request - authentication issue');
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      if (!req.body.leads || !Array.isArray(req.body.leads)) {
        console.log('Invalid CSV data format - no leads array');
        return res.status(400).json({
          success: false,
          message: 'Invalid CSV data format'
        });
      }

      const leadsData = req.body.leads.map(lead => ({
        ...lead,
        createdBy: req.user ? req.user.email : 'unknown@example.com'
      }));

      console.log('Processed leads data:', leadsData);

      const result = await Lead.bulkCreate(leadsData);
      console.log('Database insert result:', result);

      res.status(201).json({
        success: true,
        message: `Successfully imported ${leadsData.length} leads`,
        data: {
          importedCount: leadsData.length,
          insertId: result.insertId
        }
      });
    } catch (error) {
      console.error('Error importing CSV:', error);
      console.error('Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to import CSV',
        error: error.message,
        details: error.stack
      });
    }
  }

  // Transfer a lead to another user
  async transferLead(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { id } = req.params;
      const { transferredTo, reason } = req.body;
      const transferredFrom = req.user.email;

      const result = await Lead.transferLead(id, transferredTo, transferredFrom, reason);

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: 'Lead not found'
        });
      }

      res.json({
        success: true,
        message: 'Lead transferred successfully'
      });
    } catch (error) {
      console.error('Error transferring lead:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to transfer lead',
        error: error.message
      });
    }
  }

  // Get lead statistics
  async getStats(req, res) {
    try {
      const stats = await Lead.getStats(req.user.email);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching lead stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch lead statistics',
        error: error.message
      });
    }
  }
}

module.exports = new LeadController();
