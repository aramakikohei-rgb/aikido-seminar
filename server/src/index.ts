import express from "express";
import cors from "cors";
import seminarRoutes from "./routes/seminars.js";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use("/api/seminars", seminarRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
