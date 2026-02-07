require('dotenv').config();
const app = require('./app');
const connectDb = require("./config/dbConnection");

const PORT = process.env.PORT || 5001;

connectDb();

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
