Feature: ParaBank Bill Pay Feature

Scenario Outline: User attempts to pay a bill using the API
    Given I am authenticated in the ParaBank API
    When I attempt to pay a bill with amount <amount> from account <accountId>
    Then I should receive a response saying <message>

Examples:
    | accountId | amount   | message              |
    | 13122     | 100      | Payment Successful   |
    | 13122     | 1000000  | Insufficient funds   |

