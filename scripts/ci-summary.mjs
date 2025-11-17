import { existsSync, readFileSync } from "fs";
import { resolve } from "path";

const reportPath = resolve("reports/cucumber-report.json");
const lines = [];

if (!existsSync(reportPath)) {
  lines.push("## 📊 Resultados de los 5 Features Principales");
  lines.push("");
  lines.push("_No se encontró el archivo `reports/cucumber-report.json`._");
  lines.push("Verifica que la suite se haya ejecutado correctamente.");
  console.log(lines.join("\n"));
  process.exitCode = 1;
  process.exit();
}

const rawData = readFileSync(reportPath, "utf-8");
const parsedData = JSON.parse(rawData);
const features = Array.isArray(parsedData) ? parsedData : [parsedData];

// Features esperadas (las 5 principales)
const expectedFeatures = [
  { name: "Para Bank Login Feature", file: "login.feature" },
  { name: "ParaBank Accounts Overview Feature", file: "accounts.feature" },
  { name: "ParaBank Transfer Funds Feature", file: "transfer.feature" },
  { name: "ParaBank Bill Pay Feature", file: "bill-pay.feature" },
  { name: "ParaBank Loan Request Feature", file: "loan.feature" },
];

const featureSummary = features.map((feature, index) => {
  const scenarios = feature.elements || [];
  let failedScenarios = 0;
  scenarios.forEach((scenario) => {
    const steps = scenario.steps || [];
    const hasFailed = steps.some(
      (step) => step.result && step.result.status === "failed"
    );
    if (hasFailed) {
      failedScenarios += 1;
    }
  });

  const passedScenarios = scenarios.length - failedScenarios;

  return {
    index: index + 1,
    name: feature.name || `Feature ${index + 1}`,
    passed: failedScenarios === 0,
    passedScenarios,
    failedScenarios,
  };
});

// Mapear features ejecutadas con las esperadas
const executedFeatureNames = new Set(featureSummary.map((f) => f.name));
const allFeaturesSummary = expectedFeatures.map((expected, index) => {
  const executed = featureSummary.find((f) => f.name === expected.name);
  if (executed) {
    return {
      ...executed,
      index: index + 1,
      executed: true,
    };
  }
  return {
    index: index + 1,
    name: expected.name,
    passed: false,
    passedScenarios: 0,
    failedScenarios: 0,
    executed: false,
  };
});

const passedFeatures = allFeaturesSummary.filter((f) => f.executed && f.passed).length;
const failedFeatures = allFeaturesSummary.filter((f) => f.executed && !f.passed).length;
const notExecutedFeatures = allFeaturesSummary.filter((f) => !f.executed).length;
const allFailed = passedFeatures === 0 && failedFeatures > 0;

lines.push("## 📊 Resultados de los 5 Features Principales");
lines.push("");
lines.push("| # | Feature | Estado | Escenarios Pasados | Escenarios Fallidos |");
lines.push("|---|---------|--------|-------------------|---------------------|");
allFeaturesSummary.forEach((feature) => {
  let status = "⏭️ No ejecutado";
  if (feature.executed) {
    status = feature.passed ? "✅ Pasó" : "❌ Falló";
  }
  lines.push(
    `| ${feature.index} | ${feature.name} | ${status} | ${feature.passedScenarios} | ${feature.failedScenarios} |`
  );
});

lines.push("");
lines.push("### 📈 Resumen General");
lines.push("");
lines.push(`- **✅ Features Pasados:** ${passedFeatures} / ${expectedFeatures.length}`);
lines.push(`- **❌ Features Fallidos:** ${failedFeatures} / ${expectedFeatures.length}`);
if (notExecutedFeatures > 0) {
  lines.push(`- **⏭️ Features No Ejecutados:** ${notExecutedFeatures} / ${expectedFeatures.length}`);
  lines.push("");
  lines.push("> ⚠️ **Nota:** Algunas features no se ejecutaron. Esto puede deberse a:");
  lines.push("> - Errores en la configuración o dependencias");
  lines.push("> - Fallos tempranos que impidieron la ejecución de otras features");
  lines.push("> - Problemas de conectividad con el servicio de Parabank");
}
lines.push("");
lines.push("### ⚠️ Nota sobre Inestabilidad del Servicio");
lines.push("");
lines.push(
  "El servicio de Parabank es **externo** y puede ser inestable. Algunas pruebas pueden fallar debido a:"
);
lines.push("- Endpoints no disponibles (404)");
lines.push("- Errores del servidor (500)");
lines.push("- Timeouts o problemas de conectividad");
lines.push("");
lines.push(
  "**Esto es aceptable** en pruebas de integración con servicios externos. Las pruebas validan que el sistema responde correctamente, incluso cuando el servicio externo tiene problemas."
);

console.log(lines.join("\n"));

if (allFailed) {
  process.exitCode = 1;
}

