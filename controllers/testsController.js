const { getAllTests, createTest } = require("../models/testsModel");


// Controller to handle GET request to fetch all tests
exports.getTests = async (req, res) => {
  try {
    const tests = await getAllTests();
    res.status(200).json(tests); // Return all tests
  } catch (error) {
    console.error("Error in getTests:", error);
    res.status(500).json({ error: "Failed to fetch tests" });
  }
};

// Controller to handle POST request to create a new test
exports.createTestController = async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Test name is required" });
  }

  try {
    const newTest = await createTest(name);
    res.status(201).json(newTest); // Return newly created test
  } catch (error) {
    console.error("Error in createTestController:", error);
    res.status(500).json({ error: "Failed to create test" });
  }
};
