const express = require("express");
var cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const users = require("./users");
const animals = require("./animals");

const { initOrdersListener, ordersEmitter } = require("./orders/orders.events");
const { orderProcessor } = require("./orders/order-processor.interface");
const paymentsProcess = require("./orders/payments-processor.interface");

app.use(cors());

app.use(
  bodyParser.json({
    limit: "50mb",
  })
);

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    parameterLimit: 100000,
    extended: true,
  })
);

/** route used to play with the cache */
app.get("/api/users", (req, res) => {
  console.log(req.foo);

  // cache control
  res.set("Cache-Control", "public, max-age=3600");

  res.send(users);
});

app.post("/api/users", (req, res) => {
  res.send("Hello World!");
});

app.get("/api/animals", (req, res) => {
  res.send(animals);
});

/** START: api to play with EventEmitter and Express */
app.get("/api/orders", async (req, res) => {
  const orders = await orderProcessor.findAll();

  res.send(orders);
});

app.post("/api/orders", async (req, res) => {
  // using below code the response is sent immediately
  ordersEmitter.emit("order:created", req.body);

  // using below code the response waits for the order to be processed
  // const newOrder = await orderProcessor.create(req.body, { delay: 5000 });

  res.send("Order created");
});

app.post("/api/payments/pix", async (req, res) => {
  const qrCodeData = await paymentsProcess.createQRCode(req.body);

  res.send(qrCodeData);
});

/** END: api to play with EventEmitter and Express */

/**
 *  THIRD PARTY API
 */
app.post("/api/stripe/create-qr-code", (req, res, next) => {
  // simulate a third party service that takes 2 seconds to respond
  setTimeout(() => {
    res.send({
      qrCode: "123456",
      txid: "000000111111222222333333",
    });
  }, 2000);
});

// error middleware
app.use((err, req, res, next) => {
  console.log(err);
  res.status(500).send("Something broke!");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");

  initOrdersListener();
});
