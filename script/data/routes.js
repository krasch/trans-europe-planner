const ROUTES = {
  "Berlin->Roma": [
    ["Berlin->München", "München->Verona", "Verona->Roma"],
    //["Berlin->München", "München->Bologna", "Bologna->Roma"],
    ["Berlin->Zürich", "Zürich->Milano", "Milano->Roma"],
  ],
  "Berlin->Stockholm": [
    [
      "Berlin->Hamburg",
      "Hamburg->København",
      "København->Malmö",
      "Malmö->Stockholm",
    ],
  ],
  "Berlin->Warszawa": [["Berlin->Warszawa"]],
  "Berlin->London": [
    ["Berlin->Karlsruhe", "Karlsruhe->Paris", "Paris->London"],
    [
      "Berlin->Frankfurt (Main)",
      "Frankfurt (Main)->Bruxelles",
      "Bruxelles->London",
    ],
  ],
  "München->Roma": [["München->Verona", "Verona->Roma"]],
  "München->Warsawa": [["München->Berlin", "Berlin->Warszawa"]],
  "München->London": [
    [
      "München->Frankfurt (Main)",
      "Frankfurt (Main)->Bruxelles",
      "Bruxelles->London",
    ],
    ["München->Karlsruhe", "Karlsruhe->Paris", "Paris->London"],
  ],
};
