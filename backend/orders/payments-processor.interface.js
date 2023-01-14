const fetch = require("node-fetch");
const { ordersEmitter } = require("./orders.events");

class PaymentsProcessor {
  constructor({ ordersEmitter }) {
    this.payments = [];

    this.qrcodes = [];
  }

  async createQRCode(payload) {
    return new Promise(async (resolve, reject) => {
      if (!payload) {
        reject("payload not found");
        return;
      }

      const response = await fetch(
        "http://localhost:3000/api/stripe/create-qr-code",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      this.qrcodes.push({
        qrCode: data.qrCode,
        txid: data.txid,
        status: "pending",
      });

      resolve(data);
    });
  }

  async shouldPay(payload, order) {
    const response = await fetch(
      "http://localhost:3000/api/third-party-payment-service",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    // return new Promise((resolve, reject) => {
    //   if (payload.amount < order.total) {
    //     reject("Amount is less than order total");
    //     return;
    //   }

    //   if (payload.amount > order.total) {
    //     reject("Amount is greater than order total");
    //     return;
    //   }

    //   this.payments.push({
    //     orderId: order.id,
    //     amount: payload.amount,
    //   });

    //   ordersEmitter.emit("order:paid", order);

    //   resolve("Payment processed");
    // });
  }
}

const paymentsProcessor = new PaymentsProcessor({
  ordersEmitter: ordersEmitter,
});

module.exports = paymentsProcessor;
