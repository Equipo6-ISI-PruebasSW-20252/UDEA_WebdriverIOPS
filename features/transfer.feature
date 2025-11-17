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
      | AUTO_SOURCE   | AUTO_TARGET        | 200    | Transfer Complete! |
      | AUTO_SOURCE   | AUTO_TARGET        | 999999 | Insufficient funds |      


