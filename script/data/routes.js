const ROUTES = {
  // Berlin
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
  "Berlin->Süden": [
    ["Berlin->München", "München->Verona", "Verona->Roma"],
    //["Berlin->München", "München->Bologna", "Bologna->Roma"],
    ["Berlin->Zürich", "Zürich->Milano", "Milano->Roma"],
    ["Berlin->Karlsruhe", "Karlsruhe->Marseille"],
  ],
  // München
  "München->Roma": [["München->Verona", "Verona->Roma"]],
  "München->Warszawa": [["München->Berlin", "Berlin->Warszawa"]],
  "München->London": [
    [
      "München->Frankfurt (Main)",
      "Frankfurt (Main)->Bruxelles",
      "Bruxelles->London",
    ],
    ["München->Karlsruhe", "Karlsruhe->Paris", "Paris->London"],
  ],
  "München->Stockholm": [
    [
      "München->Hamburg",
      "Hamburg->København",
      "København->Malmö",
      "Malmö->Stockholm",
    ],
  ],
  "München->Süden": [
    ["München->Verona", "Verona->Roma"],
    ["München->Karlsruhe", "Karlsruhe->Marseille"],
  ],
  // Hamburg
  "Hamburg->Roma": [["Hamburg->München", "München->Verona", "Verona->Roma"]],
  "Hamburg->Warszawa": [["Hamburg->Berlin", "Berlin->Warszawa"]],
  "Hamburg->London": [
    [
      "Hamburg->Frankfurt (Main)",
      "Frankfurt (Main)->Bruxelles",
      "Bruxelles->London",
    ],
    ["Hamburg->Karlsruhe", "Karlsruhe->Paris", "Paris->London"],
  ],
  "Hamburg->Stockholm": [
    ["Hamburg->København", "København->Malmö", "Malmö->Stockholm"],
  ],
  "Hamburg->Süden": [
    ["Hamburg->München", "München->Verona", "Verona->Roma"],
    ["Hamburg->Göttingen", "Göttingen->Karlsruhe", "Karlsruhe->Marseille"],
  ],
  // Köln
  "Köln->Roma": [
    ["Köln->Stuttgart", "Stuttgart->Zürich", "Zürich->Milano", "Milano->Roma"],
  ],
  "Köln->Warszawa": [["Köln->Berlin", "Berlin->Warszawa"]],
  "Köln->London": [["Köln->Bruxelles", "Bruxelles->London"]],
  "Köln->Stockholm": [
    [
      "Köln->Hamburg",
      "Hamburg->København",
      "København->Malmö",
      "Malmö->Stockholm",
    ],
  ],
  "Köln->Süden": [
    ["Köln->Stuttgart", "Stuttgart->Zürich", "Zürich->Milano", "Milano->Roma"],
    ["Köln->Karlsruhe", "Karlsruhe->Marseille"],
  ],
};
