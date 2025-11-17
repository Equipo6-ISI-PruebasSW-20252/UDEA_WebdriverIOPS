Feature: ParaBank Accounts Overview Feature

  Background:
    Given I am on the login page
    When I login with john and demo

  Scenario: As a user, I can view all my accounts and balances
    Given I am on the accounts overview page
    Then I should see at least 3 accounts listed
    And each account row should display number type and balance

  Scenario: As a user, I can open the first account details
    Given I am on the accounts overview page
    When I open the first account details
    Then I should see the account details header
    And I should see the transactions table

  Scenario: Accessing accounts overview without login redirects to login form
    Given I am logged out
    When I navigate directly to the accounts overview page
    Then I should see the login form

