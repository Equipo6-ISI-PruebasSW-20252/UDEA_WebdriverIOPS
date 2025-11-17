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
        // Esperar a que los campos estén disponibles
        await this.inputLoanAmount.waitForExist({ timeout: 10000 });
        await this.inputLoanAmount.waitForClickable({ timeout: 5000 });
        await this.inputLoanAmount.setValue(amount);
        
        await this.inputDownPayment.waitForExist({ timeout: 10000 });
        await this.inputDownPayment.waitForClickable({ timeout: 5000 });
        await this.inputDownPayment.setValue(downPayment);
        
        await this.inputAccountsList.waitForExist({ timeout: 10000 });
        await this.inputAccountsList.selectByAttribute('value', accountId);
        
        await this.btnApply.waitForClickable({ timeout: 5000 });
        await this.btnApply.click();
        
        // Esperar a que se procese la solicitud (aparecerá un resultado)
        await browser.waitUntil(
            async () => {
                const approvedDiv = await $("div[id='loanRequestApproved']");
                const deniedDiv = await $("div[id='loanRequestDenied']");
                return (await approvedDiv.isExisting()) || (await deniedDiv.isExisting());
            },
            {
                timeout: 15000,
                timeoutMsg: "La solicitud de préstamo no se procesó",
                interval: 500,
            }
        );
    }

    /**
     * overwrite specific options to adapt it to page object
     */
    open () {
        return super.open('requestloan.htm');
    }
}

export default new LoanRequestPage();
