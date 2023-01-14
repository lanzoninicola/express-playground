class OrderProcessor {
  constructor() {
    this.orders = [];
  }

  create(
    order,
    options = {
      error: false,
      delay: 0,
    }
  ) {
    return new Promise((resolve, reject) => {
      if (options.delay > 0) {
        setTimeout(() => {
          this.orders.push({
            ...order,
            id: this.orders.length + 1,
          });
          resolve(order);
        }, options.delay);

        return;
      }

      if (options.error) {
        reject("Error creating order");

        return;
      }

      this.orders.push(order);
      resolve(order);
    });
  }

  findAll() {
    return new Promise((resolve) => {
      resolve(this.orders);
    });
  }

  findById(id) {
    return new Promise((resolve) => {
      resolve(this.orders.find((order) => order.id === id));
    });
  }
}

exports.orderProcessor = new OrderProcessor();
