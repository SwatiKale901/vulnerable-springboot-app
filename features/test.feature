Feature: Security validation for remediations

  # VULN-004 - Plain-Text Password Storage
  Scenario: VULN-004a Register and login returns no password (positive)
    Given I register user "testuser" with password "pass123"
    When I login as "testuser" with password "pass123"
    Then the login response is successful and does not contain a password field

  Scenario: VULN-004b Login fails with incorrect password (negative)
    Given user "testuser" exists with password "pass123"
    When I login as "testuser" with password "wrongpass"
    Then the login response status is 401

  # VULN-005 - Broken access control for user enumeration
  Scenario: VULN-005a Non-admin cannot enumerate users
    Given I login as "alice" with password "alice123"
    When I request GET "/api/users" using basic auth for "alice"
    Then the response status should be 403

  Scenario: VULN-005b Admin can enumerate users
    Given I login as "admin" with password "admin123"
    When I request GET "/api/users" using basic auth for "admin"
    Then the response status should be 200 and body is an array

  # VULN-006 - IDOR / Unauthorized profile access and transfer
  Scenario: VULN-006a Owner can read own profile, non-owner denied
    Given I login as "alice" with password "alice123" and capture id as "aliceId"
    When I request GET "/api/profile/{aliceId}" using basic auth for "alice"
    Then the response status should be 200 and username equals "alice"
    When I login as "bob" with password "bob123" and capture as "bobId"
    And I request GET "/api/profile/{aliceId}" using basic auth for "bob"
    Then the response status should be 403

  Scenario: VULN-006b Owner can transfer funds; non-owner cannot
    Given I login as "alice" with password "alice123" and capture id as "aliceId"
    And I login as "bob" with password "bob123" and capture id as "bobId"
    When I perform POST "/api/transfer" with body {"fromId": {aliceId}, "toId": {bobId}, "amount": 10.0} using basic auth for "alice"
    Then the response status should be 200 and body.status equals "ok"
    When I perform POST "/api/transfer" with body {"fromId": {aliceId}, "toId": {bobId}, "amount": 5.0} using basic auth for "bob"
    Then the response status should be 403
