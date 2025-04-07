const express = require("express");
const router = express.Router();
const Record = require("../models/record");
const fs = require("fs");
const fsPromises = fs.promises;
const path = require("path");

router.post("/save-sql-file", async (req, res) => {
  console.log("Received SQL Query:", req.body); // Log the whole request body for debugging
  const { sqlQuery } = req.body;

  // Validate if sqlQuery is present in the request body
  if (!sqlQuery) {
    return res
      .status(400)
      .json({ error: "SQL query is missing in the request body" });
  }

  console.log("Received SQL Query:", sqlQuery);

  const dirPath = path.join(__dirname, "data"); // Ensure the path is correct

  try {
    // Check if the directory exists asynchronously using fs.promises.access
    try {
      await fsPromises.access(dirPath, fs.constants.F_OK);
    } catch (error) {
      // If directory doesn't exist, create it asynchronously
      await fsPromises.mkdir(dirPath, { recursive: true });
    }

    const filePath = path.join(dirPath, "SQL.txt");
    console.log("Saving file to:", filePath);

    // Save the SQL query to the file asynchronously
    await fsPromises.writeFile(filePath, sqlQuery);

    console.log(`File saved successfully at ${filePath}`);
    res.status(200).json({ message: "File saved successfully!" });
  } catch (err) {
    console.error("Error saving file:", err);
    res.status(500).json({ error: "Error saving file" });
  }
});

router.post("/insert", async (req, res) => {
  const { uniqueId, sqlQuery, created_by, created_on } = req.body;

  try {
    const newRecord = new Record({
      uniqueId,
      sqlQuery,
      created_by,
      created_on,
    });

    await newRecord.save();
    res
      .status(201)
      .json({ message: "Record inserted successfully", newRecord });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error inserting record", error: err.message });
  }
});

// Fetch record by uniqueId
router.get("/fetch/:uniqueId", async (req, res) => {
  try {
    const record = await Record.findOne({ uniqueId: req.params.uniqueId });

    if (!record) {
      return res.status(404).json({ message: "Record not found" });
    }

    // Ensure the field name matches what you're expecting (sqlquery)
    res.status(200).json({ sqlquery: record.sqlQuery });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Error fetching record", error: err.message });
  }
});

module.exports = router;
