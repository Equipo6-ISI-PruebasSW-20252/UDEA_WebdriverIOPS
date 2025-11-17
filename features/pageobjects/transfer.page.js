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

    get resultMessage() {
        // Busca cualquier mensaje de resultado (éxito o error)
        return $("//h1[contains(text(), 'Transfer') or contains(text(), 'Error')]");
    }

    get resultContent() {
        // Busca el contenido de la página que puede contener mensajes de error detallados
        return $("//div[@id='rightPanel']");
    }

    /**
     * Espera a que aparezca un mensaje de resultado después de una transferencia
     */
    async waitForResult(timeout = 15000) {
        await browser.waitUntil(
            async () => {
                const hasSuccess = await this.successMessage.isExisting();
                const hasError = await this.errorMessage.isExisting();
                return hasSuccess || hasError;
            },
            {
                timeout,
                timeoutMsg: "No se encontró mensaje de resultado después de la transferencia",
                interval: 500,
            }
        );
    }

    /**
     * Obtiene el texto del mensaje de resultado (éxito o error)
     */
    async getResultMessage() {
        await this.waitForResult();
        if (await this.successMessage.isExisting()) {
            return await this.successMessage.getText();
        }
        if (await this.errorMessage.isExisting()) {
            return await this.errorMessage.getText();
        }
        // Si no hay mensaje específico, buscar en el contenido de la página
        const content = await this.resultContent.getText();
        return content;
    }


    /**
     * Method
     */
    async getAccountValues(selectElement) {
        const element = await selectElement;
        let values = [];

        await browser.waitUntil(
            async () => {
                values = await browser.execute((select) => {
                    if (!select || !select.options) {
                        return [];
                    }
                    return Array.from(select.options)
                        .map((option) => option.value)
                        .filter((value) => value && value.trim().length > 0);
                }, element);
                return values.length > 0;
            },
            {
                timeout: 10000,
                timeoutMsg: "No account options loaded in transfer dropdown.",
                interval: 500,
            }
        );

        return values;
    }

    async resolveAccountValue(alias, isSource = true) {
        if (!alias || typeof alias !== "string") return alias;
        const normalized = alias.toUpperCase();
        if (normalized !== "AUTO_SOURCE" && normalized !== "AUTO_TARGET") {
            return alias;
        }

        const selectElement = isSource ? this.selectFromAccount : this.selectToAccount;
        const optionValues = await this.getAccountValues(selectElement);
        if (optionValues.length === 0) {
            throw new Error("No account options available in transfer dropdown.");
        }

        const index =
            normalized === "AUTO_TARGET" && optionValues.length > 1 ? 1 : 0;
        return optionValues[index];
    }

    async transfer(amount, originAccount, destinationAccount) {
        const fromValue = await this.resolveAccountValue(originAccount, true);
        const toValue = await this.resolveAccountValue(destinationAccount, false);

        await this.inputAmount.setValue(amount);
        await this.selectFromAccount.selectByAttribute('value', fromValue);
        await this.selectToAccount.selectByAttribute('value', toValue);
        
        // Esperar a que el botón esté habilitado antes de hacer clic
        await this.btnTransfer.waitForClickable({ timeout: 5000 });
        await this.btnTransfer.click();
        
        // Esperar a que la página termine de procesar (desaparecer el formulario o aparecer resultado)
        await browser.waitUntil(
            async () => {
                const formExists = await this.inputAmount.isExisting();
                const hasResult = (await this.successMessage.isExisting()) || (await this.errorMessage.isExisting());
                return !formExists || hasResult;
            },
            {
                timeout: 15000,
                timeoutMsg: "La página no terminó de procesar la transferencia",
                interval: 500,
            }
        );
    }

    /**
     * Open Transfer Funds page
     */
    open() {
        return super.open('transfer.htm');
    }
}

export default new TransferFundsPage();
