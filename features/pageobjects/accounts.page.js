import Page from "./page.js";

class AccountsOverviewPage extends Page {
  get accountsLink() {
    return $("=Accounts Overview");
  }

  get accountsTable() {
    return $("#accountTable");
  }

  get accountRows() {
    return $$("#accountTable tbody tr");
  }

  get firstAccountLink() {
    return $("#accountTable tbody tr a");
  }

  get accountDetailsHeader() {
    return $("h1.title");
  }

  get transactionsTable() {
    return $("#transactionTable");
  }

  async openOverview() {
    await super.open("overview.htm");
    await this.waitForOverview();
  }

  open() {
    return this.openOverview();
  }

  async waitForOverview() {
    await this.accountsTable.waitForExist({
      timeout: 15000,
      timeoutMsg: "Account overview table not found",
    });
    await browser.waitUntil(
      async () => {
        const rows = await this.accountRows;
        return rows.length > 0;
      },
      {
        timeout: 10000,
        timeoutMsg: "Expected account rows to be present",
        interval: 500,
      }
    );
  }

  async openFirstAccountDetails() {
    await this.waitForOverview();
    // Buscar el primer enlace de cuenta en la tabla
    const firstLink = await $("//a[contains(@href, 'activity.htm?id=')]");
    await firstLink.waitForClickable({ timeout: 5000 });
    await firstLink.click();
    // Esperar a que se cargue la página de detalles
    await browser.waitUntil(
      async () => {
        const header = await this.accountDetailsHeader;
        return await header.isExisting();
      },
      {
        timeout: 10000,
        timeoutMsg: "La página de detalles de cuenta no se cargó",
        interval: 500,
      }
    );
  }
}

export default new AccountsOverviewPage();

