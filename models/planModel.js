const pool = require("../dbConfig");

 

exports.findByDifficulty = async (difficulty) => {
    try {
      const result = await pool.query("SELECT * FROM plans WHERE level = $1", [difficulty]);
      return result.rows[0]; // Return the list of tests
    } catch (error) {
      throw new Error("Error fetching tests: " + error.message);
    }
  };








// export const UserPlanModel = {
//   /**
//    * Updates a user's plan
//    * @param userId - The ID of the user
//    * @param planId - The ID of the plan
//    * @param updateData - Partial plan data to update
//    * @returns The updated user plan
//    */
//   async updateUserPlan(
//     userId: number,
//     planId: number,
//     updateData: Partial<Omit<UserPlan, 'user_id' | 'plan_id'>>
//   ): Promise<UserPlan | null> {
//     const updateFields = [];
//     const values = [];
//     let valueIndex = 1;

//     if (updateData.start_date !== undefined) {
//       updateFields.push(`start_date = $${valueIndex}`);
//       values.push(updateData.start_date);
//       valueIndex++;
//     }

//     if (updateData.end_date !== undefined) {
//       updateFields.push(`end_date = $${valueIndex}`);
//       values.push(updateData.end_date);
//       valueIndex++;
//     }

//     if (updateData.is_active !== undefined) {
//       updateFields.push(`is_active = $${valueIndex}`);
//       values.push(updateData.is_active);
//       valueIndex++;
//     }

//     if (updateData.completion_status !== undefined) {
//       updateFields.push(`completion_status = $${valueIndex}`);
//       values.push(JSON.stringify(updateData.completion_status));
//       valueIndex++;
//     }

//     if (updateFields.length === 0) {
//       throw new Error('No fields to update');
//     }

//     values.push(userId, planId);

//     const query = `
//       UPDATE user_plans
//       SET ${updateFields.join(', ')}
//       WHERE user_id = $${valueIndex} AND plan_id = $${valueIndex + 1}
//       RETURNING *;
//     `;

//     const { rows } = await pool.query(query, values);
//     return rows[0] || null;
//   },

// //   /**
// //    * Gets a user's plan by user ID and plan ID
// //    * @param userId - The ID of the user
// //    * @param planId - The ID of the plan
// //    * @returns The user plan if found, otherwise null
// //    */
// //   async getUserPlan(userId: number, planId: number): Promise<UserPlan | null> {
// //     const query = `
// //       SELECT * FROM user_plans
// //       WHERE user_id = $1 AND plan_id = $2;
//     `;
//     const { rows } = await pool.query(query, [userId, planId]);
//     return rows[0] || null;
//   },

//   /**
//    * Marks a task as completed in the user's plan
//    * @param userId - The ID of the user
//    * @param planId - The ID of the plan
//    * @param section - The section (reading, writing, etc.)
//    * @param taskId - The ID of the task to mark as completed
//    * @returns The updated user plan
//    */
//   async completeTask(
//     userId: number,
//     planId: number,
//     section: keyof CompletionStatus,
//     taskId: number
//   ): Promise<UserPlan | null> {
//     const client = await pool.connect();
    
//     try {
//       await client.query('BEGIN');
      
//       // First get the current plan
//       const plan = await this.getUserPlan(userId, planId);
//       if (!plan) {
//         throw new Error('Plan not found');
//       }

//       // Update the completion status
//       const updatedStatus = { ...plan.completion_status };
      
//       // Remove from pending and add to completed
//       updatedStatus[section].pending = updatedStatus[section].pending.filter(id => id !== taskId);
//       if (!updatedStatus[section].completed.includes(taskId)) {
//         updatedStatus[section].completed.push(taskId);
//       }

//       // Update the plan
//       const updatedPlan = await this.updateUserPlan(userId, planId, {
//         completion_status: updatedStatus
//       });

//       await client.query('COMMIT');
//       return updatedPlan;
//     } catch (error) {
//       await client.query('ROLLBACK');
//       throw error;
//     } finally {
//       client.release();
//     }
//   }
// };