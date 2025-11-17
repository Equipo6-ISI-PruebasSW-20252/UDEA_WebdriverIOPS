import fetch from "node-fetch";
import Page from "./page.js";

class BillPayApiPage extends Page {
  // Endpoint base del servicio
  baseUrl = "https://parabank.parasoft.com/parabank/services/bank";

  // Payload fijo requerido para la operación
  payload = {
    address: {
      street: "direccion de prueba ",
      city: "Medellin ",
      state: "Antioquia ",
      zipCode: "5002",
    },
    name: "Pago de prueba",
    phoneNumber: "3333333333333",
    accountNumber: "13344",
  };

  async payBill(amount, accountId) {
    const query = `accountId=${accountId}&amount=${amount}`;

    const response = await browser.call(async () => {
      return await fetch(`${this.baseUrl}/billpay?${query}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(this.payload),
      });
    });

    return {
      status: response.status,
      body: await response.text(),
    };
  }

  open() {
    return super.open("");
  }
}

export default new BillPayApiPage();
