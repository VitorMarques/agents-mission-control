Feature: Document Management
  As a team member
  I want to create and view documents attached to tasks
  So that deliverables are organized and accessible

  Background:
    Given I am logged in as an admin

  Scenario: Create document in task
    Given the following agents exist:
      | name   | role                    | status |
      | Apollo | SEO & Analytics Analyst | idle   |
    And the following tasks exist:
      | title         | status | priority | assignees |
      | SEO Audit     | inbox  | high     | Apollo    |
    When I navigate to the dashboard
    And I click on the task "SEO Audit"
    And I navigate to the "Documents" tab
    And I create a document with:
      | title             | type     | content            |
      | SEO Audit Report  | audit    | # Findings\n...    |
    Then I should see the document "SEO Audit Report" in the list
    And the document type should be "audit"
