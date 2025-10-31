import express from "express";
import dotenv from "dotenv";
import { processCsvFile, previewCsvJson } from "./services/csvParser.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Kelp CSV Parser Running!");
});

app.post("/process-csv", async (req, res) => {
  try {
    await processCsvFile(process.env.CSV_PATH);
    res.status(200).send("CSV processed and data inserted successfully!");
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).send("Internal server error while processing CSV.");
  }
});

app.get("/preview-json", async (req, res) => {
  try {
    const jsonPreview = await previewCsvJson(process.env.CSV_PATH);
    res.status(200).json(jsonPreview.slice(0, 5)); // send first 5
  } catch (err) {
    console.error("❌ Error generating preview:", err.message);
    res.status(500).send("Error generating JSON preview.");
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
