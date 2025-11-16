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
      | 13344         | 13566              | 100    | Transfer Complete! |
      | 13677         | 16341              | 50     | Transfer Complete! |
      | 16008         | 17007              | 999999 | Insufficient funds |      


