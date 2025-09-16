const BaseModel = require('./BaseModel');

class Lead extends BaseModel {
  constructor() {
    super('leads');
  }

  // Create a new lead
  async create(leadData) {
    const {
      name,
      phone,
      email,
      business,
      address,
      gstNo,
      productType,
      state,
      leadSource,
      customerType,
      date,
      connectedStatus,
      finalStatus,
      whatsapp,
      createdBy,
      transferredFrom,
      transferredTo,
      transferReason
    } = leadData;

    const query = `
      INSERT INTO leads (
        name, phone, email, business, address, gst_no, product_type, 
        state, lead_source, customer_type, date, connected_status, 
        final_status, whatsapp, created_by, transferred_from, transferred_to, 
        transferred_at, transfer_reason, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, NOW(), NOW())
    `;

    const values = [
      name, phone, email, business, address, gstNo, productType,
      state, leadSource, customerType, date, connectedStatus,
      finalStatus, whatsapp, createdBy, transferredFrom, transferredTo,
      transferredFrom ? new Date() : null, transferReason
    ];

    return await Lead.query(query, values);
  }

  // Bulk create leads from CSV import
  async bulkCreate(leadsData) {
    console.log('Lead.bulkCreate called with:', leadsData);
    
    if (!leadsData || leadsData.length === 0) {
      throw new Error('No leads data provided');
    }

    // Generate PostgreSQL-style placeholders
    let paramCount = 1;
    const placeholders = leadsData.map(() => {
      const placeholder = `(${Array.from({length: 19}, () => `$${paramCount++}`).join(', ')}, NOW(), NOW())`;
      return placeholder;
    }).join(', ');

    const query = `
      INSERT INTO leads (
        name, phone, email, business, address, gst_no, product_type, 
        state, lead_source, customer_type, date, connected_status, 
        final_status, whatsapp, created_by, transferred_from, transferred_to, 
        transferred_at, transfer_reason, created_at, updated_at
      ) VALUES ${placeholders}
    `;

    const values = leadsData.flatMap(lead => [
      lead.name,
      lead.phone,
      lead.email,
      lead.business,
      lead.address,
      lead.gstNo,
      lead.productType,
      lead.state,
      lead.leadSource,
      lead.customerType,
      lead.date,
      lead.connectedStatus,
      lead.finalStatus,
      lead.whatsapp,
      lead.createdBy,
      lead.transferredFrom || null,
      lead.transferredTo || null,
      lead.transferredFrom ? new Date() : null,
      lead.transferReason || null
    ]);

    console.log('Executing query:', query);
    console.log('With values:', values);

    try {
      const result = await Lead.query(query, values);
      console.log('Query executed successfully:', result);
      return result;
    } catch (error) {
      console.error('Database query failed:', error);
      throw error;
    }
  }

  // Get all leads with pagination
  async getAll(filters = {}, pagination = {}) {
    let query = `
      SELECT 
        id, name, phone, email, business, address, gst_no as gstNo,
        product_type as productType, state, lead_source as leadSource,
        customer_type as customerType, date, connected_status as connectedStatus,
        final_status as finalStatus, whatsapp, created_by as createdBy,
        transferred_from as transferredFrom, transferred_to as transferredTo,
        transferred_at as transferredAt, transfer_reason as transferReason,
        created_at as createdAt, updated_at as updatedAt
      FROM leads
      WHERE 1=1
    `;

    const values = [];

    // Add filters
    if (filters.search) {
      query += ` AND (name LIKE ? OR phone LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      values.push(searchTerm, searchTerm, searchTerm);
    }

    if (filters.state) {
      query += ` AND state = ?`;
      values.push(filters.state);
    }

    if (filters.productType) {
      query += ` AND product_type = ?`;
      values.push(filters.productType);
    }

    if (filters.connectedStatus) {
      query += ` AND connected_status = ?`;
      values.push(filters.connectedStatus);
    }

    if (filters.createdBy) {
      query += ` AND created_by = ?`;
      values.push(filters.createdBy);
    }

    // Add ordering
    query += ` ORDER BY created_at DESC`;

    // Add pagination
    if (pagination.limit) {
      query += ` LIMIT ?`;
      values.push(pagination.limit);

      if (pagination.offset) {
        query += ` OFFSET ?`;
        values.push(pagination.offset);
      }
    }

    return await Lead.query(query, values);
  }

  // Get lead by ID
  async getById(id) {
    const query = `
      SELECT 
        id, name, phone, email, business, address, gst_no as gstNo,
        product_type as productType, state, lead_source as leadSource,
        customer_type as customerType, date, connected_status as connectedStatus,
        final_status as finalStatus, whatsapp, created_by as createdBy,
        transferred_from as transferredFrom, transferred_to as transferredTo,
        transferred_at as transferredAt, transfer_reason as transferReason,
        created_at as createdAt, updated_at as updatedAt
      FROM leads 
      WHERE id = $1
    `;

    const result = await Lead.query(query, [id]);
    return result.rows.length > 0 ? result.rows[0] : null;
  }

  // Update lead
  async update(id, updateData) {
    const allowedFields = [
      'name', 'phone', 'email', 'business', 'address', 'gstNo', 'productType',
      'state', 'leadSource', 'customerType', 'date', 'connectedStatus',
      'finalStatus', 'whatsapp'
    ];

    const updateFields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        const dbField = key === 'gstNo' ? 'gst_no' :
                       key === 'productType' ? 'product_type' :
                       key === 'leadSource' ? 'lead_source' :
                       key === 'customerType' ? 'customer_type' :
                       key === 'connectedStatus' ? 'connected_status' :
                       key === 'finalStatus' ? 'final_status' : key;
        
        updateFields.push(`${dbField} = ?`);
        values.push(updateData[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    updateFields.push('updated_at = NOW()');
    values.push(id);

    const query = `
      UPDATE leads 
      SET ${updateFields.join(', ')} 
      WHERE id = ?
    `;

    return await Lead.query(query, values);
  }

  // Delete lead
  async delete(id) {
    const query = 'DELETE FROM leads WHERE id = ?';
    return await Lead.query(query, [id]);
  }

  // Transfer a lead to another user
  async transferLead(id, transferredTo, transferredFrom, reason = '') {
    const query = `
      UPDATE leads 
      SET 
        transferred_to = $1,
        transferred_from = $2,
        transferred_at = NOW(),
        transfer_reason = $3,
        updated_at = NOW()
      WHERE id = $4
    `;

    const values = [transferredTo, transferredFrom, reason, id];
    return await Lead.query(query, values);
  }

  // Get lead statistics
  async getStats(createdBy = null) {
    let query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN connected_status = 'connected' THEN 1 END) as connected,
        COUNT(CASE WHEN connected_status = 'not_connected' THEN 1 END) as notConnected,
        COUNT(CASE WHEN connected_status = 'pending' THEN 1 END) as pending,
        COUNT(CASE WHEN final_status = 'closed' THEN 1 END) as closed
      FROM leads
    `;

    const values = [];

    if (createdBy) {
      query += ` WHERE created_by = $1`;
      values.push(createdBy);
    }

    const result = await Lead.query(query, values);
    return result.rows[0];
  }
}

module.exports = new Lead();
