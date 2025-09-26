import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

// Enable CORS for all origins (adjust as required)
app.use(cors());

// JSON body parser with custom verification for malformed JSON
app.use(
  bodyParser.json({
    verify: (req, res, buf) => {
      try {
        JSON.parse(buf);
      } catch (e) {
        res.status(400).json({ error: "Invalid JSON format" });
        throw {
          status: 400,
          message: "Invalid JSON format",
          type: "entity.parse.failed",
        };
      }
    },
  })
);

// Global error handler for bad JSON & other syntax errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON format" });
  }
  next(err);
});

export default app;
