Feature: ParaBank Loan Request Feature
  
  Background:
    Given I am on the login page
    When I login with john and demo

  Scenario Outline: As a user, I can request a loan
    Given I am on the loan page
    When I request a loan with amount <amount>, down payment <downPayment>, and account id <accountId>
    Then I should see a message saying <message> wtih the status <status>

    Examples:
      | accountId | amount | downPayment | message                                      | status   |
      | 13344     | 5000   | 100        | Congratulations, your loan has been approved.    | Approved |
      | 13344     | 10000000000  | 100        | We cannot grant a loan in that amount with your available funds.    | Denied   |

