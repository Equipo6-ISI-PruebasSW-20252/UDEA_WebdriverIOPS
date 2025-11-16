import Page from './page.js';

/**
 * Page Object for the Transfer Funds page in ParaBank
 */
class TransferFundsPage extends Page {
    /**
     * Selectors
     */
    get inputAmount() {
        return $("//input[@id='amount']");
    }

    get selectFromAccount() {
        return $("//select[@id='fromAccountId']");
    }

    get selectToAccount() {
        return $("//select[@id='toAccountId']");
    }

    get btnTransfer() {
        return $("//input[@value='Transfer']");
    }

    get successMessage() {
    return $("//h1[normalize-space()='Transfer Complete!']");
    }

    get errorMessage() {
    return $("//h1[normalize-space()='Error!']");
    }


    /**
     * Method
     */
    async transfer(amount, originAccount, destinationAccount) {
        await this.inputAmount.setValue(amount);
        await this.selectFromAccount.selectByAttribute('value', originAccount);
        await this.selectToAccount.selectByAttribute('value', destinationAccount);
        await this.btnTransfer.click();
    }

    /**
     * Open Transfer Funds page
     */
    open() {
        return super.open('transfer');
    }
}

export default new TransferFundsPage();
