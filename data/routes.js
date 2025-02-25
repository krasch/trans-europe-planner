export const ROUTES = {
  "Berlin->Gdańsk": [
    "//Berlin (12:52) -> Gdańsk (18:36, EC59-0)",
    ["Berlin->Gdańsk"],
  ],
  "Berlin->Palermo": [
    ["Berlin->Zürich", "Zürich->Milano", "Milano->Palermo"],
    ["Berlin->München", "München->Verona", "Verona->Roma", "Roma->Palermo"],
  ],
  "Berlin->London": [["Berlin->London"]],
  "Berlin->Stockholm": [
    "//Berlin (05:37) -> Hamburg (08:21, 6985-0) -> København (14:16, EC398-0) -> Malmö (15:06, R1082-0) -> Stockholm (19:37, X2542-0)",
    "//Berlin (09:24) -> Hamburg (12:10, 6901-0) -> København (18:16, EC394-0) -> Malmö (19:06, R1114-0) -> Stockholm (23:38, X2550-0)",
    [
      "Berlin->Hamburg",
      "Hamburg->København",
      "København->Malmö",
      "Malmö->Stockholm",
    ],
    ["Berlin->Stockholm"],
  ],
  "Köln->Gdańsk": [
    "//Köln (08:11) -> Berlin (12:47, 9432-0) -> Gdańsk (18:36, EC59-0)",
    ["Köln->Berlin", "Berlin->Gdańsk"],
  ],
  "Köln->London": [
    "//Köln (07:42) -> Bruxelles (09:26, ICE18-0) -> London (12:00, EST9125-0)",
    "//Köln (09:42) -> Bruxelles (11:26, ICE316-0) -> London (13:57, EST9135-0)",
    "//Köln (11:42) -> Bruxelles (13:26, ICE16-0) -> London (15:57, EST9141-0)",
    "//Köln (13:42) -> Bruxelles (15:26, ICE314-0) -> London (17:47, EST9149-0)",
    "//Köln (15:47) -> Bruxelles (17:26, ICE14-0) -> London (19:00, EST9153-0)",
    "//Köln (17:41) -> Bruxelles (19:26, ICE12-0) -> London (21:57, EST9165-0)",
    ["Köln->Bruxelles", "Bruxelles->London"],
  ],
  "Köln->Stockholm": [
    ["Köln->Hamburg", "Hamburg->Stockholm"],
    "//Köln (03:58) -> Hamburg (08:19, 9314-0) -> København (14:16, EC398-0) -> Malmö (15:06, R1082-0) -> Stockholm (19:37, X2542-0)",
    "//Köln (09:04) -> Hamburg (12:46, 6800-0) -> København (18:16, EC394-0) -> Malmö (19:06, R1114-0) -> Stockholm (23:38, X2550-0)",
    [
      "Köln->Hamburg",
      "Hamburg->København",
      "København->Malmö",
      "Malmö->Stockholm",
    ],
  ],
  "Hamburg->Gdańsk": [
    "//Hamburg (09:22) -> Berlin (12:08, 6544-0) -> Gdańsk (18:36, EC59-0)",
    ["Hamburg->Berlin", "Berlin->Gdańsk"],
  ],
  "Hamburg->London": [
    "//Hamburg (04:16) -> Karlsruhe (09:57, ICE275-0) -> Paris (14:13, ICE9574-0) -> London (16:30, EST9039-0)",
    "//Hamburg (08:14) -> Karlsruhe (13:57, ICE279-0) -> Paris (18:19, ICE9572-0) -> London (20:57, EST9055-0)",
    ["Hamburg->Karlsruhe", "Karlsruhe->Paris", "Paris->London"],
    "//Hamburg (04:16) -> Mannheim (09:27, ICE275-0) -> Paris (12:52, ICE9556-0) -> London (14:30, EST9031-0)",
    "//Hamburg (14:15) -> Mannheim (19:27, ICE375-0) -> Paris (22:52, ICE9550-0) -> London (08:30 (Day 2), EST9007-1)",
    ["Hamburg->Mannheim", "Mannheim->Paris", "Paris->London"],
    "//Hamburg (04:21) -> Köln (08:49, 4555-0) -> Bruxelles (11:26, ICE316-0) -> London (13:57, EST9135-0)",
    "//Hamburg (06:29) -> Köln (10:49, 8524-0) -> Bruxelles (13:26, ICE16-0) -> London (15:57, EST9141-0)",
    "//Hamburg (08:29) -> Köln (12:49, 2722-0) -> Bruxelles (15:26, ICE314-0) -> London (17:47, EST9149-0)",
    "//Hamburg (10:29) -> Köln (14:49, 6146-0) -> Bruxelles (17:26, ICE14-0) -> London (19:00, EST9153-0)",
    "//Hamburg (12:50) -> Köln (16:57, 1900-0) -> Bruxelles (19:26, ICE12-0) -> London (21:57, EST9165-0)",
    ["Hamburg->Köln", "Köln->Bruxelles", "Bruxelles->London"],
    "//Hamburg (05:07) -> Mannheim (10:27, 1608-0) -> Karlsruhe (10:58, ICE103-0) -> Paris (14:13, ICE9574-0) -> London (16:30, EST9039-0)",
    "//Hamburg (13:15) -> Mannheim (18:27, ICE1211-0) -> Karlsruhe (18:58, ICE201-0) -> Paris (22:13, TGV9570-0) -> London (08:30 (Day 2), EST9007-1)",
  ],
  "Hamburg->Stockholm": [
    ["Hamburg->Stockholm"],
    "//Hamburg (08:50) -> København (14:16, EC398-0) -> Malmö (15:06, R1082-0) -> Stockholm (19:37, X2542-0)",
    "//Hamburg (12:53) -> København (18:16, EC394-0) -> Malmö (19:06, R1114-0) -> Stockholm (23:38, X2550-0)",
    ["Hamburg->København", "København->Malmö", "Malmö->Stockholm"],
  ],
  "München->Gdańsk": [
    "//München (08:52) -> Berlin (12:50, 7519-0) -> Gdańsk (18:36, EC59-0)",
    ["München->Berlin", "Berlin->Gdańsk"],
  ],
  "München->London": [
    "//München (00:01) -> Köln (06:33, 94-0) -> Bruxelles (09:26, ICE18-0) -> London (12:00, EST9125-0)",
    "//München (03:32) -> Köln (08:32, 873-0) -> Bruxelles (11:26, ICE316-0) -> London (13:57, EST9135-0)",
    "//München (05:43) -> Köln (11:04, 7862-0) -> Bruxelles (13:26, ICE16-0) -> London (15:57, EST9141-0)",
    "//München (07:46) -> Köln (13:04, 4526-0) -> Bruxelles (15:26, ICE314-0) -> London (17:47, EST9149-0)",
    "//München (09:47) -> Köln (15:04, 43-0) -> Bruxelles (17:26, ICE14-0) -> London (19:00, EST9153-0)",
    "//München (11:48) -> Köln (17:04, 7825-0) -> Bruxelles (19:26, ICE12-0) -> London (21:57, EST9165-0)",
    ["München->Köln", "Köln->Bruxelles", "Bruxelles->London"],
    "//München (03:32) -> Stuttgart (05:45, 873-0) -> Paris (10:13, TGV9578-0) -> London (12:30, EST9023-0)",
    "//München (08:46) -> Stuttgart (10:43, 2992-0) -> Paris (14:13, ICE9574-0) -> London (16:30, EST9039-0)",
    "//München (12:47) -> Stuttgart (14:43, 1240-0) -> Paris (18:19, ICE9572-0) -> London (20:57, EST9055-0)",
    ["München->Stuttgart", "Stuttgart->Paris", "Paris->London"],
    "//München (03:32) -> Mannheim (06:28, 873-0) -> Paris (09:52, ICE9558-0) -> London (11:30, EST9019-0)",
    ["München->Mannheim", "Mannheim->Paris", "Paris->London"],
    "//München (04:13) -> Nürnberg (05:22, 2942-0) -> Köln (10:05, 3965-0) -> Bruxelles (13:26, ICE16-0) -> London (15:57, EST9141-0)",
    "//München (10:21) -> Nürnberg (11:30, 3980-0) -> Köln (16:05, 9229-0) -> Bruxelles (19:26, ICE12-0) -> London (21:57, EST9165-0)",
  ],
  "München->Stockholm": [
    ["München->Hamburg", "Hamburg->Stockholm"],
    [
      "München->Hamburg",
      "Hamburg->København",
      "København->Malmö",
      "Malmö->Stockholm",
    ],
  ],
};
