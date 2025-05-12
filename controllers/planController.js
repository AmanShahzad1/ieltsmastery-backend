const Plan = require('../models/planModel');  
const pool = require('../dbConfig');

exports.updatePlanWithTest = async (req, res) => {
  const { testId, difficulty, testType } = req.body;
  
  if (!testId || !difficulty || !testType) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: testId, difficulty, or testType"
    });
  }

  const pgDifficulty = difficulty.toLowerCase();
  const pgTestType = testType.toLowerCase();
  const column = `${pgTestType}_test_ids`;

  try {
    // Start transaction
    await pool.query('BEGIN');

    // 1. First remove from any other difficulty levels
    const removeResult = await pool.query(
      `UPDATE plans
       SET ${column} = array_remove(${column}, $1),
           updated_at = NOW()
       WHERE level != $2
       AND $1 = ANY(${column})
       RETURNING plan_id, level`,
      [testId, pgDifficulty]
    );

    // 2. Then add to target difficulty (if not already present)
    const addResult = await pool.query(
      `UPDATE plans
       SET ${column} = array_append(${column}, $1),
           updated_at = NOW()
       WHERE level = $2
       AND NOT $1 = ANY(${column})
       RETURNING plan_id`,
      [testId, pgDifficulty]
    );

    await pool.query('COMMIT');

    const removedFrom = removeResult.rows.map(row => row.level);
    const addedTo = addResult.rowCount > 0 ? pgDifficulty : null;

    console.log(`Test ${testId} moved: Removed from ${removedFrom.join(', ') || 'none'}, ${addedTo ? 'added to ' + addedTo : 'already present in target'}`);

    return res.json({
      success: true,
      changes: {
        removedFrom,
        addedTo,
        testId,
        testType: pgTestType
      },
      message: addedTo 
        ? `Test moved to ${pgDifficulty} level`
        : `Test already exists in ${pgDifficulty} level`
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error("Transaction failed:", error.message);
    
    return res.status(500).json({
      success: false,
      message: "Failed to relocate test",
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};


// New functions for plan assignment
exports.assignPlan = async (req, res) => {
  const { userId, level } = req.body;

  if (!userId || !level) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: userId or level"
    });
  }

  try {
    await pool.query('BEGIN');

    // 1. Find matching plan
    const { rows: [plan] } = await pool.query(
      `SELECT plan_id, 
              COALESCE(reading_test_ids, '{}') as reading_test_ids,
              COALESCE(writing_test_ids, '{}') as writing_test_ids,
              COALESCE(listening_test_ids, '{}') as listening_test_ids,
              COALESCE(speaking_test_ids, '{}') as speaking_test_ids
       FROM plans 
       WHERE level = $1`,
      [level.toLowerCase()]
    );

    if (!plan) {
      await pool.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: `No ${level} plan found`
      });
    }

    // 2. Prepare dates and completion status
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 3);
    
    const completionStatus = {
      reading: { completed: [], pending: plan.reading_test_ids },
      writing: { completed: [], pending: plan.writing_test_ids },
      listening: { completed: [], pending: plan.listening_test_ids },
      speaking: { completed: [], pending: plan.speaking_test_ids }
    };

    // 3. Check if user has any existing plan
    const { rows: [existingPlan] } = await pool.query(
      `SELECT * FROM user_plans WHERE user_id = $1`,
      [userId]
    );

    let userPlan;
    if (existingPlan) {
      // Update existing user's plan (regardless of previous plan_id)
      userPlan = await pool.query(
        `UPDATE user_plans
         SET plan_id = $1,
             start_date = $2,
             end_date = $3,
             is_active = true,
             completion_status = $4
         WHERE user_id = $5
         RETURNING *`,
        [
          plan.plan_id,
          startDate,
          endDate,
          JSON.stringify(completionStatus),
          userId
        ]
      );
    } else {
      // Create new plan for user
      userPlan = await pool.query(
        `INSERT INTO user_plans (
          user_id, plan_id, start_date, end_date, 
          is_active, completion_status
         ) VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          userId,
          plan.plan_id,
          startDate,
          endDate,
          true,
          JSON.stringify(completionStatus)
        ]
      );
    }

    await pool.query('COMMIT');

    res.json({
      success: true,
      plan: userPlan.rows[0]
    });

  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error assigning plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign plan',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};

exports.getUserPlan = async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await pool.query(
      `SELECT up.*, p.level 
       FROM user_plans up
       JOIN plans p ON up.plan_id = p.plan_id
       WHERE up.user_id = $1 AND up.is_active = true`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No active plan found'
      });
    }

    res.json({
      success: true,
      plan: result.rows[0]
    });

  } catch (error) {
    console.error('Error fetching user plan:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user plan',
      error: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
};