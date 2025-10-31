# 🚀 Kelp CSV Parser

A Node.js + PostgreSQL project built for the **Kelp Global Coding Challenge**, designed to efficiently process large CSV files (even 60k+ rows) in batches and insert them into a database.

## ⚙️ How to Run the Project

1️⃣ Clone the repository  
git clone https://github.com/yourusername/kelp-csv-parser.git  
cd kelp-csv-parser/backend

2️⃣ Install dependencies  
npm install

3️⃣ Setup PostgreSQL  
CREATE DATABASE kelpchallenge;  
\\c kelpchallenge  
CREATE TABLE public.users (  
 id SERIAL PRIMARY KEY,  
 name VARCHAR NOT NULL,  
 age INT NOT NULL,  
 address JSONB NULL,  
 additional_info JSONB NULL  
);

4️⃣ Configure the .env file  
PORT=3000  
DATABASE_URL=postgresql://postgres:root@localhost:5432/kelpchallenge  
CSV_PATH=./backend/data/users.csv  
BATCH_SIZE=1000

5️⃣ Run the backend  
npm run dev

6️⃣ Create CSV data using makeFakeData.py  
cd backend/data  
python makeFakeData.py

This will generate a large CSV file named users.csv inside the data folder.

---

## 🧰 API Endpoints

| Method | Endpoint      | Description                                     |
| ------ | ------------- | ----------------------------------------------- |
| GET    | /             | Health check — confirms backend is running      |
| POST   | /upload       | Upload CSV file (stored in /data/users.csv)     |
| POST   | /process-csv  | Parse and insert CSV data into PostgreSQL       |
| GET    | /preview-json | Returns first 5 parsed JSON records for preview |

### Example: Upload CSV

Request:  
POST /upload  
Content-Type: multipart/form-data  
Body: file=<yourfile.csv>

Response:  
{
"message": "✅ File uploaded successfully",
"path": "backend/data/users.csv"
}

---

## 📸 Screenshot

### ✅ Batch Processing (60,000+ Rows)

Below is a screenshot showing successful batch processing of a large CSV file and Postman confirmation:

![Batch Processing Proof](./images/batchprocessing.png)
![Batch Processing Proof](./images/databaseCode.png)
![Batch Processing Proof](./images/jsonPreview.png)
