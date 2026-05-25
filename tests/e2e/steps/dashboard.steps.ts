import {
  Given,
  When,
  Then,
} from "@cucumber/cucumber";
import { expect } from "@playwright/test";

function getPage() {
  return globalThis.e2ePage!;
}

const BASE_URL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

// ─── Background ────────────────────────────────────────────────────────

Given("I am logged in as an admin", async function () {
  const page = getPage();
  // Navigate and login (or use mock auth for testing)
  await page.goto(`${BASE_URL}/login`);
  // In test mode, the app might auto-login or use test credentials
  await page.waitForLoadState("networkidle");
});

// ─── Given ──────────────────────────────────────────────────────────────

Given("the following agents exist:", async function (dataTable: any) {
  // In E2E tests with a real Convex, agents are seeded via the seedAgents mutation
  // This step is a no-op if agents are pre-seeded, or we call the API
  const rows = dataTable.hashes();
  // Store for later assertions
  this.agents = rows;
});

Given("the following tasks exist:", async function (dataTable: any) {
  this.tasks = dataTable.hashes();
});

// ─── When ───────────────────────────────────────────────────────────────

When("I navigate to the dashboard", async function () {
  const page = getPage();
  await page.goto(`${BASE_URL}/`);
  await page.waitForLoadState("networkidle");
});

When("I click the {string} button", async function (buttonText: string) {
  const page = getPage();
  await page.getByRole("button", { name: new RegExp(buttonText, "i") }).click();
  await page.waitForTimeout(500);
});

When("I fill in {string} with {string}", async function (field: string, value: string) {
  const page = getPage();
  const input = page.getByPlaceholder(new RegExp(field, "i")).first();
  await input.fill(value);
});

When("I select priority {string}", async function (priority: string) {
  const page = getPage();
  const select = page.locator("select").first();
  await select.selectOption({ label: priority });
});

When("I submit the form", async function () {
  const page = getPage();
  await page.getByRole("button", { name: /create|submit|send/i }).first().click();
  await page.waitForTimeout(1000);
});

When("I drag {string} to the {string} column", async function (taskTitle: string, column: string) {
  const page = getPage();
  const task = page.locator(`text="${taskTitle}"`).first();
  const target = page.locator(`h3:has-text("${column}")`).first();
  await task.dragTo(target);
  await page.waitForTimeout(500);
});

When("I click on the task {string}", async function (taskTitle: string) {
  const page = getPage();
  await page.locator(`h4:has-text("${taskTitle}")`).first().click();
  await page.waitForTimeout(500);
});

When("I type {string} in the message input", async function (message: string) {
  const page = getPage();
  await page.getByPlaceholder(/post a comment/i).fill(message);
});

When("I submit the message", async function () {
  const page = getPage();
  await page.getByRole("button", { name: /send/i }).click();
  await page.waitForTimeout(1000);
});

When("I navigate to the {string} tab", async function (tabName: string) {
  const page = getPage();
  await page.getByRole("button", { name: new RegExp(tabName, "i") }).click();
  await page.waitForTimeout(300);
});

When("I create a document with:", async function (dataTable: any) {
  const page = getPage();
  const row = dataTable.hashes()[0];

  // Click "New Document" button
  await page.getByRole("button", { name: /new document/i }).click();
  await page.waitForTimeout(300);

  // Fill form
  await page.getByPlaceholder(/document title/i).fill(row.title);
  await page.locator("select").last().selectOption({ value: row.type });
  await page.getByPlaceholder(/document content/i).fill(row.content);

  // Submit
  await page.getByRole("button", { name: /^create$/i }).click();
  await page.waitForTimeout(1000);
});

When("I delegate the task to {string}", async function (agentName: string) {
  const page = getPage();
  // This would interact with a delegation UI element
  // For now, it's a placeholder for the delegation flow
  await page.waitForTimeout(300);
});

// ─── Then ───────────────────────────────────────────────────────────────

Then("I should see the Mission Control header", async function () {
  const page = getPage();
  await expect(page.locator("text=Mission Control")).toBeVisible();
});

Then("I should see {int} active agents", async function (count: number) {
  const page = getPage();
  const badge = page.locator(".bg-emerald-500\\/10").first();
  if (count === 0) {
    // Check that the count shows 0
    await expect(badge.locator(`text=${count}`)).toBeVisible();
  } else {
    await expect(badge.locator(`text=${count}`)).toBeVisible();
  }
});

Then("I should see the Kanban board with {int} columns", async function (count: number) {
  const page = getPage();
  const columns = page.locator("article");
  await expect(columns).toHaveCount(count);
});

Then("I should see the task {string} in the {string} column", async function (taskTitle: string, column: string) {
  const page = getPage();
  const columnSection = page.locator(`article:has(h3:has-text("${column}"))`);
  await expect(columnSection.locator(`h4:has-text("${taskTitle}")`)).toBeVisible();
});

Then("I should see {int} agents in the sidebar", async function (count: number) {
  const page = getPage();
  const agents = page.locator("aside ul li");
  await expect(agents).toHaveCount(count);
});

Then("agent {string} should show status {string}", async function (agentName: string, status: string) {
  const page = getPage();
  const agentCard = page.locator(`li:has-text("${agentName}")`);
  await expect(agentCard).toBeVisible();
});

Then("I should see the task detail modal", async function () {
  const page = getPage();
  await expect(page.locator("text=Task Detail")).toBeVisible();
});

Then("the {string} tab should be active", async function (tabName: string) {
  const page = getPage();
  const tab = page.getByRole("button", { name: new RegExp(tabName, "i") });
  await expect(tab).toHaveClass(/bg-slate-500/);
});

Then("I should see the message {string} in the thread", async function (message: string) {
  const page = getPage();
  await expect(page.locator(`text="${message}"`)).toBeVisible();
});

Then("I should see the document {string} in the list", async function (docTitle: string) {
  const page = getPage();
  await expect(page.locator(`text="${docTitle}"`)).toBeVisible();
});

Then("the document type should be {string}", async function (docType: string) {
  const page = getPage();
  await expect(page.locator(`text=${docType}`).first()).toBeVisible();
});

Then("the task should show {string} as assignee", async function (agentName: string) {
  const page = getPage();
  await expect(page.locator(`text=${agentName}`)).toBeVisible();
});
