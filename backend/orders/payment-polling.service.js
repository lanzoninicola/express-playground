const fetch = require("node-fetch");
const EventEmitter = require("events");

class PixPoller extends EventEmitter {
  EVENTS = {
    POLLING_STARTED: "poller:polling:started",
    TRANSACTION_CREATED: "poller:transaction:created",
    TRANSACTION_PAID_SUCCEEDED: "poller:transaction:paid:succeeded",
    TRANSACTION_PAID_FAILED: "poller:transaction:paid:failed",
    TRANSACTION_PAID_EXPIRED: "poller:transaction:paid:expired",
  };

  /**
   * Create a poller instance passing the configuration object
   *
   * @param {object} config
   * @param {string} config.url url to poll
   * @param {number} config.interval polling interval in milliseconds (default 10 seconds)
   * @param {object} config.statuses object with the mapping between statuses (succeeded, failed, expired) and response statuses
   * @param {function} config.onPaymentSucceeded callback function to be called when payment is succeded
   * @param {function} config.onPaymentFailed callback function to be called when payment is failed
   * @param {function} config.onPaymentExpired callback function to be called when payment is expired
   *
   * @typedef {object} transaction
   * transaction = {
   *  id: string,
   *  accessToken: string,
   *  orderId: string
   * }
   *
   * The callback function will receive the transaction object as parameter
   * callback = ({id, accessToken, orderId}) => {}
   *
   *
   */
  constructor(
    {
      url,
      interval,
      statuses,
      onPaymentSucceeded,
      onPaymentFailed,
      onPaymentExpired,
    } = {
      interval: 10_000,
    }
  ) {
    super();
    this.transactions = [];
    this.url = url;
    this.interval = interval;

    if (statuses?.succeeded === undefined) {
      throw new Error("Precisa informar o status de sucesso");
    }

    if (statuses?.failed === undefined) {
      throw new Error("Precisa informar o status de falha");
    }

    if (statuses?.expired === undefined) {
      throw new Error("Precisa informar o status de expirado");
    }

    this.statuses = statuses;

    this.onPaymentSucceeded = onPaymentSucceeded;
    this.onPaymentFailed = onPaymentFailed;
    this.onPaymentExpired = onPaymentExpired;
  }

  init() {
    const poller = this;

    poller.initListeners();
    poller.start();
  }

  /**
   * Start polling
   * For each transaction, check status and emit event if status is paid
   *
   * @returns {void}
   */
  async start() {
    const poller = this;

    while (true) {
      for (let i = 0; i < poller.transactions.length; i++) {
        const transaction = poller.transactions[i];
        const status = await poller.checkStatus(transaction);

        if (status === poller.statuses.succeeded) {
          this.emit(poller.EVENTS.TRANSACTION_PAID_SUCCEEDED, {
            transaction,
            callback: poller.onPaymentSucceeded,
          });
        }

        if (status === poller.statuses.succeededfailed) {
          this.emit(poller.EVENTS.TRANSACTION_PAID_FAILED, {
            transaction,
            callback: poller.onPaymentFailed,
          });
        }

        if (status === poller.statuses.expired) {
          this.emit(poller.EVENTS.TRANSACTION_PAID_EXPIRED, {
            transaction,
            callback: poller.onPaymentExpired,
          });
        }
      }
      await new Promise((resolve) => setTimeout(resolve, poller.interval));
    }
  }

  initListeners() {
    const poller = this;

    poller.on();

    poller.on(poller.EVENTS.TRANSACTION_CREATED, async (transaction) => {
      poller.transactions.push(transaction);
    });

    poller.on(
      poller.EVENTS.TRANSACTION_PAID_SUCCEEDED,
      async ({ transaction, callback }) => {
        poller.removeTransaction(transaction);

        if (callback) {
          callback(transaction);
        }
      }
    );

    poller.on(
      poller.EVENTS.TRANSACTION_PAID_FAILED,
      async ({ transaction, callback }) => {
        poller.removeTransaction(transaction);

        if (callback) {
          callback(transaction);
        }
      }
    );

    poller.on(
      poller.EVENTS.TRANSACTION_PAID_EXPIRED,
      async ({ transaction, callback }) => {
        poller.removeTransaction(transaction);

        if (callback) {
          callback(transaction);
        }
      }
    );
  }

  /**
   * Add transaction to poller
   *
   * @param {object} param0
   * @param {string} param0.id transaction id (txid)
   * @param {string} param0.accessToken access token do estabelecimento
   * @param {string} param0.orderId order id
   * @returns {void}
   */
  addTransaction({ id, accessToken, orderId }) {
    const poller = this;

    poller.emit(poller.EVENTS.TRANSACTION_CREATED, {
      id,
      accessToken,
      orderId,
    });
  }

  /**
   * Check transaction status
   * Call the LIMBER PAYMENTS API SERVICE to check transaction status
   *
   * @param {string} transactionId transaction id (txid)
   * @param {string} accessToken access token do estabelecimento
   * @returns {string} transaction status
   */
  async checkStatus(transactionId, accessToken) {
    const response = await fetch(`${this.url}/${transactionId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await response.json();

    return data.status;
  }

  /**
   * Remove transaction from poller
   * @param {string} transactionId transaction id (txid)
   * @returns {void}
   */
  removeTransaction(transactionId) {
    const poller = this;

    poller.transactions = poller.transactions.filter(
      (t) => t.id !== transactionId
    );
  }
}
