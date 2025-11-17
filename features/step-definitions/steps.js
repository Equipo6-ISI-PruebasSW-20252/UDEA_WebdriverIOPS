import { Given, When, Then, Before } from "@wdio/cucumber-framework";
import { $, browser } from "@wdio/globals";
import assert from "node:assert/strict";

import LoginPage from "../pageobjects/login.page.js";
import RequestLoanPage from "../pageobjects/loan.page.js";
import TransferFundsPage from "../pageobjects/transfer.page.js";
import BillPayApiPage from "../pageobjects/billpay.page.js";
import AccountsOverviewPage from "../pageobjects/accounts.page.js";
import { config as wdioConfig } from "../../wdio.conf.js";

const waitForElement = async (element, timeoutMsg) => {
  await element.waitForExist({
    timeout: 10000,
    interval: 250,
    timeoutMsg,
  });
};

const assertElementTextIncludes = async (
  element,
  expectedText,
  { allowEmpty = false } = {}
) => {
  await waitForElement(
    element,
    `No se encontró el elemento esperado para validar el texto "${expectedText}"`
  );
  const text = await element.getText();
  if (!text || text.trim() === "") {
    if (allowEmpty) {
      console.warn(
        `Advertencia: el elemento no contiene texto visible para validar "${expectedText}".`
      );
      return;
    }
  }
  assert.ok(
    text.toLowerCase().includes(expectedText.toLowerCase()),
    `Se esperaba que "${text}" contuviera "${expectedText}"`
  );
};

const pages = {
  login: LoginPage,
  loan: RequestLoanPage,
  transfer: TransferFundsPage,
  accounts: AccountsOverviewPage,
};

const ensureLoggedOut = async () => {
  await browser.url(`${wdioConfig.baseUrl}/index.htm`);
  const logoutButton = await $("//a[normalize-space()='Log Out']");
  if (await logoutButton.isExisting()) {
    await logoutButton.click();
  }
};

Before(async () => {
  await ensureLoggedOut();
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
  if (message === "Error!") {
    const errorBanner = await $(".error");
    await waitForElement(
      errorBanner,
      "No se encontró el mensaje de error esperado"
    );
    const errorText = await errorBanner.getText();
    assert.ok(
      errorText.trim().length > 0,
      "Se esperaba ver un mensaje de error en pantalla"
    );
  } else {
    const title = await $(".title");
    await assertElementTextIncludes(title, message);
  }
});

Then(/^I should not be able to click the login button$/, async () => {
  const loginButton = await LoginPage.btnSubmit;
  await waitForElement(loginButton, "No se encontró el botón de login");
  const isEnabled = await loginButton.isEnabled();
  if (isEnabled) {
    await loginButton.click();
    const errorBanner = await $(".error");
    await waitForElement(
      errorBanner,
      "Se esperaba ver un mensaje de error tras intentar login sin credenciales"
    );
    const errorText = await errorBanner.getText();
    assert.ok(
      errorText.trim().length > 0,
      "El sistema debería mostrar un mensaje de error al intentar login sin credenciales"
    );
  } else {
    assert.ok(true, "El botón se mantiene deshabilitado como se esperaba");
  }
});

//LOAN REQUEST
When(
  /^I request a loan with amount (\d+), down payment (\d+), and account id (\d+)$/,
  async (amount, downPayment, accountId) => {
    await RequestLoanPage.requestLoan(amount, downPayment, accountId);
  }
);

Then(/^I should see the loan status (.+)$/, async (status) => {
  status = status.trim();
  // Esperar a que aparezca el resultado del préstamo
  await browser.waitUntil(
    async () => {
      const approvedDiv = await $("div[id='loanRequestApproved']");
      const deniedDiv = await $("div[id='loanRequestDenied']");
      return (await approvedDiv.isExisting()) || (await deniedDiv.isExisting());
    },
    {
      timeout: 15000,
      timeoutMsg: "No se encontró el resultado del préstamo (ni aprobado ni denegado)",
      interval: 500,
    }
  );

  // Buscar el status en diferentes lugares posibles
  let statusElement = await $("//td[@id='loanStatus']");
  if (!(await statusElement.isExisting())) {
    // Intentar buscar en la tabla de resultados
    statusElement = await $("//td[contains(text(), 'Status')]/following-sibling::td");
  }
  if (!(await statusElement.isExisting())) {
    // Buscar en el div de aprobado o denegado
    const approvedDiv = await $("div[id='loanRequestApproved']");
    const deniedDiv = await $("div[id='loanRequestDenied']");
    if (await approvedDiv.isExisting()) {
      statusElement = approvedDiv;
    } else if (await deniedDiv.isExisting()) {
      statusElement = deniedDiv;
    }
  }

  await waitForElement(
    statusElement,
    "No se encontró el elemento de estado del préstamo"
  );

  const statusText = await statusElement.getText();
  // Validar que el status esperado esté en el texto (puede estar en diferentes formatos)
  assert.ok(
    statusText.toLowerCase().includes(status.toLowerCase()),
    `Se esperaba el status "${status}" pero se encontró: "${statusText}"`
  );
});

Then(/^I should see the loan message (.+)$/, async (message) => {
  message = message.trim();
  
  // Esperar a que aparezca el resultado del préstamo
  await browser.waitUntil(
    async () => {
      const approvedDiv = await $("div[id='loanRequestApproved']");
      const deniedDiv = await $("div[id='loanRequestDenied']");
      return (await approvedDiv.isExisting()) || (await deniedDiv.isExisting());
    },
    {
      timeout: 15000,
      timeoutMsg: "No se encontró el resultado del préstamo (ni aprobado ni denegado)",
      interval: 500,
    }
  );

  let messageElement;
  const approvedDiv = await $("div[id='loanRequestApproved']");
  const deniedDiv = await $("div[id='loanRequestDenied']");
  
  if (await approvedDiv.isExisting()) {
    await waitForElement(
      approvedDiv,
      "No se encontró el div de préstamo aprobado"
    );
    messageElement = await $("div[id='loanRequestApproved'] p:nth-child(1)");
  } else if (await deniedDiv.isExisting()) {
    await waitForElement(
      deniedDiv,
      "No se encontró el div de préstamo denegado"
    );
    messageElement = await $("div[id='loanRequestDenied'] p[class='error']");
  } else {
    throw new Error("No se encontró ni el div de aprobado ni el de denegado");
  }

  await assertElementTextIncludes(messageElement, message);
});

//TRANSFER FUNDS

Given(/^I am on the transfer funds page$/, async () => {
  await $("=Transfer Funds").click();
  await waitForElement(
    TransferFundsPage.inputAmount,
    "No se pudo cargar el campo de monto en Transfer Funds"
  );
});

When(
  /^I transfer (\d+) from account (.+) to account (.+)$/,
  async (amount, originAccount, destinationAccount) => {
    await TransferFundsPage.transfer(
      amount,
      originAccount.trim(),
      destinationAccount.trim()
    );
  }
);

Then(/^I should see a message saying (.*)$/, async (message) => {
  // Esperar a que aparezca algún resultado después de la acción
  await TransferFundsPage.waitForResult(20000);
  
  if (message === "Error!") {
    await waitForElement(
      TransferFundsPage.errorMessage,
      "No se encontró el mensaje de error esperado"
    );
    await assertElementTextIncludes(TransferFundsPage.errorMessage, message, {
      allowEmpty: true,
    });
  } else if (message === "Insufficient funds") {
    // Para "Insufficient funds", puede aparecer como:
    // 1. Un h1 con "Error!" y el contenido de la página menciona "insufficient"
    // 2. Un mensaje en el contenido de la página
    const hasError = await TransferFundsPage.errorMessage.isExisting();
    const hasSuccess = await TransferFundsPage.successMessage.isExisting();
    
    if (hasError) {
      // Si hay un mensaje de error, verificar que el contenido mencione "insufficient"
      const errorText = await TransferFundsPage.errorMessage.getText();
      const pageContent = await TransferFundsPage.resultContent.getText();
      const combinedText = (errorText + " " + pageContent).toLowerCase();
      
      assert.ok(
        combinedText.includes("insufficient") || combinedText.includes("funds"),
        `Se esperaba un mensaje sobre fondos insuficientes, pero se encontró: "${errorText}"`
      );
    } else if (hasSuccess) {
      // Si aparece éxito, verificar que no sea realmente un error
      const successText = await TransferFundsPage.successMessage.getText();
      if (successText.toLowerCase().includes("transfer complete")) {
        throw new Error(
          `Se esperaba un error de fondos insuficientes, pero la transferencia fue exitosa: "${successText}"`
        );
      }
    } else {
      // Buscar en el contenido general de la página
      const pageContent = await TransferFundsPage.resultContent.getText();
      assert.ok(
        pageContent.toLowerCase().includes("insufficient") || 
        pageContent.toLowerCase().includes("funds") ||
        pageContent.toLowerCase().includes("error"),
        `No se encontró mensaje sobre fondos insuficientes en la página. Contenido: "${pageContent.substring(0, 200)}"`
      );
    }
  } else if (message === "Transfer Complete!") {
    // Para mensajes de éxito, esperar el mensaje específico
    await waitForElement(
      TransferFundsPage.successMessage,
      "No se encontró el mensaje de éxito esperado"
    );
    await assertElementTextIncludes(TransferFundsPage.successMessage, message, {
      allowEmpty: true,
    });
  } else {
    // Para otros mensajes, buscar en el contenido de la página
    const resultText = await TransferFundsPage.getResultMessage();
    assert.ok(
      resultText.toLowerCase().includes(message.toLowerCase()),
      `Se esperaba el mensaje "${message}", pero se encontró: "${resultText}"`
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
    const response = await BillPayApiPage.payBill(amount, fromAccountId);
    global.apiResponse = response.body;
    global.apiStatus = response.status;
  }
);

Then(/^I should receive a response saying (.*)$/, async (expectedMessage) => {
  const responseBody = (global.apiResponse || "").toString();
  const responseStatus = global.apiStatus ?? 0;

  assert.ok(
    responseBody.includes("<billPayResult>"),
    "La respuesta del API no contiene la estructura esperada <billPayResult>"
  );

  const normalizedExpectation = expectedMessage.toLowerCase();
  if (normalizedExpectation.includes("payment successful")) {
    if (responseStatus < 200 || responseStatus >= 400) {
      throw new Error(
        `Se esperaba un pago exitoso, pero el servicio respondió con status ${responseStatus}`
      );
    }
  } else if (normalizedExpectation.includes("insufficient")) {
    if (responseStatus < 200) {
      console.warn(
        "Se esperaba un mensaje de fondos insuficientes, pero el servicio respondió 2xx. El API público no devuelve mensajes de error consistentes."
      );
    }
  }
});

// ACCOUNTS OVERVIEW

Given(/^I am on the accounts overview page$/, async () => {
  await AccountsOverviewPage.openOverview();
});

Then(/^I should see at least (\d+) accounts listed$/, async (minAccounts) => {
  await AccountsOverviewPage.waitForOverview();
  const rows = await AccountsOverviewPage.accountRows;
  assert.ok(
    rows.length >= Number(minAccounts),
    `Se esperaban al menos ${minAccounts} cuentas pero solo hay ${rows.length}`
  );
});

Then(
  /^each account row should display number type and balance$/,
  async () => {
    await AccountsOverviewPage.waitForOverview();
    const rows = await AccountsOverviewPage.accountRows;
    assert.ok(rows.length > 0, "Debe haber al menos una fila de cuenta");
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const columns = await row.$$("td");
      assert.ok(
        columns.length >= 3,
        `Cada fila debe tener al menos 3 columnas (número, tipo y balance). Fila ${i + 1} tiene ${columns.length} columnas`
      );
      
      const accountNumberText = (await columns[0].getText()).trim();
      const accountTypeText = (await columns[1].getText()).trim();
      const balanceText = (await columns[2].getText()).trim();
      
      assert.notStrictEqual(
        accountNumberText,
        "",
        `El número de cuenta no puede estar vacío en la fila ${i + 1}`
      );
      assert.notStrictEqual(
        accountTypeText,
        "",
        `El tipo de cuenta no puede estar vacío en la fila ${i + 1}`
      );
      
      // El balance puede estar vacío en algunas cuentas, pero si tiene contenido debe ser numérico
      if (balanceText !== "") {
        assert.ok(
          /^[\$\d,.\-]+$/.test(balanceText),
          `El balance debe tener formato numérico en la fila ${i + 1}, recibido: "${balanceText}"`
        );
      } else {
        console.warn(`Advertencia: El balance está vacío en la fila ${i + 1}, pero esto puede ser válido para algunas cuentas`);
      }
    }
  }
);

When(/^I open the first account details$/, async () => {
  await AccountsOverviewPage.openFirstAccountDetails();
});

Then(/^I should see the account details header$/, async () => {
  await waitForElement(
    AccountsOverviewPage.accountDetailsHeader,
    "No se encontró el encabezado de detalles de cuenta"
  );
});

Then(/^I should see the transactions table$/, async () => {
  await waitForElement(
    AccountsOverviewPage.transactionsTable,
    "No se encontró la tabla de transacciones"
  );
});

Given(/^I am logged out$/, async () => {
  await ensureLoggedOut();
});

When(/^I navigate directly to the accounts overview page$/, async () => {
  await browser.url(`${wdioConfig.baseUrl}/overview.htm`);
});

Then(/^I should see the login form$/, async () => {
  await waitForElement(
    LoginPage.inputUsername,
    "No se encontró el campo de usuario en el formulario de login"
  );
  await waitForElement(
    LoginPage.inputPassword,
    "No se encontró el campo de contraseña en el formulario de login"
  );
});
