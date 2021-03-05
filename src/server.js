const express = require("express");
const http = require("http");
const server = express();
const error_handler = require("node-error-handler");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const apiRoutes = require("./services");
const listEndPoints = require("express-list-endpoints");
const passport = require("passport");
const createSocketServer = require("./socket");
const { PORT } = process.env;
const httpServer = http.createServer(server);
require("./Lib/auth/strategies/google");
require("./Lib/auth/strategies/facebook");

//MIDDLEWARES
server.set("trust proxy", 1);
server.enable("trust proxy");
server.use(express.json());
server.use(passport.initialize());
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
server.use(cookieParser());

//ROUTE
server.use("/api", apiRoutes);

//SOCKET IO CONNECTION
const socketServer = createSocketServer(httpServer);

//ERROR HANDLERS
server.use(error_handler({ log: true, debug: true }));
console.log(listEndPoints(server));

//Connect to DB and server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() =>
    httpServer.listen(PORT, () => {
      console.log("server connected at port ", PORT);
    })
  );
