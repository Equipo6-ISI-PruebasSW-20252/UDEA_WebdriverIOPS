Feature: Para Bank Login Feature
  
  Scenario: As a user, I cannot log into the Parabank Accounts Service Page with empty credentials
    Given I am on the login page
    When I write the credentials "" and ""
    Then I should not be able to click the login button

  Scenario Outline: As a user, I can log into the Parabank Accounts Service Page
    Given I am on the login page
    When I login with <username> and <password>
    Then I should see a text saying <message>

    Examples: 
      | username          | password | message           |
      | invalidUsenam   | password | Error!            |
      | john        | demo | Accounts Overview |
