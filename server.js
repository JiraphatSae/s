const express = require('express');
const bodyParser = require('body-parser');
const sql = require('mssql');
const path = require('path');
const cors = require('cors'); // นำเข้า cors package
require('dotenv').config();


const app = express();
const PORT = 11813;


app.use(express.static(path.join(__dirname, 'public')));

// ใช้งาน CORS
app.use(cors());  // เพิ่มบรรทัดนี้

// Middleware
app.use(bodyParser.json());

// SQL Server configuration
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false, // ใช้ false หากไม่ได้ใช้ Azure SQL
        trustServerCertificate: true // ใช้ true ในกรณี localhost
    }
};

// Connect to SQL Server
sql.connect(dbConfig)
    .then(() => console.log('Connected to SQL Server'))
    .catch(err => console.error('Database connection failed:', err));

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
      });

app.get('/api/call-procedure', async (req, res) => {
    const { iDate } = req.query; // รับค่า parameter 'AA' จาก query string ใน URL

    if (!iDate) {
        return res.status(400).json({ error: "Parameter iDate is required" });
    }

    try {
        // เชื่อมต่อกับ SQL Server
        await sql.connect(dbConfig);

        // เรียกใช้ Stored Procedure "XX" โดยใช้ parameter 'AA'
        const result = await sql.query`EXEC Dashboard_Xtest @iDate = ${iDate}`;

        // ส่งผลลัพธ์ที่ได้กลับไปยัง client
        res.json(result.recordset);  // ส่งผลลัพธ์จากการ query เป็น JSON
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'An error occurred while querying the database.' });
    } finally {
        // ปิดการเชื่อมต่อ
        sql.close();
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://192.168.101.138:${PORT}`);
});
