const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const employeeRoutes = require('./routes/employeeRoutes');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(fileUpload({
  limits: { fileSize: 10 * 1024 * 1024 }, 
}));

app.use('/api/employees', employeeRoutes);

const PORT = process.env.PORT1 || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
