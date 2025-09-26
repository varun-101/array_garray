import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/userRoutes.js";
import repoRoutes from "./routes/repoRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import prRoutes from "./routes/prRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();


const port = 3000;


app.get("/", (_req, res) => res.send("Hello World"));


app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/github", repoRoutes);
app.use("/github", issueRoutes);
app.use("/github", prRoutes);
app.use("/api/projects", projectRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  


