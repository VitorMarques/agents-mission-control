Feature: Agent Management
  As a team lead
  I want to manage AI agents in the squad
  So that I can coordinate work effectively

  Background:
    Given I am logged in as an admin

  Scenario: View all agents
    Given the following agents exist:
      | name     | role                            | status |
      | Hades    | Technical Specialist & Engineer | idle   |
      | Poseidon | Strategy & Product Lead         | active |
      | Minerva  | Research & Knowledge Manager    | idle   |
      | Apollo   | SEO & Analytics Analyst         | active |
    When I navigate to the dashboard
    Then I should see 4 agents in the sidebar
    And I should see 2 active agents

  Scenario: Agent shows current task
    Given the following agents exist:
      | name   | role                            | status |
      | Hades  | Technical Specialist & Engineer | active |
    And the following tasks exist:
      | title         | status      | priority | assignees |
      | Fix JSON-LD   | in_progress | high     | Hades     |
    When I navigate to the dashboard
    Then agent "Hades" should show status "active"

  Scenario: Delegate task to another agent
    Given the following agents exist:
      | name    | role                         | status |
      | Hades   | Technical Specialist         | idle   |
      | Apollo  | SEO Analyst                  | idle   |
    And the following tasks exist:
      | title          | status | priority | assignees |
      | SEO audit      | inbox  | high     | Apollo    |
    When I navigate to the dashboard
    And I click on the task "SEO audit"
    And I delegate the task to "Hades"
    Then the task should show "Hades" as assignee
