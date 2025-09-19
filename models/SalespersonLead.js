const BaseModel = require('./BaseModel');

class SalespersonLead extends BaseModel {
  constructor() {
    super('salesperson_leads');
  }

  /**
   * Upsert by id, enforcing salesperson_leads.id equals department_head_leads.id
   */
  async upsertById(payload) {
    const {
      id,
      dh_lead_id,
      name,
      phone,
      email,
      business,
      address,
      gst_no,
      product_type,
      state,
      lead_source,
      customer_type,
      date,
      connected_status,
      final_status,
      whatsapp,
      created_by,
    } = payload;

    const query = `
      INSERT INTO salesperson_leads (
        id, dh_lead_id, name, phone, email, business, address, gst_no, product_type,
        state, lead_source, customer_type, date, connected_status, final_status, whatsapp,
        created_by, created_at, updated_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,
        $10,$11,$12,$13,$14,$15,$16,
        $17, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        dh_lead_id = EXCLUDED.dh_lead_id,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        email = EXCLUDED.email,
        business = EXCLUDED.business,
        address = EXCLUDED.address,
        gst_no = EXCLUDED.gst_no,
        product_type = EXCLUDED.product_type,
        state = EXCLUDED.state,
        lead_source = EXCLUDED.lead_source,
        customer_type = EXCLUDED.customer_type,
        date = EXCLUDED.date,
        connected_status = EXCLUDED.connected_status,
        final_status = EXCLUDED.final_status,
        whatsapp = EXCLUDED.whatsapp,
        updated_at = NOW()
    `;

    const values = [
      id,
      dh_lead_id,
      name,
      phone,
      email,
      business,
      address,
      gst_no,
      product_type,
      state,
      lead_source,
      customer_type,
      date,
      connected_status,
      final_status,
      whatsapp,
      created_by,
    ];

    return await SalespersonLead.query(query, values);
  }

  async listForUser(username) {
    const query = `
      SELECT * FROM salesperson_leads
      WHERE 1=1
        AND (
          EXISTS (
            SELECT 1 FROM department_head_leads dhl
            WHERE dhl.id = salesperson_leads.dh_lead_id
              AND (dhl.assigned_salesperson = $1 OR dhl.assigned_telecaller = $1)
          )
        )
      ORDER BY updated_at DESC
    `;
    const result = await SalespersonLead.query(query, [username]);
    return result.rows || [];
  }
}

module.exports = new SalespersonLead();


