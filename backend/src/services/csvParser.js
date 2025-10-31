import fs from "fs";
import readline from "readline";
import pool from "../config/db.js";

function buildNestedObject(headers, values) {
  const obj = {};
  headers.forEach((header, i) => {
    const keys = header.split(".");
    let current = obj;
    keys.forEach((key, idx) => {
      if (idx === keys.length - 1) {
        current[key] = values[i];
      } else {
        current[key] = current[key] || {};
        current = current[key];
      }
    });
  });
  return obj;
}

async function parseCsvStream(filePath, onRecord) {
  const fileStream = fs.createReadStream(filePath);
  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let headers = [];
  let isFirstLine = true;

  for await (const line of rl) {
    const values = [];
    let current = "";
    let insideQuotes = false;

    for (const char of line) {
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === "," && !insideQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    if (isFirstLine) {
      headers = values.map((h) => h.trim());
      isFirstLine = false;
      continue;
    }

    const record = buildNestedObject(headers, values);
    await onRecord(record);
  }
}

async function insertBatch(records) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertQuery = `
      INSERT INTO users (name, age, address, additional_info)
      VALUES ($1, $2, $3, $4)
    `;

    for (const user of records) {
      const fullName = `${user.name.firstName} ${user.name.lastName}`;
      const age = parseInt(user.age);
      const { address, name, age: _, ...rest } = user;
      const additionalInfo = Object.keys(rest).length ? rest : null;

      await client.query(insertQuery, [
        fullName,
        age,
        address ? JSON.stringify(address) : null,
        additionalInfo ? JSON.stringify(additionalInfo) : null,
      ]);
    }

    await client.query("COMMIT");
  } catch (err) {
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

async function printAgeDistribution() {
  const result = await pool.query("SELECT age FROM users");
  const ages = result.rows.map((r) => r.age);
  const groups = { "<20": 0, "20-40": 0, "40-60": 0, ">60": 0 };

  for (const age of ages) {
    if (age < 20) groups["<20"]++;
    else if (age <= 40) groups["20-40"]++;
    else if (age <= 60) groups["40-60"]++;
    else groups[">60"]++;
  }

  const total = ages.length || 1;
  console.log("\nAge-Group   % Distribution");
  Object.entries(groups).forEach(([range, count]) => {
    const percent = ((count / total) * 100).toFixed(2);
    console.log(`${range.padEnd(8)}  ${percent}%`);
  });
}

export async function processCsvFile(csvPath) {
  if (!fs.existsSync(csvPath)) {
    return;
  }

  const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 1000;
  const batch = [];
  let total = 0;

  await parseCsvStream(csvPath, async (record) => {
    batch.push(record);
    total++;

    if (batch.length >= BATCH_SIZE) {
      await insertBatch(batch.splice(0, BATCH_SIZE));
    }
  });

  if (batch.length) {
    await insertBatch(batch);
  }

  await printAgeDistribution();
}

export async function previewCsvJson(csvPath) {
  if (!fs.existsSync(csvPath)) {
    return [];
  }

  const BATCH_SIZE = parseInt(process.env.BATCH_SIZE) || 1000;
  const records = [];

  await parseCsvStream(csvPath, async (record) => {
    if (records.length < BATCH_SIZE) {
      records.push(record);
    }
  });

  return records;
}
