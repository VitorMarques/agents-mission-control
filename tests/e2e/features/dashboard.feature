Feature: Mission Control Dashboard
  As a team member managing AI agents
  I want to see the mission control dashboard
  So that I can monitor agent activity and manage tasks

  Background:
    Given I am logged in as an admin

  Scenario: View dashboard with no data
    When I navigate to the dashboard
    Then I should see the Mission Control header
    And I should see 0 active agents
    And I should see the Kanban board with 6 columns

  Scenario: View dashboard with agents and tasks
    Given the following agents exist:
      | name   | role                            | status |
      | Hades  | Technical Specialist & Engineer | idle   |
      | Apollo | SEO & Analytics Analyst         | active |
    And the following tasks exist:
      | title              | status     | priority |
      | Fix canonical URLs | in_progress | high    |
      | Add H1 tags        | inbox       | medium  |
    When I navigate to the dashboard
    Then I should see 1 active agent
    And I should see the task "Fix canonical URLs" in the "In Progress" column
    And I should see the task "Add H1 tags" in the "Inbox" column

  Scenario: Create a new task
    When I navigate to the dashboard
    And I click the "New Task" button
    And I fill in "title" with "Research competitor SEO"
    And I fill in "description" with "Analyze top 5 competitors"
    And I select priority "high"
    And I submit the form
    Then I should see the task "Research competitor SEO" in the "Inbox" column

  Scenario: Move task between columns via drag
    Given the following tasks exist:
      | title         | status | priority |
      | Review PR #50 | inbox  | medium   |
    When I navigate to the dashboard
    And I drag "Review PR #50" to the "In Progress" column
    Then I should see the task "Review PR #50" in the "In Progress" column

  Scenario: Open task detail and post comment
    Given the following tasks exist:
      | title          | status | priority |
      | Audit SEO bugs | inbox  | high     |
    When I navigate to the dashboard
    And I click on the task "Audit SEO bugs"
    Then I should see the task detail modal
    And the Messages tab should be active
    When I type "@Hades can you check the structured data?" in the message input
    And I submit the message
    Then I should see the message "@Hades can you check the structured data?" in the thread
