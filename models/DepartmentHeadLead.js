const BaseModel = require('./BaseModel');

class DepartmentHeadLead extends BaseModel {
  constructor() {
    super('department_head_leads');
  }

  async createFromUi(uiLead, createdBy) {
    const query = `
      INSERT INTO department_head_leads (
        customer_id, customer, email, business, lead_source, product_names, category,
        sales_status, created, telecaller_status, payment_status,
        phone, address, gst_no, state, customer_type, date,
        connected_status, final_status, whatsapp, assigned_salesperson, assigned_telecaller,
        created_by, created_at, updated_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,NOW(),NOW())
      RETURNING id
    `;

    const values = [
      uiLead.customerId || null,
      uiLead.customer || null,
      uiLead.email || null,
      uiLead.business || null,
      uiLead.leadSource || null,
      uiLead.productNames || uiLead.productNamesText || 'N/A',
      uiLead.category || 'N/A',
      uiLead.salesStatus || 'PENDING',
      uiLead.createdAt || null,
      uiLead.telecallerStatus || 'INACTIVE',
      uiLead.paymentStatus || 'PENDING',
      uiLead.phone || null,
      uiLead.address || null,
      uiLead.gstNo || null,
      uiLead.state || null,
      uiLead.customerType || null,
      uiLead.date || null,
      uiLead.connectedStatus || 'pending',
      uiLead.finalStatus || 'open',
      uiLead.whatsapp || null,
      uiLead.assignedSalesperson || null,
      uiLead.assignedTelecaller || null,
      createdBy
    ];

    const result = await DepartmentHeadLead.query(query, values);
    return result.rows && result.rows[0] ? result.rows[0] : null;
  }

  async bulkCreateFromUi(rows, createdBy) {
    if (!Array.isArray(rows) || rows.length === 0) return { rowCount: 0 };
    let i = 1;
    const placeholders = rows.map(() =>
      `($${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},$${i++},NOW(),NOW())`
    ).join(',');

    const query = `
      INSERT INTO department_head_leads (
        customer_id, customer, email, business, lead_source, product_names, category,
        sales_status, created, telecaller_status, payment_status,
        phone, address, gst_no, state, customer_type, date,
        connected_status, final_status, whatsapp, assigned_salesperson, assigned_telecaller,
        created_by, created_at, updated_at
      ) VALUES ${placeholders}
      RETURNING id
    `;

    const values = rows.flatMap((r) => [
      r.customerId || null,
      r.customer || null,
      r.email || null,
      r.business || null,
      r.leadSource || null,
      r.productNames || r.productNamesText || 'N/A',
      r.category || 'N/A',
      r.salesStatus || 'PENDING',
      r.createdAt || null,
      r.telecallerStatus || 'INACTIVE',
      r.paymentStatus || 'PENDING',
      r.phone || null,
      r.address || null,
      r.gstNo || null,
      r.state || null,
      r.customerType || null,
      r.date || null,
      r.connectedStatus || 'pending',
      r.finalStatus || 'open',
      r.whatsapp || null,
      r.assignedSalesperson || null,
      r.assignedTelecaller || null,
      createdBy
    ]);

    return DepartmentHeadLead.query(query, values);
  }

  async getAll(filters = {}, pagination = {}) {
    let query = `
      SELECT 
        id, customer_id, customer, email, business, lead_source, product_names, category,
        sales_status, created, telecaller_status, payment_status,
        phone, address, gst_no, state, customer_type, date,
        connected_status, final_status, whatsapp, assigned_salesperson, assigned_telecaller,
        created_by, created_at, updated_at
      FROM department_head_leads
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Add filters
    if (filters.search) {
      conditions.push(`(customer ILIKE $${paramCount} OR email ILIKE $${paramCount} OR business ILIKE $${paramCount})`);
      values.push(`%${filters.search}%`);
      paramCount++;
    }

    if (filters.state) {
      conditions.push(`state = $${paramCount}`);
      values.push(filters.state);
      paramCount++;
    }

    if (filters.productType) {
      conditions.push(`product_type = $${paramCount}`);
      values.push(filters.productType);
      paramCount++;
    }

    if (filters.connectedStatus) {
      conditions.push(`connected_status = $${paramCount}`);
      values.push(filters.connectedStatus);
      paramCount++;
    }

    if (filters.createdBy) {
      conditions.push(`created_by = $${paramCount}`);
      values.push(filters.createdBy);
      paramCount++;
    }

    // Add WHERE clause if conditions exist
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    // Add ORDER BY
    query += ` ORDER BY created_at DESC`;

    // Add pagination
    if (pagination.limit) {
      query += ` LIMIT $${paramCount}`;
      values.push(pagination.limit);
      paramCount++;
    }

    if (pagination.offset) {
      query += ` OFFSET $${paramCount}`;
      values.push(pagination.offset);
      paramCount++;
    }

    const result = await DepartmentHeadLead.query(query, values);
    return result.rows || [];
  }

  async getById(id) {
    const query = `
      SELECT 
        id, customer_id, customer, email, business, lead_source, product_names, category,
        sales_status, created, telecaller_status, payment_status,
        phone, address, gst_no, state, customer_type, date,
        connected_status, final_status, whatsapp, assigned_salesperson, assigned_telecaller,
        created_by, created_at, updated_at
      FROM department_head_leads
      WHERE id = $1
    `;
    const result = await DepartmentHeadLead.query(query, [id]);
    return result.rows && result.rows[0] ? result.rows[0] : null;
  }

  async updateById(id, updateData) {
    const allowedFields = [
      'customer', 'email', 'business', 'leadSource', 'productNames', 'category',
      'salesStatus', 'created', 'telecallerStatus', 'paymentStatus',
      'phone', 'address', 'gstNo', 'state', 'customerType', 'date',
      'connectedStatus', 'finalStatus', 'whatsapp', 'assignedSalesperson', 'assignedTelecaller'
    ];

    const fieldMap = {
      leadSource: 'lead_source',
      productNames: 'product_names',
      salesStatus: 'sales_status',
      telecallerStatus: 'telecaller_status',
      paymentStatus: 'payment_status',
      gstNo: 'gst_no',
      customerType: 'customer_type',
      connectedStatus: 'connected_status',
      finalStatus: 'final_status',
      assignedSalesperson: 'assigned_salesperson',
      assignedTelecaller: 'assigned_telecaller'
    };

    const updates = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach((key) => {
      if (allowedFields.includes(key) && updateData[key] !== undefined) {
        const column = fieldMap[key] || key;
        updates.push(`${column} = $${paramCount++}`);
        values.push(updateData[key]);
      }
    });

    if (updates.length === 0) {
      return { rowCount: 0 };
    }

    const query = `
      UPDATE department_head_leads
      SET ${updates.join(', ')}, updated_at = NOW()
      WHERE id = $${paramCount}
    `;
    values.push(id);
    return await DepartmentHeadLead.query(query, values);
  }

  async getStats(createdBy) {
    const query = `
      SELECT
        COUNT(*) as total,
        COUNT(CASE WHEN sales_status = 'PENDING' THEN 1 END) as pending,
        COUNT(CASE WHEN sales_status = 'IN_PROGRESS' THEN 1 END) as in_progress,
        COUNT(CASE WHEN sales_status = 'COMPLETED' THEN 1 END) as completed,
        COUNT(CASE WHEN telecaller_status = 'ACTIVE' THEN 1 END) as active_telecallers,
        COUNT(CASE WHEN telecaller_status = 'INACTIVE' THEN 1 END) as inactive_telecallers,
        COUNT(CASE WHEN payment_status = 'PENDING' THEN 1 END) as pending_payments,
        COUNT(CASE WHEN payment_status = 'IN_PROGRESS' THEN 1 END) as in_progress_payments,
        COUNT(CASE WHEN payment_status = 'COMPLETED' THEN 1 END) as completed_payments
      FROM department_head_leads
      WHERE created_by = $1
    `;

    const result = await DepartmentHeadLead.query(query, [createdBy]);
    return result.rows && result.rows[0] ? result.rows[0] : {
      total: 0,
      pending: 0,
      in_progress: 0,
      completed: 0,
      active_telecallers: 0,
      inactive_telecallers: 0,
      pending_payments: 0,
      in_progress_payments: 0,
      completed_payments: 0
    };
  }
}

module.exports = new DepartmentHeadLead();


