const { getAllTests, createTest, getTestPartData, saveTestPartData} = require("../models/testsModel");


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



// // Controller function to fetch test data
// exports.getTestData = async (req, res) => {
//   const { testId } = req.params;
//   try {
//     const testData = await fetchTestData(testId);
//     if (!testData) {
//       return res.status(404).json({ message: "Test not found" });
//     }
//     res.status(200).json(testData);
//   } catch (error) {
//     console.error("Error fetching test data:", error);
//     res.status(500).json({ message: "Error fetching test data", error });
//   }
// };

// // Controller function to save new test data
// exports.createTestData = async (req, res) => {
//   const testData = req.body;
//   try {
//     const savedTest = await saveTestData(testData);
//     res.status(201).json(savedTest);
//   } catch (error) {
//     console.error("Error saving test data:", error);
//     res.status(500).json({ message: "Error saving test data", error });
//   }
// };

// // Controller function to update existing test data
// exports.updateTestDataController = async (req, res) => {
//   const { testId } = req.params;
//   const testData = req.body;
//   testData.testId = testId; // Ensure the testId is included for update
//   try {
//     const updatedTest = await updateTestData(testData);
//     res.status(200).json(updatedTest);
//   } catch (error) {
//     console.error("Error updating test data:", error);
//     res.status(500).json({ message: "Error updating test data", error });
//   }
// };
  
// Controller to fetch test part data
exports.fetchTestPartData = async (req, res) => {
  const { testId, partName } = req.params;
  console.log("Request received: ", testId, partName);
  try {
    const data = await getTestPartData(testId, partName);
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Controller to save test part data
exports.saveTestPart = async (req, res) => {
  const { testId, partName, questions, readingMaterial } = req.body;
  console.log("Received data:", { testId, partName, questions, readingMaterial });
  try {
    const response = await saveTestPartData(testId, partName, questions, readingMaterial);
    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};