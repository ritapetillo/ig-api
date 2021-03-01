const express = require("express");
const server = express();
const error_handler = require("node-error-handler");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const apiRoutes = require("./services");
const { PORT } = process.env;

//MIDDLEWARES
server.set("trust proxy", 1);
server.enable("trust proxy");
server.use(express.json());
server.use(cookieParser());
server.use(
  cors({
    origin: [
      `${process.env.FRONT_URL}`,
      "http://localhost:3002",
      "http://localhost:3000",
    ],
    credentials: true,
    exposedHeaders: ["set-cookie"],
  })
);

//ROUTE
server.use("/api", apiRoutes);

//ERROR HANDLERS
server.use(error_handler({ log: true, debug: true }));

//Connect to DB and server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    server.listen(PORT, () => {
      console.log("server connected at port ", PORT);
    })
  );
