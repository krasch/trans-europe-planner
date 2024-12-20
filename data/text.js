function getNumTransfersText(numTransfers) {
  if (numTransfers === 0) return "Direkt erreichbar";
  if (numTransfers === 1) return "Mit 1 Umstieg erreichbar";
  else return `Mit ${numTransfers} Umstiegen erreichbar`;
}
