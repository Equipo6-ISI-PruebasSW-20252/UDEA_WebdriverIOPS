import { Given, When, Then, Before } from "@wdio/cucumber-framework";

import LoginPage from "../pageobjects/login.page.js";
import RequestLoanPage from "../pageobjects/loan.page.js";
import TransferFundsPage from "../pageobjects/transfer.page.js";
import BillPayApiPage from "../pageobjects/billpay.page.js";

const pages = {
  login: LoginPage,
  loan: RequestLoanPage,
  transfer: TransferFundsPage,
};

Before(async () => {
  // check if user is logged in and log out
  const logoutButton = await $("//a[normalize-space()='Log Out']"); // adjust selector as needed
  if (await logoutButton.isExisting()) {
    await logoutButton.click();
  }
});

Given(/^I am on the (\w+) page$/, async (page) => {
  await pages[page].open();
});

//LOGIN
When(/^I login with (\w+) and (.+)$/, async (username, password) => {
  await LoginPage.login(username, password);
});

When(/^I write the credentials (.*) and (.*)$/, async (username, password) => {
  await LoginPage.putValues(username, password);
});

Then(/^I should see a text saying (.*)$/, async (message) => {
  if (message == "Error!") {
    // invalid username or password
    await expect($(".title")).toBeExisting();
    await expect($(".title")).toHaveTextContaining(message);
  } else {
    // valid username or password
    await expect($(".title")).toBeExisting();
    await expect($(".title")).toHaveTextContaining(message);
  }
});

Then(/^I should not be able to click the login button$/, async () => {
  const loginButton = await LoginPage.loginButton;
  await expect(loginButton).toBeDisabled();
});

//LOAN REQUEST
When(
  /^I request a loan with amount (\d+), down payment (\d+), and account id (\d+)$/,
  async (amount, downPayment, accountId) => {
    await RequestLoanPage.requestLoan(amount, downPayment, accountId);
  }
);

Then(
  /^I should see a message saying (.*) with the status (.*)$/,
  async (message, status) => {
    let messageElement;
    if (status === "Approved") {
      messageElement = await $("div[id='loanRequestApproved'] p:nth-child(1)");
    } else {
      messageElement = await $("div[id='loanRequestDenied'] p[class='error']");
    }
    const statusElement = await $("//td[@id='loanStatus']");
    await expect(statusElement).toBeExisting();
    await expect(statusElement).toHaveTextContaining(status);
    await expect(messageElement).toBeExisting();
    await expect(messageElement).toHaveTextContaining(message);
  }
);

//TRANSFER FUNDS

Given(/^I am on the transfer funds page$/, async () => {
  await $("=Transfer Funds").click();
  await expect(TransferFundsPage.inputAmount).toBeExisting();
});

When(
  /^I transfer (\d+) from account (\d+) to account (\d+)$/,
  async (amount, originAccount, destinationAccount) => {
    await TransferFundsPage.transfer(amount, originAccount, destinationAccount);
  }
);

Then(/^I should see a message saying (.*)$/, async (message) => {
  if (message === "Error!") {
    await expect(TransferFundsPage.errorMessage).toBeExisting();
    await expect(TransferFundsPage.errorMessage).toHaveTextContaining(message);
  } else {
    await expect(TransferFundsPage.successMessage).toBeExisting();
    await expect(TransferFundsPage.successMessage).toHaveTextContaining(
      message
    );
  }
});

//BILL PAY

Given(/^I am authenticated in the ParaBank API$/, async () => {
  console.log("Authentication not required for ParaBank API");
});

When(
  /^I attempt to pay a bill with amount (\d+) from account (\d+)$/,
  async (amount, fromAccountId) => {
    const payload = {
      address: {
        street: "direccion de prueba",
        city: "Medellin",
        state: "Antioquia",
        zipCode: "5002",
      },
      name: "Pago de prueba",
      phoneNumber: "3333333333333",
      accountNumber: "13344",
    };

    const url = `https://parabank.parasoft.com/parabank/services/bank/billpay?accountId=${fromAccountId}&amount=${amount}`;

    console.log("Sending request to:", url);

    const response = await browser.call(async () => {
      return fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).then((res) => res.text());
    });

    console.log("Response received.");
    global.apiResponse = response;
  }
);

Then(/^I should receive a response saying (.*)$/, async (expectedMessage) => {
  console.log("RESPONSE FROM API (RAW):");
  console.log(global.apiResponse);

  await expect(global.apiResponse).toContain(expectedMessage);
});
