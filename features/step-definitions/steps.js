import { Given, When, Then, beforeScenario } from "@wdio/cucumber-framework";

import LoginPage from '../pageobjects/login.page.js';
import RequestLoanPage from '../pageobjects/loan.page.js';

const pages = {
  login: LoginPage,
  loan: RequestLoanPage
};

beforeScenario(async () => {
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
When(/^I request a loan with amount (\d+), down payment (\d+), and account id (\d+)$/, 
  async (amount, downPayment, accountId) => {
  await RequestLoanPage.requestLoan(amount, downPayment, accountId);
});

Then(/^I should see a message saying (.*) with the status (.*)$/, async (message, status) => {
  let messageElement;
  if (status === "Approved") {
    messageElement = await $("//p[normalize-space()='Congratulations, your loan has been approved.']");
  } else {
    messageElement = await $("//p[contains(text(),'We cannot grant a loan in that amount with your av')]");
  }
  const statusElement = await $("//td[@id='loanStatus']");
  await expect(statusElement).toBeExisting();
  await expect(statusElement).toHaveTextContaining(status);
  await expect(messageElement).toBeExisting();
  await expect(messageElement).toHaveTextContaining(message);
});