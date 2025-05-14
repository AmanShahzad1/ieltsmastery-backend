const PerformanceModel = require('../models/performanceModel');
const pool = require('../dbConfig');



exports.updatePerformance = async (req, res) => {
  try {
    const { userId, testId, testType } = req.body;
    console.log("Saving Performance!");
    console.log(userId, testId, testType);
    if (testType === 'reading' || testType === 'listening') {
      const result = await PerformanceModel.calculateObjectiveTestPerformance(
        userId, 
        testId, 
        testType
      );
      return res.status(200).json(result);
    }
    else if (testType === 'writing' || testType === 'speaking') {
      const result = await PerformanceModel.updateSubjectiveTestPerformance(
        userId,
        testId,
        testType
      );
      return res.status(200).json(result);
    }
    
    return res.status(400).json({ error: 'Invalid test type' });
  } catch (error) {
    console.error('Error updating performance:', error);
    res.status(500).json({ error: 'Failed to update performance' });
  }
};


exports.getUserPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching Performance Analytics");
    const performanceData = await PerformanceModel.getUserPerformance(userId);
    res.status(200).json(performanceData);
  } catch (error) {
    console.error('Error fetching performance data:', error);
    res.status(500).json({ error: 'Failed to fetch performance data' });
  }
};

exports.getHistoricalPerformance = async (req, res) => {
  try {
    const { userId } = req.params;
    console.log("Fetching Performance Analytics Historical");
    
    const query = `
      SELECT 
        DATE_TRUNC('week', test_date) as week_start,
        AVG(accuracy) as avg_accuracy
      FROM user_performance
      WHERE user_id = $1
      GROUP BY week_start
      ORDER BY week_start
    `;
    
    const { rows } = await pool.query(query, [userId]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error fetching historical performance:', error);
    res.status(500).json({ error: 'Failed to fetch historical data' });
  }
};