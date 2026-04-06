const express = require('express');
const multer = require('multer');
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');
require('dotenv').config({
  path: require('path').join(__dirname, '.env')
});
const app = express();

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');

const upload = multer({ dest: 'uploads/' });

// Serve frontend
app.use(express.static(path.join(__dirname, '../frontend')));

app.post('/upload', upload.single('file'), async (req, res) => {
  let filePath;
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: 'No file uploaded' });

    filePath = file.path;

    const formData = new FormData();
    formData.append('content', fs.createReadStream(filePath), file.originalname);

    console.log("WEBHOOK_URL:", process.env.WEBHOOK_URL);

    const response = await axios.post(process.env.WEBHOOK_URL, formData, {
      headers: {
        ...formData.getHeaders(),
        "X-Webhook-Secret": process.env.WEBHOOK_SECRET
      }
    });

    res.json({ success: true, data: response.data });

  } catch (err) {
    console.error("FULL ERROR:", err?.response?.data || err.message);
    res.status(500).json({ success: false, error: err?.response?.data || err.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

app.get('/status/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.query.token;

    const response = await axios.get(
      `https://hackathonapi.turfai.in/api/workflow-executions/${id}/status`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err?.response?.data || err.message });
  }
});

// fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(3000, () => console.log("http://localhost:3000"));
