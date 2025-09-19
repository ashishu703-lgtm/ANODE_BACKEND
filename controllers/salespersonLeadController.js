const SalespersonLead = require('../models/SalespersonLead');

class SalespersonLeadController {
  async listForLoggedInUser(req, res) {
    try {
      const username = req.user?.username;
      if (!username) {
        return res.status(400).json({ success: false, message: 'Username not available in token' });
      }
      const rows = await SalespersonLead.listForUser(username);
      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching salesperson leads (self):', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch leads', error: error.message });
    }
  }

  async listForUsername(req, res) {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ success: false, message: 'Username is required' });
      }
      const rows = await SalespersonLead.listForUser(username);
      return res.json({ success: true, data: rows });
    } catch (error) {
      console.error('Error fetching salesperson leads (by username):', error);
      return res.status(500).json({ success: false, message: 'Failed to fetch leads', error: error.message });
    }
  }
}

module.exports = new SalespersonLeadController();


