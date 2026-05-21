const os = require('os');

function analyzeResources() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const cpuCount = os.cpus().length;
  const freeMemGB = freeMem / (1024 ** 3);

  const memBasedApps = Math.floor(freeMemGB / 0.2);
  const cpuBasedApps = cpuCount * 2;

  const maxApps = Math.min(memBasedApps, cpuBasedApps, 20);
  const safeApps = Math.max(maxApps, 2);

  return {
    cpuCount,
    totalMemGB: (totalMem / 1024 ** 3).toFixed(2),
    freeMemGB: freeMemGB.toFixed(2),
    recommendedApps: safeApps
  };
}

module.exports = { analyzeResources };