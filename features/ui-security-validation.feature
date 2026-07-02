Feature: UI security validation

  Scenario: Login page can be rendered and allows alice to sign in
    Given I open the login page
    Then I should see a page containing "OWASP Lab"
    When I sign in as "alice" with password "alice123"
    Then I should see a page containing "Dashboard"
    And I should see a page containing "Signed in as alice"
