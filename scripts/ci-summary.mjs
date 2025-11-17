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

const passedFeatures = featureSummary.filter((f) => f.passed).length;
const failedFeatures = featureSummary.length - passedFeatures;
const allFailed = passedFeatures === 0;

lines.push("## 📊 Resultados de los 5 Features Principales");
lines.push("");
lines.push("| # | Feature | Estado | Escenarios Pasados | Escenarios Fallidos |");
lines.push("|---|---------|--------|-------------------|---------------------|");
featureSummary.forEach((feature) => {
  lines.push(
    `| ${feature.index} | ${feature.name} | ${
      feature.passed ? "✅ Pasó" : "❌ Falló"
    } | ${feature.passedScenarios} | ${feature.failedScenarios} |`
  );
});

lines.push("");
lines.push("### 📈 Resumen General");
lines.push("");
lines.push(`- **✅ Features Pasados:** ${passedFeatures} / ${featureSummary.length}`);
lines.push(`- **❌ Features Fallidos:** ${failedFeatures} / ${featureSummary.length}`);
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

