const CONNECTIONS = [
  {
    id: "ICE1605",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "18:20:00",
        departure: "18:29:00",
      },
      {
        station: "8011113",
        arrival: "18:34:00",
        departure: "18:36:00",
      },
      {
        station: "8010222",
        arrival: "19:10:00",
        departure: "19:11:00",
      },
      {
        station: "8010205",
        arrival: "19:42:00",
        departure: "19:48:00",
      },
      {
        station: "8010101",
        arrival: "20:29:00",
        departure: "20:31:00",
      },
      {
        station: "8001844",
        arrival: "21:35:00",
        departure: "21:37:00",
      },
      {
        station: "8000284",
        arrival: "21:52:00",
        departure: "21:55:00",
      },
      {
        station: "8000261",
        arrival: "23:03:00",
        departure: "23:03:00",
      },
    ],
  },
  {
    id: "ICE699",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "21:23:00",
        departure: "21:27:00",
      },
      {
        station: "8011113",
        arrival: "21:31:00",
        departure: "21:33:00",
      },
      {
        station: "8010222",
        arrival: "22:11:00",
        departure: "22:12:00",
      },
      {
        station: "8010050",
        arrival: "22:28:00",
        departure: "22:29:00",
      },
      {
        station: "8010205",
        arrival: "22:48:00",
        departure: "22:55:00",
      },
      {
        station: "8010101",
        arrival: "23:35:00",
        departure: "23:41:00",
      },
      {
        station: "8010097",
        arrival: "00:10:00",
        departure: "00:12:00",
      },
      {
        station: "8000105",
        arrival: "02:18:00",
        departure: "02:25:00",
      },
      {
        station: "8000068",
        arrival: "02:46:00",
        departure: "02:50:00",
      },
      {
        station: "8000156",
        arrival: "03:38:00",
        departure: "03:40:00",
      },
      {
        station: "8000096",
        arrival: "05:05:00",
        departure: "05:25:00",
      },
      {
        station: "8000170",
        arrival: "06:16:00",
        departure: "06:21:00",
      },
      {
        station: "8000139",
        arrival: "06:34:00",
        departure: "06:36:00",
      },
      {
        station: "8000013",
        arrival: "07:06:00",
        departure: "07:08:00",
      },
      {
        station: "8004158",
        arrival: "07:30:00",
        departure: "07:32:00",
      },
      {
        station: "8000261",
        arrival: "07:41:00",
        departure: "07:41:00",
      },
    ],
  },
  {
    id: "ICE1103",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "07:04:00",
        departure: "07:04:00",
      },
      {
        station: "8011113",
        arrival: "07:09:00",
        departure: "07:11:00",
      },
      {
        station: "8010159",
        arrival: "08:19:00",
        departure: "08:21:00",
      },
      {
        station: "8010101",
        arrival: "08:48:00",
        departure: "08:50:00",
      },
      {
        station: "8000284",
        arrival: "10:00:00",
        departure: "10:03:00",
      },
      {
        station: "8000261",
        arrival: "11:11:00",
        departure: "11:11:00",
      },
    ],
  },
  {
    id: "ICE509",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "12:19:00",
        departure: "12:28:00",
      },
      {
        station: "8011113",
        arrival: "12:33:00",
        departure: "12:36:00",
      },
      {
        station: "8010222",
        arrival: "13:10:00",
        departure: "13:11:00",
      },
      {
        station: "8010205",
        arrival: "13:42:00",
        departure: "13:48:00",
      },
      {
        station: "8010101",
        arrival: "14:29:00",
        departure: "14:31:00",
      },
      {
        station: "8000025",
        arrival: "15:15:00",
        departure: "15:17:00",
      },
      {
        station: "8001844",
        arrival: "15:36:00",
        departure: "15:38:00",
      },
      {
        station: "8000284",
        arrival: "15:52:00",
        departure: "15:55:00",
      },
      {
        station: "8000261",
        arrival: "17:01:00",
        departure: "17:01:00",
      },
    ],
  },
  {
    id: "ICE1113",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "16:58:00",
        departure: "17:04:00",
      },
      {
        station: "8011113",
        arrival: "17:09:00",
        departure: "17:11:00",
      },
      {
        station: "8010159",
        arrival: "18:19:00",
        departure: "18:21:00",
      },
      {
        station: "8010101",
        arrival: "18:48:00",
        departure: "18:50:00",
      },
      {
        station: "8000284",
        arrival: "20:00:00",
        departure: "20:03:00",
      },
      {
        station: "8000261",
        arrival: "21:12:00",
        departure: "21:12:00",
      },
    ],
  },
  {
    id: "ICE1003",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "08:12:00",
        departure: "08:12:00",
      },
      {
        station: "8011113",
        arrival: "08:17:00",
        departure: "08:19:00",
      },
      {
        station: "8000284",
        arrival: "10:56:00",
        departure: "10:59:00",
      },
      {
        station: "8000261",
        arrival: "12:02:00",
        departure: "12:02:00",
      },
    ],
  },
  {
    id: "ICE1109",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "12:56:00",
        departure: "13:04:00",
      },
      {
        station: "8011113",
        arrival: "13:09:00",
        departure: "13:11:00",
      },
      {
        station: "8010159",
        arrival: "14:19:00",
        departure: "14:21:00",
      },
      {
        station: "8010101",
        arrival: "14:48:00",
        departure: "14:50:00",
      },
      {
        station: "8000284",
        arrival: "16:00:00",
        departure: "16:03:00",
      },
      {
        station: "8000261",
        arrival: "17:10:00",
        departure: "17:10:00",
      },
    ],
  },
  {
    id: "ICE1105",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "09:04:00",
        departure: "09:04:00",
      },
      {
        station: "8011113",
        arrival: "09:09:00",
        departure: "09:11:00",
      },
      {
        station: "8010159",
        arrival: "10:19:00",
        departure: "10:21:00",
      },
      {
        station: "8010101",
        arrival: "10:48:00",
        departure: "10:50:00",
      },
      {
        station: "8000284",
        arrival: "12:00:00",
        departure: "12:03:00",
      },
      {
        station: "8000261",
        arrival: "13:09:00",
        departure: "13:09:00",
      },
    ],
  },
  {
    id: "ICE1001",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "05:56:00",
        departure: "06:00:00",
      },
      {
        station: "8011113",
        arrival: "06:05:00",
        departure: "06:07:00",
      },
      {
        station: "8010159",
        arrival: "07:10:00",
        departure: "07:12:00",
      },
      {
        station: "8010101",
        arrival: "07:40:00",
        departure: "07:45:00",
      },
      {
        station: "8000284",
        arrival: "08:56:00",
        departure: "08:59:00",
      },
      {
        station: "8000261",
        arrival: "10:02:00",
        departure: "10:02:00",
      },
    ],
  },
  {
    id: "ICE507",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "10:20:00",
        departure: "10:28:00",
      },
      {
        station: "8011113",
        arrival: "10:33:00",
        departure: "10:36:00",
      },
      {
        station: "8010222",
        arrival: "11:10:00",
        departure: "11:11:00",
      },
      {
        station: "8010205",
        arrival: "11:42:00",
        departure: "11:48:00",
      },
      {
        station: "8010101",
        arrival: "12:29:00",
        departure: "12:31:00",
      },
      {
        station: "8000025",
        arrival: "13:14:00",
        departure: "13:16:00",
      },
      {
        station: "8001844",
        arrival: "13:36:00",
        departure: "13:38:00",
      },
      {
        station: "8000284",
        arrival: "13:52:00",
        departure: "13:55:00",
      },
      {
        station: "8000261",
        arrival: "15:04:00",
        departure: "15:04:00",
      },
    ],
  },
  {
    id: "ICE703",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "09:22:00",
        departure: "09:34:00",
      },
      {
        station: "8011113",
        arrival: "09:39:00",
        departure: "09:41:00",
      },
      {
        station: "8010050",
        arrival: "10:32:00",
        departure: "10:33:00",
      },
      {
        station: "8010159",
        arrival: "10:50:00",
        departure: "10:52:00",
      },
      {
        station: "8010101",
        arrival: "11:24:00",
        departure: "11:32:00",
      },
      {
        station: "8000025",
        arrival: "12:15:00",
        departure: "12:17:00",
      },
      {
        station: "8000284",
        arrival: "12:50:00",
        departure: "12:53:00",
      },
      {
        station: "8000183",
        arrival: "13:22:00",
        departure: "13:23:00",
      },
      {
        station: "8000261",
        arrival: "14:01:00",
        departure: "14:01:00",
      },
    ],
  },
  {
    id: "ICE505",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "08:17:00",
        departure: "08:28:00",
      },
      {
        station: "8011113",
        arrival: "08:33:00",
        departure: "08:36:00",
      },
      {
        station: "8010222",
        arrival: "09:10:00",
        departure: "09:11:00",
      },
      {
        station: "8010205",
        arrival: "09:42:00",
        departure: "09:48:00",
      },
      {
        station: "8010101",
        arrival: "10:29:00",
        departure: "10:31:00",
      },
      {
        station: "8000025",
        arrival: "11:15:00",
        departure: "11:17:00",
      },
      {
        station: "8001844",
        arrival: "11:37:00",
        departure: "11:39:00",
      },
      {
        station: "8000284",
        arrival: "11:52:00",
        departure: "11:55:00",
      },
      {
        station: "8000261",
        arrival: "13:01:00",
        departure: "13:01:00",
      },
    ],
  },
  {
    id: "ICE1009",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "18:12:00",
        departure: "18:12:00",
      },
      {
        station: "8011113",
        arrival: "18:17:00",
        departure: "18:19:00",
      },
      {
        station: "8000284",
        arrival: "20:56:00",
        departure: "20:59:00",
      },
      {
        station: "8000261",
        arrival: "22:01:00",
        departure: "22:01:00",
      },
    ],
  },
  {
    id: "ICE707",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "13:22:00",
        departure: "13:34:00",
      },
      {
        station: "8011113",
        arrival: "13:39:00",
        departure: "13:41:00",
      },
      {
        station: "8010050",
        arrival: "14:32:00",
        departure: "14:33:00",
      },
      {
        station: "8010159",
        arrival: "14:50:00",
        departure: "14:52:00",
      },
      {
        station: "8010101",
        arrival: "15:24:00",
        departure: "15:32:00",
      },
      {
        station: "8000025",
        arrival: "16:15:00",
        departure: "16:17:00",
      },
      {
        station: "8000284",
        arrival: "16:52:00",
        departure: "16:55:00",
      },
      {
        station: "8000183",
        arrival: "17:24:00",
        departure: "17:25:00",
      },
      {
        station: "8000261",
        arrival: "18:03:00",
        departure: "18:03:00",
      },
    ],
  },
  {
    id: "ICE1005",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "12:04:00",
        departure: "12:04:00",
      },
      {
        station: "8011113",
        arrival: "12:09:00",
        departure: "12:11:00",
      },
      {
        station: "8010159",
        arrival: "13:16:00",
        departure: "13:18:00",
      },
      {
        station: "8010101",
        arrival: "13:45:00",
        departure: "13:47:00",
      },
      {
        station: "8000284",
        arrival: "14:56:00",
        departure: "14:59:00",
      },
      {
        station: "8000261",
        arrival: "16:01:00",
        departure: "16:01:00",
      },
    ],
  },
  {
    id: "ICE603",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "16:19:00",
        departure: "16:29:00",
      },
      {
        station: "8011113",
        arrival: "16:34:00",
        departure: "16:36:00",
      },
      {
        station: "8010222",
        arrival: "17:10:00",
        departure: "17:11:00",
      },
      {
        station: "8010205",
        arrival: "17:42:00",
        departure: "17:48:00",
      },
      {
        station: "8010101",
        arrival: "18:29:00",
        departure: "18:31:00",
      },
      {
        station: "8000025",
        arrival: "19:16:00",
        departure: "19:18:00",
      },
      {
        station: "8001844",
        arrival: "19:36:00",
        departure: "19:38:00",
      },
      {
        station: "8000284",
        arrival: "19:52:00",
        departure: "19:55:00",
      },
      {
        station: "8000261",
        arrival: "21:03:00",
        departure: "21:03:00",
      },
    ],
  },
  {
    id: "ICE1101",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "04:56:00",
        departure: "05:04:00",
      },
      {
        station: "8011113",
        arrival: "05:08:00",
        departure: "05:10:00",
      },
      {
        station: "8010159",
        arrival: "06:13:00",
        departure: "06:15:00",
      },
      {
        station: "8010101",
        arrival: "06:42:00",
        departure: "06:44:00",
      },
      {
        station: "8000284",
        arrival: "08:00:00",
        departure: "08:03:00",
      },
      {
        station: "8000261",
        arrival: "09:10:00",
        departure: "09:10:00",
      },
    ],
  },
  {
    id: "ICE1601",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "14:19:00",
        departure: "14:29:00",
      },
      {
        station: "8011113",
        arrival: "14:34:00",
        departure: "14:36:00",
      },
      {
        station: "8010222",
        arrival: "15:10:00",
        departure: "15:11:00",
      },
      {
        station: "8010205",
        arrival: "15:42:00",
        departure: "15:48:00",
      },
      {
        station: "8010101",
        arrival: "16:29:00",
        departure: "16:31:00",
      },
      {
        station: "8001844",
        arrival: "17:36:00",
        departure: "17:38:00",
      },
      {
        station: "8000284",
        arrival: "17:52:00",
        departure: "17:55:00",
      },
      {
        station: "8000261",
        arrival: "19:03:00",
        departure: "19:03:00",
      },
    ],
  },
  {
    id: "ICE503",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "06:23:00",
        departure: "06:28:00",
      },
      {
        station: "8011113",
        arrival: "06:33:00",
        departure: "06:35:00",
      },
      {
        station: "8010222",
        arrival: "07:10:00",
        departure: "07:11:00",
      },
      {
        station: "8010205",
        arrival: "07:42:00",
        departure: "07:48:00",
      },
      {
        station: "8010101",
        arrival: "08:29:00",
        departure: "08:31:00",
      },
      {
        station: "8000025",
        arrival: "09:15:00",
        departure: "09:17:00",
      },
      {
        station: "8001844",
        arrival: "09:36:00",
        departure: "09:38:00",
      },
      {
        station: "8000284",
        arrival: "09:52:00",
        departure: "09:55:00",
      },
      {
        station: "8000261",
        arrival: "11:03:00",
        departure: "11:03:00",
      },
    ],
  },
  {
    id: "ICE1107",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "10:56:00",
        departure: "11:04:00",
      },
      {
        station: "8011113",
        arrival: "11:09:00",
        departure: "11:11:00",
      },
      {
        station: "8010159",
        arrival: "12:19:00",
        departure: "12:21:00",
      },
      {
        station: "8010101",
        arrival: "12:48:00",
        departure: "12:50:00",
      },
      {
        station: "8000284",
        arrival: "13:57:00",
        departure: "14:00:00",
      },
      {
        station: "8000261",
        arrival: "15:08:00",
        departure: "15:08:00",
      },
    ],
  },
  {
    id: "ICE1007",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "15:56:00",
        departure: "16:11:00",
      },
      {
        station: "8011113",
        arrival: "16:17:00",
        departure: "16:19:00",
      },
      {
        station: "8000284",
        arrival: "18:56:00",
        departure: "18:59:00",
      },
      {
        station: "8000261",
        arrival: "20:02:00",
        departure: "20:02:00",
      },
    ],
  },
  {
    id: "ICE705",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "11:21:00",
        departure: "11:34:00",
      },
      {
        station: "8011113",
        arrival: "11:39:00",
        departure: "11:41:00",
      },
      {
        station: "8010050",
        arrival: "12:32:00",
        departure: "12:33:00",
      },
      {
        station: "8010159",
        arrival: "12:50:00",
        departure: "12:52:00",
      },
      {
        station: "8010101",
        arrival: "13:24:00",
        departure: "13:32:00",
      },
      {
        station: "8000025",
        arrival: "14:15:00",
        departure: "14:17:00",
      },
      {
        station: "8000284",
        arrival: "14:52:00",
        departure: "14:59:00",
      },
      {
        station: "8000078",
        arrival: "15:48:00",
        departure: "15:50:00",
      },
      {
        station: "8000013",
        arrival: "16:09:00",
        departure: "16:10:00",
      },
      {
        station: "8004158",
        arrival: "16:32:00",
        departure: "16:33:00",
      },
      {
        station: "8000261",
        arrival: "16:42:00",
        departure: "16:42:00",
      },
    ],
  },
  {
    id: "ICE1111",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "14:56:00",
        departure: "15:04:00",
      },
      {
        station: "8011113",
        arrival: "15:09:00",
        departure: "15:11:00",
      },
      {
        station: "8010159",
        arrival: "16:19:00",
        departure: "16:21:00",
      },
      {
        station: "8010101",
        arrival: "16:48:00",
        departure: "16:50:00",
      },
      {
        station: "8000284",
        arrival: "18:00:00",
        departure: "18:03:00",
      },
      {
        station: "8000261",
        arrival: "19:11:00",
        departure: "19:11:00",
      },
    ],
  },
  {
    id: "ICE1115",
    type: "train",
    stops: [
      {
        station: "8098160",
        arrival: "18:56:00",
        departure: "19:04:00",
      },
      {
        station: "8011113",
        arrival: "19:09:00",
        departure: "19:11:00",
      },
      {
        station: "8010159",
        arrival: "20:19:00",
        departure: "20:21:00",
      },
      {
        station: "8010101",
        arrival: "20:48:00",
        departure: "20:50:00",
      },
      {
        station: "8000284",
        arrival: "21:58:00",
        departure: "22:01:00",
      },
      {
        station: "8000261",
        arrival: "23:07:00",
        departure: "23:07:00",
      },
    ],
  },
  {
    id: "R18289",
    type: "train",
    stops: [
      {
        station: "8300151",
        arrival: "11:38:00",
        departure: "11:38:00",
      },
      {
        station: "8300497",
        arrival: "11:43:00",
        departure: "11:44:00",
      },
      {
        station: "8338974",
        arrival: "11:50:00",
        departure: "11:51:00",
      },
      {
        station: "8300237",
        arrival: "11:56:00",
        departure: "11:57:00",
      },
      {
        station: "8301004",
        arrival: "12:06:00",
        departure: "12:07:00",
      },
      {
        station: "8300498",
        arrival: "12:12:00",
        departure: "12:13:00",
      },
      {
        station: "8301005",
        arrival: "12:19:00",
        departure: "12:20:00",
      },
      {
        station: "8301006",
        arrival: "12:25:00",
        departure: "12:26:00",
      },
      {
        station: "8300167",
        arrival: "12:34:00",
        departure: "12:35:00",
      },
      {
        station: "8301007",
        arrival: "12:41:00",
        departure: "12:42:00",
      },
      {
        station: "8302108",
        arrival: "12:45:00",
        departure: "12:46:00",
      },
      {
        station: "8301802",
        arrival: "12:49:00",
        departure: "12:50:00",
      },
      {
        station: "8300169",
        arrival: "12:59:00",
        departure: "13:02:00",
      },
      {
        station: "8300157",
        arrival: "13:20:00",
        departure: "13:20:00",
      },
    ],
  },
  {
    id: "FR8503",
    type: "train",
    stops: [
      {
        station: "8300120",
        arrival: "09:24:00",
        departure: "09:37:00",
      },
      {
        station: "8300217",
        arrival: "10:44:00",
        departure: "10:47:00",
      },
      {
        station: "8300151",
        arrival: "11:24:00",
        departure: "11:33:00",
      },
    ],
  },
  {
    id: "CF1",
    type: "train",
    stops: [
      {
        station: "8300157",
        arrival: "07:00:00",
        departure: "07:00:00",
      },
      {
        station: "-2",
        arrival: "11:30:00",
        departure: "11:30:00",
      },
    ],
  },
  {
    id: "RJ83",
    type: "train",
    stops: [
      {
        station: "8000261",
        arrival: "09:34:00",
        departure: "09:34:00",
      },
      {
        station: "8000262",
        arrival: "09:42:00",
        departure: "09:44:00",
      },
      {
        station: "8000320",
        arrival: "10:12:00",
        departure: "10:13:00",
      },
      {
        station: "8100001",
        arrival: "10:34:00",
        departure: "10:36:00",
      },
      {
        station: "8100099",
        arrival: "10:44:00",
        departure: "10:46:00",
      },
      {
        station: "8100102",
        arrival: "10:58:00",
        departure: "11:00:00",
      },
      {
        station: "8100108",
        arrival: "11:18:00",
        departure: "11:24:00",
      },
      {
        station: "8300092",
        arrival: "12:00:00",
        departure: "12:14:00",
      },
      {
        station: "8300089",
        arrival: "12:44:00",
        departure: "12:46:00",
      },
      {
        station: "8300076",
        arrival: "12:55:00",
        departure: "12:56:00",
      },
      {
        station: "8300084",
        arrival: "13:27:00",
        departure: "13:31:00",
      },
      {
        station: "8300101",
        arrival: "14:02:00",
        departure: "14:04:00",
      },
      {
        station: "8300113",
        arrival: "14:17:00",
        departure: "14:19:00",
      },
      {
        station: "8300120",
        arrival: "14:58:00",
        departure: "15:22:00",
      },
    ],
  },
  {
    id: "RJ81",
    type: "train",
    stops: [
      {
        station: "8000261",
        arrival: "07:34:00",
        departure: "07:34:00",
      },
      {
        station: "8000262",
        arrival: "07:42:00",
        departure: "07:44:00",
      },
      {
        station: "8000320",
        arrival: "08:12:00",
        departure: "08:13:00",
      },
      {
        station: "8100001",
        arrival: "08:34:00",
        departure: "08:36:00",
      },
      {
        station: "8100099",
        arrival: "08:44:00",
        departure: "08:46:00",
      },
      {
        station: "8100102",
        arrival: "08:58:00",
        departure: "09:00:00",
      },
      {
        station: "8100108",
        arrival: "09:18:00",
        departure: "09:24:00",
      },
      {
        station: "8300092",
        arrival: "10:00:00",
        departure: "10:14:00",
      },
      {
        station: "8300089",
        arrival: "10:44:00",
        departure: "10:46:00",
      },
      {
        station: "8300076",
        arrival: "10:55:00",
        departure: "10:56:00",
      },
      {
        station: "8300084",
        arrival: "11:27:00",
        departure: "11:31:00",
      },
      {
        station: "8300101",
        arrival: "12:02:00",
        departure: "12:04:00",
      },
      {
        station: "8300113",
        arrival: "12:17:00",
        departure: "12:19:00",
      },
      {
        station: "8300120",
        arrival: "12:56:00",
        departure: "13:13:00",
      },
    ],
  },
  {
    id: "EC89",
    type: "train",
    stops: [
      {
        station: "8000261",
        arrival: "15:34:00",
        departure: "15:34:00",
      },
      {
        station: "8000262",
        arrival: "15:42:00",
        departure: "15:44:00",
      },
      {
        station: "8000320",
        arrival: "16:12:00",
        departure: "16:13:00",
      },
      {
        station: "8100001",
        arrival: "16:34:00",
        departure: "16:36:00",
      },
      {
        station: "8100099",
        arrival: "16:44:00",
        departure: "16:46:00",
      },
      {
        station: "8100102",
        arrival: "16:58:00",
        departure: "17:00:00",
      },
      {
        station: "8100108",
        arrival: "17:18:00",
        departure: "17:24:00",
      },
      {
        station: "8300092",
        arrival: "18:00:00",
        departure: "18:14:00",
      },
      {
        station: "8300089",
        arrival: "18:44:00",
        departure: "18:46:00",
      },
      {
        station: "8300076",
        arrival: "18:55:00",
        departure: "18:56:00",
      },
      {
        station: "8300084",
        arrival: "19:27:00",
        departure: "19:31:00",
      },
      {
        station: "8300101",
        arrival: "20:02:00",
        departure: "20:04:00",
      },
      {
        station: "8300113",
        arrival: "20:17:00",
        departure: "20:19:00",
      },
      {
        station: "8300120",
        arrival: "21:00:00",
        departure: "21:00:00",
      },
    ],
  },
  {
    id: "EC87",
    type: "train",
    stops: [
      {
        station: "8000261",
        arrival: "13:34:00",
        departure: "13:34:00",
      },
      {
        station: "8000262",
        arrival: "13:42:00",
        departure: "13:44:00",
      },
      {
        station: "8000320",
        arrival: "14:12:00",
        departure: "14:13:00",
      },
      {
        station: "8100001",
        arrival: "14:34:00",
        departure: "14:36:00",
      },
      {
        station: "8100099",
        arrival: "14:44:00",
        departure: "14:46:00",
      },
      {
        station: "8100102",
        arrival: "14:58:00",
        departure: "15:00:00",
      },
      {
        station: "8100108",
        arrival: "15:18:00",
        departure: "15:24:00",
      },
      {
        station: "8300092",
        arrival: "16:00:00",
        departure: "16:14:00",
      },
      {
        station: "8300089",
        arrival: "16:44:00",
        departure: "16:46:00",
      },
      {
        station: "8300076",
        arrival: "16:55:00",
        departure: "16:56:00",
      },
      {
        station: "8300084",
        arrival: "17:27:00",
        departure: "17:31:00",
      },
      {
        station: "8300101",
        arrival: "18:02:00",
        departure: "18:04:00",
      },
      {
        station: "8300113",
        arrival: "18:17:00",
        departure: "18:19:00",
      },
      {
        station: "8300120",
        arrival: "18:58:00",
        departure: "19:15:00",
      },
    ],
  },
];
