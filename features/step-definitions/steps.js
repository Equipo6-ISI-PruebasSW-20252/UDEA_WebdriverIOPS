import { Given, When, Then } from "@wdio/cucumber-framework";

import LoginPage from '../pageobjects/login.page.js';

const pages = {
  login: LoginPage,
};

Given(/^I am on the (\w+) page$/, async (page) => {
  await pages[page].open();
});

//LOGIN
When(/^I login with (\w+) and (.+)$/, async (username, password) => {
  await LoginPage.login(username, password);
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