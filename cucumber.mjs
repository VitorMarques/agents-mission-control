module.exports = {
  default: {
    paths: ["tests/e2e/features/**/*.feature"],
    require: [
      "tests/e2e/support/**/*.ts",
      "tests/e2e/steps/**/*.ts",
    ],
    format: [
      "progress",
      "html:tests/e2e/reports/cucumber-report.html",
      "json:tests/e2e/reports/cucumber-report.json",
    ],
    publishQuiet: true,
  },
};
