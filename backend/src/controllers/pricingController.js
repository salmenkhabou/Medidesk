import { db } from '../db/index.js';

export const getPricingPlans = (req, res) => {
  try {
    const plans = db.prepare(`SELECT * FROM pricing_plans`).all();
    const formatted = plans.map(p => ({
      ...p,
      features: JSON.parse(p.features_json)
    }));

    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
