import app from './app.js';
import { connectDB } from './src/DB/db.js';

const PORT = process.env.PORT || 3000;

// Connect the database
connectDB();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
