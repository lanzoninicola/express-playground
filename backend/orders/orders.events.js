const EventEmitter = require("events");
const { orderProcessor } = require("./order-processor.interface");

const ordersEmitter = new EventEmitter();

function initOrdersListener() {
  ordersEmitter.on("order:created", async (order) => {
    try {
      await orderProcessor.create(order, { delay: 5000 });
    } catch (error) {
      console.error(error);
    }
  });

  ordersEmitter.on("order:paid", async (order) => {
    try {
      await orderProcessor.create(order, { delay: 5000 });
    } catch (error) {
      console.error(error);
    }
  });
}

module.exports = {
  ordersEmitter,
  initOrdersListener,
};
