import Page from './page.js';

/**
 * sub page containing specific selectors and methods for a specific page
 */
class LoanRequestPage extends Page {
    /**
     * define selectors using getter methods
     */
    get inputLoanAmount () {
        return $("//input[@id='amount']");
    }

    get inputDownPayment () {
        return $("//input[@id='downPayment']");
    }

    get inputAccountsList () {
        return $("//select[@id='fromAccountId']");
    }

    get btnApply () {
        return $("//input[@value='Apply Now']");
    }
   
    /**
     * a method to encapsule automation code to interact with the page
     * e.g. to login using username and password
     */
    async requestLoan (amount, downPayment, accountId) {
        await this.inputLoanAmount.setValue(amount);
        await this.inputDownPayment.setValue(downPayment);
        await this.inputAccountsList.selectByAttribute('value', accountId);
        await this.btnApply.click();
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    open () {
        return super.open('requestloan.htm');
    }
}

export default new LoanRequestPage();
