Feature: ParaBank Transfer Funds Feature

Background:
    Given I am on the login page
    When I login with john and demo

Scenario Outline: As a user, I can attempt to transfer money from one account to another
    Given I am on the transfer funds page
    When I transfer <amount> from account <originAccount> to account <destinationAccount>
    Then I should see a message saying <message>

Examples:
      | originAccount | destinationAccount | amount | message            |
      | 13566         | 16341              | 200    | Transfer Complete! |
      | 16119         | 16452              | 999999 | Insufficient funds |      


