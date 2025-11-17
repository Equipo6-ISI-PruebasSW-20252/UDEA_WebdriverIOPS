# Lab 5 - WebDriver – Parabank UI & API Tests

Suite de automatización end-to-end construida con **WebdriverIO 9**, **Cucumber** y el patrón **Page Object** para validar los 5 requisitos funcionales de Parabank:

1. Login válido  
2. Consulta de cuentas  
3. Transferencia entre cuentas  
4. Pago fallido por saldo insuficiente (API pública)  
5. Simulación de préstamo

> **Nota:** El proyecto está configurado para ejecutarse con **pnpm**. Todos los comandos documentados asumen este gestor; si usas otro, ajusta bajo tu responsabilidad.

---

## Requisitos

- Node.js 20.x (mismo runtime usado en CI)  
- pnpm ≥ 8 (`npm install -g pnpm` si aún no lo tienes)  
- Google Chrome instalado en el host (WebdriverIO lanza sesiones locales)  
- Acceso a `https://parabank.parasoft.com/parabank`

---

## Instalación

```bash
pnpm install
```

Esto descargará todas las dependencias de WebdriverIO, Cucumber y los page objects. Si cambiaste versiones de Chrome o de las dependencias de WebdriverIO, borra `node_modules/` y vuelve a ejecutar el comando.

---

## Ejecución de pruebas

| Objetivo | Comando |
| --- | --- |
| Ejecutar toda la suite en Chrome | `pnpm run wdio` |
| Ejecutar un feature específico | `pnpm run wdio -- --spec features/transfer.feature` |
| Reintentar una ejecución fallida con más trazas | `LOG_LEVEL=debug pnpm run wdio` |

Parámetros útiles:

- `--spec <ruta>`: limita la corrida a un archivo `.feature`.
- `--cucumberOpts.tagExpression "@tag"`: ejecuta solo escenarios con cierto tag.
- `--baseUrl=https://otro-parabank` si necesitas apuntar a otra instancia (también puedes modificar `baseUrl` dentro de `wdio.conf.js`).

---

## Estructura principal

```
features/
├── *.feature                   # Casos BDD
├── pageobjects/                # Page Objects reutilizables
└── step-definitions/steps.js   # Glue code y hooks

errorShots/                     # Screenshots automáticos tras cada step fallido
reports/cucumber-report.json    # Reporte JSON usado por CI
scripts/ci-summary.mjs          # Genera el resumen Markdown de los 5 features
wdio.conf.js                    # Configuración de WebdriverIO/Cucumber
```

---

## Cobertura funcional y resiliencia

| Feature | Archivo | Estado actual | Estrategia ante inestabilidad |
| --- | --- | --- | --- |
| Login | `features/login.feature` | ✅ Estable | Validaciones de título/copy, espera explícita por inputs y banners de error. |
| Consulta de cuentas | `features/accounts.feature` | ✅ Estable | Esperas hasta que `#accountTable` tenga filas; las aserciones toleran balances vacíos cuando Parabank no los renderiza. |
| Transferencias | `features/transfer.feature` | ✅ Estable | Selección dinámica de cuentas disponibles (`AUTO_SOURCE/AUTO_TARGET`), espera activa al mensaje de éxito/error para evitar loaders infinitos. |
| Bill Pay API | `features/bill-pay.feature` | ✅ Estable | Llama al endpoint público con `node-fetch`; reporta status y cuerpo de respuesta, tolera mensajes 2xx/4xx inconsistentes. |
| Préstamos | `features/loan.feature` | ⚠️ Inestable | La UI de Parabank no siempre muestra el `loanStatus`; el escenario falla cuando el DOM queda vacío. Se mantiene para monitorear la salud del endpoint. |

Recomendación: cuando un escenario falle, revisa `errorShots/` y los logs del step correspondiente para confirmar si la causa es un cambio real o un problema temporal del sitio.

---

## Estrategia frente a la inestabilidad de Parabank

- **Esperas explícitas y reintentos suaves:** los page objects esperan a que existan tablas, inputs o mensajes antes de interactuar.
- **Validaciones flexibles:** en transferencias y pagos se valida que exista una respuesta coherente (éxito o error esperado) en vez de un único código 200.
- **API resiliente:** el escenario de Bill Pay imprime status/response para dejar evidencia cuando el backend devuelve 404/500.
- **Monitoreo continuo del préstamo:** aunque es el feature más propenso a fallar, se conserva para detectar regresiones reales del sitio. Documenta el fallo en la salida de CI para distinguirlo de errores propios.

---

## Reportes y artefactos

- **Consola (`spec` reporter):** muestra el detalle de cada escenario y step.
- **`reports/cucumber-report.json`:** generado automáticamente por WebdriverIO; `scripts/ci-summary.mjs` lo transforma en un resumen Markdown con el estado de los 5 features principales.
- **`errorShots/*.png`:** capturas tomadas en cada `afterStep` fallido (incluyen timestamp y nombre del escenario).
- **`wdio-trace-*.json`:** trazas de protocolo BiDi para depurar sesiones complejas.

Para visualizar los resultados en local, abre los PNGs o procesa el JSON con la herramienta de reportes de tu preferencia. En CI estos archivos se publican como artifacts descargables.

---

## Pipeline de GitHub Actions

Archivo: `.github/workflows/webdriverio.yml`

1. Ejecuta en `ubuntu-latest` con Node 20.  
2. Instala dependencias (actualmente vía `npm ci`).  
3. Corre `npm run wdio` con `continue-on-error: true` para no perder artefactos aunque falle una feature.  
4. Ejecuta `scripts/ci-summary.mjs` y publica el resumen en `GITHUB_STEP_SUMMARY`, destacando los 5 features y recordando la inestabilidad de Parabank.  
5. Sube `reports/**` y `errorShots/**` como artefactos (`webdriverio-artifacts`).

> Próximo ajuste recomendado: migrar el workflow a `pnpm install --frozen-lockfile` para estar alineados con la forma de trabajo local.

---

## Solución de problemas comunes

- **`loanStatus` vacío:** Parabank a veces no muestra el estado del préstamo; vuelve a ejecutar solo `loan.feature` (`pnpm run wdio -- --spec features/loan.feature`). Si persiste, documenta el fallo en el resumen.
- **Tablas u opciones vacías:** asegura que el usuario `john/demo` tenga cuentas activas; si el dropdown queda vacío, se lanza una excepción explícita para reportarlo.
- **Timeouts/`net::ERR_ABORTED`:** suele deberse a lentitud del sitio. Repite la ejecución; si ocurre en múltiples features, considera pausar el pipeline.
- **Dependencias corruptas:** elimina `node_modules/`, ejecuta `pnpm install` y corre nuevamente.

---

## Próximos pasos sugeridos

1. Ajustar el selector/mecanismo de `loanStatus` o mockear la respuesta para estabilizar la feature de préstamos.  
2. Migrar el workflow a pnpm y reutilizar la lógica de resiliencia implementada en Lab 4 para mantener consistencia.  
3. Incorporar un reporte HTML (por ejemplo `@wdio/allure-reporter`) para tener visualización histórica fuera de GitHub.

Con esta documentación, cualquier integrante puede clonar el repo, ejecutar las pruebas con `pnpm`, interpretar los resultados (local y CI) y comprender cómo manejar los fallos causados por la inestabilidad del servicio externo.
