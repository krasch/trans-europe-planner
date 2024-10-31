const CONNECTIONS = [
  {
    id: "CF1",
    type: "train",
    stops: [
      {
        station: 8300157,
        arrival: "07:00:00",
        departure: "07:00:00",
      },
      {
        station: -2002,
        arrival: "11:30:00",
        departure: "11:30:00",
      },
    ],
  },
  {
    id: "ICE505",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "05:34:00",
        departure: "05:34:00",
      },
      {
        station: 8002549,
        arrival: "05:47:00",
        departure: "05:50:00",
      },
      {
        station: 8000168,
        arrival: "06:30:00",
        departure: "06:32:00",
      },
      {
        station: 8010310,
        arrival: "06:56:00",
        departure: "06:58:00",
      },
      {
        station: 8010334,
        arrival: "07:24:00",
        departure: "07:27:00",
      },
      {
        station: 8010404,
        arrival: "08:05:00",
        departure: "08:07:00",
      },
      {
        station: 8011160,
        arrival: "08:17:00",
        departure: "08:28:00",
      },
      {
        station: 8011113,
        arrival: "08:33:00",
        departure: "08:36:00",
      },
      {
        station: 8010222,
        arrival: "09:10:00",
        departure: "09:11:00",
      },
      {
        station: 8010205,
        arrival: "09:42:00",
        departure: "09:48:00",
      },
      {
        station: 8010101,
        arrival: "10:29:00",
        departure: "10:31:00",
      },
      {
        station: 8000025,
        arrival: "11:15:00",
        departure: "11:17:00",
      },
      {
        station: 8001844,
        arrival: "11:37:00",
        departure: "11:39:00",
      },
      {
        station: 8000284,
        arrival: "11:52:00",
        departure: "11:55:00",
      },
      {
        station: 8000261,
        arrival: "13:01:00",
        departure: "13:01:00",
      },
    ],
  },
  {
    id: "ICE603",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "13:38:00",
        departure: "13:38:00",
      },
      {
        station: 8002549,
        arrival: "13:49:00",
        departure: "13:52:00",
      },
      {
        station: 8000168,
        arrival: "14:30:00",
        departure: "14:32:00",
      },
      {
        station: 8010310,
        arrival: "14:56:00",
        departure: "14:57:00",
      },
      {
        station: 8010334,
        arrival: "15:24:00",
        departure: "15:27:00",
      },
      {
        station: 8010404,
        arrival: "16:09:00",
        departure: "16:11:00",
      },
      {
        station: 8011160,
        arrival: "16:19:00",
        departure: "16:29:00",
      },
      {
        station: 8011113,
        arrival: "16:34:00",
        departure: "16:36:00",
      },
      {
        station: 8010222,
        arrival: "17:10:00",
        departure: "17:11:00",
      },
      {
        station: 8010205,
        arrival: "17:42:00",
        departure: "17:48:00",
      },
      {
        station: 8010101,
        arrival: "18:29:00",
        departure: "18:31:00",
      },
      {
        station: 8000025,
        arrival: "19:16:00",
        departure: "19:18:00",
      },
      {
        station: 8001844,
        arrival: "19:36:00",
        departure: "19:38:00",
      },
      {
        station: 8000284,
        arrival: "19:52:00",
        departure: "19:55:00",
      },
      {
        station: 8000261,
        arrival: "21:03:00",
        departure: "21:03:00",
      },
    ],
  },
  {
    id: "ICE1009",
    type: "train",
    stops: [
      {
        station: 8011160,
        arrival: "18:12:00",
        departure: "18:12:00",
      },
      {
        station: 8011113,
        arrival: "18:17:00",
        departure: "18:19:00",
      },
      {
        station: 8000284,
        arrival: "20:56:00",
        departure: "20:59:00",
      },
      {
        station: 8000261,
        arrival: "22:01:00",
        departure: "22:01:00",
      },
    ],
  },
  {
    id: "ICE699",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "18:35:00",
        departure: "18:35:00",
      },
      {
        station: 8002549,
        arrival: "18:45:00",
        departure: "18:48:00",
      },
      {
        station: 8000147,
        arrival: "18:59:00",
        departure: "19:01:00",
      },
      {
        station: 8000238,
        arrival: "19:17:00",
        departure: "19:19:00",
      },
      {
        station: 8010310,
        arrival: "20:10:00",
        departure: "20:11:00",
      },
      {
        station: 8010334,
        arrival: "20:37:00",
        departure: "20:38:00",
      },
      {
        station: 8010404,
        arrival: "21:10:00",
        departure: "21:12:00",
      },
      {
        station: 8011160,
        arrival: "21:23:00",
        departure: "21:27:00",
      },
      {
        station: 8011113,
        arrival: "21:31:00",
        departure: "21:33:00",
      },
      {
        station: 8010222,
        arrival: "22:11:00",
        departure: "22:12:00",
      },
      {
        station: 8010050,
        arrival: "22:28:00",
        departure: "22:29:00",
      },
      {
        station: 8010205,
        arrival: "22:48:00",
        departure: "22:55:00",
      },
      {
        station: 8010101,
        arrival: "23:35:00",
        departure: "23:41:00",
      },
      {
        station: 8010097,
        arrival: "00:10:00",
        departure: "00:12:00",
      },
      {
        station: 8000105,
        arrival: "02:18:00",
        departure: "02:25:00",
      },
      {
        station: 8000068,
        arrival: "02:46:00",
        departure: "02:50:00",
      },
      {
        station: 8000156,
        arrival: "03:38:00",
        departure: "03:40:00",
      },
      {
        station: 8000096,
        arrival: "05:05:00",
        departure: "05:25:00",
      },
      {
        station: 8000170,
        arrival: "06:16:00",
        departure: "06:21:00",
      },
      {
        station: 8000139,
        arrival: "06:34:00",
        departure: "06:36:00",
      },
      {
        station: 8000013,
        arrival: "07:06:00",
        departure: "07:08:00",
      },
      {
        station: 8004158,
        arrival: "07:30:00",
        departure: "07:32:00",
      },
      {
        station: 8000261,
        arrival: "07:41:00",
        departure: "07:41:00",
      },
    ],
  },
  {
    id: "ICE707",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "10:36:00",
        departure: "10:36:00",
      },
      {
        station: 8002549,
        arrival: "10:47:00",
        departure: "10:50:00",
      },
      {
        station: 8000238,
        arrival: "11:14:00",
        departure: "11:16:00",
      },
      {
        station: 8000168,
        arrival: "11:33:00",
        departure: "11:34:00",
      },
      {
        station: 8010310,
        arrival: "12:08:00",
        departure: "12:09:00",
      },
      {
        station: 8010334,
        arrival: "12:35:00",
        departure: "12:36:00",
      },
      {
        station: 8010404,
        arrival: "13:11:00",
        departure: "13:13:00",
      },
      {
        station: 8011160,
        arrival: "13:22:00",
        departure: "13:34:00",
      },
      {
        station: 8011113,
        arrival: "13:39:00",
        departure: "13:41:00",
      },
      {
        station: 8010050,
        arrival: "14:32:00",
        departure: "14:33:00",
      },
      {
        station: 8010159,
        arrival: "14:50:00",
        departure: "14:52:00",
      },
      {
        station: 8010101,
        arrival: "15:24:00",
        departure: "15:32:00",
      },
      {
        station: 8000025,
        arrival: "16:15:00",
        departure: "16:17:00",
      },
      {
        station: 8000284,
        arrival: "16:52:00",
        departure: "16:55:00",
      },
      {
        station: 8000183,
        arrival: "17:24:00",
        departure: "17:25:00",
      },
      {
        station: 8000261,
        arrival: "18:03:00",
        departure: "18:03:00",
      },
    ],
  },
  {
    id: "ICE1103",
    type: "train",
    stops: [
      {
        station: 8011160,
        arrival: "07:04:00",
        departure: "07:04:00",
      },
      {
        station: 8011113,
        arrival: "07:09:00",
        departure: "07:11:00",
      },
      {
        station: 8010159,
        arrival: "08:19:00",
        departure: "08:21:00",
      },
      {
        station: 8010101,
        arrival: "08:48:00",
        departure: "08:50:00",
      },
      {
        station: 8000284,
        arrival: "10:00:00",
        departure: "10:03:00",
      },
      {
        station: 8000261,
        arrival: "11:11:00",
        departure: "11:11:00",
      },
    ],
  },
  {
    id: "ICE1111",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "14:52:00",
        departure: "14:52:00",
      },
      {
        station: 8011160,
        arrival: "14:56:00",
        departure: "15:04:00",
      },
      {
        station: 8011113,
        arrival: "15:09:00",
        departure: "15:11:00",
      },
      {
        station: 8010159,
        arrival: "16:19:00",
        departure: "16:21:00",
      },
      {
        station: 8010101,
        arrival: "16:48:00",
        departure: "16:50:00",
      },
      {
        station: 8000284,
        arrival: "18:00:00",
        departure: "18:03:00",
      },
      {
        station: 8000261,
        arrival: "19:11:00",
        departure: "19:11:00",
      },
    ],
  },
  {
    id: "ICE1005",
    type: "train",
    stops: [
      {
        station: 8011160,
        arrival: "12:04:00",
        departure: "12:04:00",
      },
      {
        station: 8011113,
        arrival: "12:09:00",
        departure: "12:11:00",
      },
      {
        station: 8010159,
        arrival: "13:16:00",
        departure: "13:18:00",
      },
      {
        station: 8010101,
        arrival: "13:45:00",
        departure: "13:47:00",
      },
      {
        station: 8000284,
        arrival: "14:56:00",
        departure: "14:59:00",
      },
      {
        station: 8000261,
        arrival: "16:01:00",
        departure: "16:01:00",
      },
    ],
  },
  {
    id: "ICE1101",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "04:52:00",
        departure: "04:52:00",
      },
      {
        station: 8011160,
        arrival: "04:56:00",
        departure: "05:04:00",
      },
      {
        station: 8011113,
        arrival: "05:08:00",
        departure: "05:10:00",
      },
      {
        station: 8010159,
        arrival: "06:13:00",
        departure: "06:15:00",
      },
      {
        station: 8010101,
        arrival: "06:42:00",
        departure: "06:44:00",
      },
      {
        station: 8000284,
        arrival: "08:00:00",
        departure: "08:03:00",
      },
      {
        station: 8000261,
        arrival: "09:10:00",
        departure: "09:10:00",
      },
    ],
  },
  {
    id: "ICE509",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "09:22:00",
        departure: "09:22:00",
      },
      {
        station: 8002549,
        arrival: "09:33:00",
        departure: "09:37:00",
      },
      {
        station: 8000168,
        arrival: "10:29:00",
        departure: "10:31:00",
      },
      {
        station: 8010310,
        arrival: "10:56:00",
        departure: "10:58:00",
      },
      {
        station: 8010334,
        arrival: "11:24:00",
        departure: "11:27:00",
      },
      {
        station: 8010404,
        arrival: "12:08:00",
        departure: "12:10:00",
      },
      {
        station: 8011160,
        arrival: "12:19:00",
        departure: "12:28:00",
      },
      {
        station: 8011113,
        arrival: "12:33:00",
        departure: "12:36:00",
      },
      {
        station: 8010222,
        arrival: "13:10:00",
        departure: "13:11:00",
      },
      {
        station: 8010205,
        arrival: "13:42:00",
        departure: "13:48:00",
      },
      {
        station: 8010101,
        arrival: "14:29:00",
        departure: "14:31:00",
      },
      {
        station: 8000025,
        arrival: "15:15:00",
        departure: "15:17:00",
      },
      {
        station: 8001844,
        arrival: "15:36:00",
        departure: "15:38:00",
      },
      {
        station: 8000284,
        arrival: "15:52:00",
        departure: "15:55:00",
      },
      {
        station: 8000261,
        arrival: "17:01:00",
        departure: "17:01:00",
      },
    ],
  },
  {
    id: "ICE507",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "07:19:00",
        departure: "07:19:00",
      },
      {
        station: 8002548,
        arrival: "07:26:00",
        departure: "07:27:00",
      },
      {
        station: 8002549,
        arrival: "07:32:00",
        departure: "07:37:00",
      },
      {
        station: 8000168,
        arrival: "08:30:00",
        departure: "08:32:00",
      },
      {
        station: 8010310,
        arrival: "08:56:00",
        departure: "08:57:00",
      },
      {
        station: 8010334,
        arrival: "09:24:00",
        departure: "09:27:00",
      },
      {
        station: 8010404,
        arrival: "10:08:00",
        departure: "10:10:00",
      },
      {
        station: 8011160,
        arrival: "10:20:00",
        departure: "10:28:00",
      },
      {
        station: 8011113,
        arrival: "10:33:00",
        departure: "10:36:00",
      },
      {
        station: 8010222,
        arrival: "11:10:00",
        departure: "11:11:00",
      },
      {
        station: 8010205,
        arrival: "11:42:00",
        departure: "11:48:00",
      },
      {
        station: 8010101,
        arrival: "12:29:00",
        departure: "12:31:00",
      },
      {
        station: 8000025,
        arrival: "13:14:00",
        departure: "13:16:00",
      },
      {
        station: 8001844,
        arrival: "13:36:00",
        departure: "13:38:00",
      },
      {
        station: 8000284,
        arrival: "13:52:00",
        departure: "13:55:00",
      },
      {
        station: 8000261,
        arrival: "15:04:00",
        departure: "15:04:00",
      },
    ],
  },
  {
    id: "ICE1001",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "05:51:00",
        departure: "05:51:00",
      },
      {
        station: 8011160,
        arrival: "05:56:00",
        departure: "06:00:00",
      },
      {
        station: 8011113,
        arrival: "06:05:00",
        departure: "06:07:00",
      },
      {
        station: 8010159,
        arrival: "07:10:00",
        departure: "07:12:00",
      },
      {
        station: 8010101,
        arrival: "07:40:00",
        departure: "07:45:00",
      },
      {
        station: 8000284,
        arrival: "08:56:00",
        departure: "08:59:00",
      },
      {
        station: 8000261,
        arrival: "10:02:00",
        departure: "10:02:00",
      },
    ],
  },
  {
    id: "ICE1105",
    type: "train",
    stops: [
      {
        station: 8011160,
        arrival: "09:04:00",
        departure: "09:04:00",
      },
      {
        station: 8011113,
        arrival: "09:09:00",
        departure: "09:11:00",
      },
      {
        station: 8010159,
        arrival: "10:19:00",
        departure: "10:21:00",
      },
      {
        station: 8010101,
        arrival: "10:48:00",
        departure: "10:50:00",
      },
      {
        station: 8000284,
        arrival: "12:00:00",
        departure: "12:03:00",
      },
      {
        station: 8000261,
        arrival: "13:09:00",
        departure: "13:09:00",
      },
    ],
  },
  {
    id: "ICE703",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "06:35:00",
        departure: "06:35:00",
      },
      {
        station: 8002549,
        arrival: "06:45:00",
        departure: "06:48:00",
      },
      {
        station: 8000238,
        arrival: "07:11:00",
        departure: "07:13:00",
      },
      {
        station: 8010310,
        arrival: "08:09:00",
        departure: "08:10:00",
      },
      {
        station: 8010334,
        arrival: "08:35:00",
        departure: "08:36:00",
      },
      {
        station: 8010404,
        arrival: "09:10:00",
        departure: "09:12:00",
      },
      {
        station: 8011160,
        arrival: "09:22:00",
        departure: "09:34:00",
      },
      {
        station: 8011113,
        arrival: "09:39:00",
        departure: "09:41:00",
      },
      {
        station: 8010050,
        arrival: "10:32:00",
        departure: "10:33:00",
      },
      {
        station: 8010159,
        arrival: "10:50:00",
        departure: "10:52:00",
      },
      {
        station: 8010101,
        arrival: "11:24:00",
        departure: "11:32:00",
      },
      {
        station: 8000025,
        arrival: "12:15:00",
        departure: "12:17:00",
      },
      {
        station: 8000284,
        arrival: "12:50:00",
        departure: "12:53:00",
      },
      {
        station: 8000183,
        arrival: "13:22:00",
        departure: "13:23:00",
      },
      {
        station: 8000261,
        arrival: "14:01:00",
        departure: "14:01:00",
      },
    ],
  },
  {
    id: "ICE503",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "06:19:00",
        departure: "06:19:00",
      },
      {
        station: 8011160,
        arrival: "06:23:00",
        departure: "06:28:00",
      },
      {
        station: 8011113,
        arrival: "06:33:00",
        departure: "06:35:00",
      },
      {
        station: 8010222,
        arrival: "07:10:00",
        departure: "07:11:00",
      },
      {
        station: 8010205,
        arrival: "07:42:00",
        departure: "07:48:00",
      },
      {
        station: 8010101,
        arrival: "08:29:00",
        departure: "08:31:00",
      },
      {
        station: 8000025,
        arrival: "09:15:00",
        departure: "09:17:00",
      },
      {
        station: 8001844,
        arrival: "09:36:00",
        departure: "09:38:00",
      },
      {
        station: 8000284,
        arrival: "09:52:00",
        departure: "09:55:00",
      },
      {
        station: 8000261,
        arrival: "11:03:00",
        departure: "11:03:00",
      },
    ],
  },
  {
    id: "ICE1601",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "11:34:00",
        departure: "11:34:00",
      },
      {
        station: 8002549,
        arrival: "11:46:00",
        departure: "11:49:00",
      },
      {
        station: 8000168,
        arrival: "12:30:00",
        departure: "12:32:00",
      },
      {
        station: 8010334,
        arrival: "13:24:00",
        departure: "13:27:00",
      },
      {
        station: 8010404,
        arrival: "14:07:00",
        departure: "14:09:00",
      },
      {
        station: 8011160,
        arrival: "14:19:00",
        departure: "14:29:00",
      },
      {
        station: 8011113,
        arrival: "14:34:00",
        departure: "14:36:00",
      },
      {
        station: 8010222,
        arrival: "15:10:00",
        departure: "15:11:00",
      },
      {
        station: 8010205,
        arrival: "15:42:00",
        departure: "15:48:00",
      },
      {
        station: 8010101,
        arrival: "16:29:00",
        departure: "16:31:00",
      },
      {
        station: 8001844,
        arrival: "17:36:00",
        departure: "17:38:00",
      },
      {
        station: 8000284,
        arrival: "17:52:00",
        departure: "17:55:00",
      },
      {
        station: 8000261,
        arrival: "19:03:00",
        departure: "19:03:00",
      },
    ],
  },
  {
    id: "ICE1115",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "18:52:00",
        departure: "18:52:00",
      },
      {
        station: 8011160,
        arrival: "18:56:00",
        departure: "19:04:00",
      },
      {
        station: 8011113,
        arrival: "19:09:00",
        departure: "19:11:00",
      },
      {
        station: 8010159,
        arrival: "20:19:00",
        departure: "20:21:00",
      },
      {
        station: 8010101,
        arrival: "20:48:00",
        departure: "20:50:00",
      },
      {
        station: 8000284,
        arrival: "21:58:00",
        departure: "22:01:00",
      },
      {
        station: 8000261,
        arrival: "23:07:00",
        departure: "23:07:00",
      },
    ],
  },
  {
    id: "ICE1107",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "10:51:00",
        departure: "10:51:00",
      },
      {
        station: 8011160,
        arrival: "10:56:00",
        departure: "11:04:00",
      },
      {
        station: 8011113,
        arrival: "11:09:00",
        departure: "11:11:00",
      },
      {
        station: 8010159,
        arrival: "12:19:00",
        departure: "12:21:00",
      },
      {
        station: 8010101,
        arrival: "12:48:00",
        departure: "12:50:00",
      },
      {
        station: 8000284,
        arrival: "13:57:00",
        departure: "14:00:00",
      },
      {
        station: 8000261,
        arrival: "15:08:00",
        departure: "15:08:00",
      },
    ],
  },
  {
    id: "ICE1605",
    type: "train",
    stops: [
      {
        station: 8002553,
        arrival: "15:38:00",
        departure: "15:38:00",
      },
      {
        station: 8002549,
        arrival: "15:50:00",
        departure: "15:53:00",
      },
      {
        station: 8000168,
        arrival: "16:30:00",
        departure: "16:32:00",
      },
      {
        station: 8010310,
        arrival: "16:56:00",
        departure: "16:57:00",
      },
      {
        station: 8010334,
        arrival: "17:24:00",
        departure: "17:27:00",
      },
      {
        station: 8010404,
        arrival: "18:08:00",
        departure: "18:10:00",
      },
      {
        station: 8011160,
        arrival: "18:20:00",
        departure: "18:29:00",
      },
      {
        station: 8011113,
        arrival: "18:34:00",
        departure: "18:36:00",
      },
      {
        station: 8010222,
        arrival: "19:10:00",
        departure: "19:11:00",
      },
      {
        station: 8010205,
        arrival: "19:42:00",
        departure: "19:48:00",
      },
      {
        station: 8010101,
        arrival: "20:29:00",
        departure: "20:31:00",
      },
      {
        station: 8001844,
        arrival: "21:35:00",
        departure: "21:37:00",
      },
      {
        station: 8000284,
        arrival: "21:52:00",
        departure: "21:55:00",
      },
      {
        station: 8000261,
        arrival: "23:03:00",
        departure: "23:03:00",
      },
    ],
  },
  {
    id: "ICE1007",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "15:51:00",
        departure: "15:51:00",
      },
      {
        station: 8011160,
        arrival: "15:56:00",
        departure: "16:11:00",
      },
      {
        station: 8011113,
        arrival: "16:17:00",
        departure: "16:19:00",
      },
      {
        station: 8000284,
        arrival: "18:56:00",
        departure: "18:59:00",
      },
      {
        station: 8000261,
        arrival: "20:02:00",
        departure: "20:02:00",
      },
    ],
  },
  {
    id: "ICE1113",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "16:52:00",
        departure: "16:52:00",
      },
      {
        station: 8011160,
        arrival: "16:58:00",
        departure: "17:04:00",
      },
      {
        station: 8011113,
        arrival: "17:09:00",
        departure: "17:11:00",
      },
      {
        station: 8010159,
        arrival: "18:19:00",
        departure: "18:21:00",
      },
      {
        station: 8010101,
        arrival: "18:48:00",
        departure: "18:50:00",
      },
      {
        station: 8000284,
        arrival: "20:00:00",
        departure: "20:03:00",
      },
      {
        station: 8000261,
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
        station: 8011160,
        arrival: "08:12:00",
        departure: "08:12:00",
      },
      {
        station: 8011113,
        arrival: "08:17:00",
        departure: "08:19:00",
      },
      {
        station: 8000284,
        arrival: "10:56:00",
        departure: "10:59:00",
      },
      {
        station: 8000261,
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
        station: 8011102,
        arrival: "12:52:00",
        departure: "12:52:00",
      },
      {
        station: 8011160,
        arrival: "12:56:00",
        departure: "13:04:00",
      },
      {
        station: 8011113,
        arrival: "13:09:00",
        departure: "13:11:00",
      },
      {
        station: 8010159,
        arrival: "14:19:00",
        departure: "14:21:00",
      },
      {
        station: 8010101,
        arrival: "14:48:00",
        departure: "14:50:00",
      },
      {
        station: 8000284,
        arrival: "16:00:00",
        departure: "16:03:00",
      },
      {
        station: 8000261,
        arrival: "17:10:00",
        departure: "17:10:00",
      },
    ],
  },
  {
    id: "ICE705",
    type: "train",
    stops: [
      {
        station: 8000199,
        arrival: "07:42:00",
        departure: "07:42:00",
      },
      {
        station: 8000271,
        arrival: "07:58:00",
        departure: "07:59:00",
      },
      {
        station: 8002548,
        arrival: "08:44:00",
        departure: "08:45:00",
      },
      {
        station: 8002549,
        arrival: "08:49:00",
        departure: "08:52:00",
      },
      {
        station: 8000238,
        arrival: "09:18:00",
        departure: "09:20:00",
      },
      {
        station: 8010310,
        arrival: "10:10:00",
        departure: "10:11:00",
      },
      {
        station: 8010334,
        arrival: "10:36:00",
        departure: "10:37:00",
      },
      {
        station: 8010404,
        arrival: "11:11:00",
        departure: "11:13:00",
      },
      {
        station: 8011160,
        arrival: "11:21:00",
        departure: "11:34:00",
      },
      {
        station: 8011113,
        arrival: "11:39:00",
        departure: "11:41:00",
      },
      {
        station: 8010050,
        arrival: "12:32:00",
        departure: "12:33:00",
      },
      {
        station: 8010159,
        arrival: "12:50:00",
        departure: "12:52:00",
      },
      {
        station: 8010101,
        arrival: "13:24:00",
        departure: "13:32:00",
      },
      {
        station: 8000025,
        arrival: "14:15:00",
        departure: "14:17:00",
      },
      {
        station: 8000284,
        arrival: "14:52:00",
        departure: "14:59:00",
      },
      {
        station: 8000078,
        arrival: "15:48:00",
        departure: "15:50:00",
      },
      {
        station: 8000013,
        arrival: "16:09:00",
        departure: "16:10:00",
      },
      {
        station: 8004158,
        arrival: "16:32:00",
        departure: "16:33:00",
      },
      {
        station: 8000261,
        arrival: "16:42:00",
        departure: "16:42:00",
      },
    ],
  },
  {
    id: "ICE573",
    type: "train",
    stops: [
      {
        station: 8010255,
        arrival: "06:17:00",
        departure: "06:17:00",
      },
      {
        station: 8011160,
        arrival: "06:26:00",
        departure: "06:29:00",
      },
      {
        station: 8010404,
        arrival: "06:43:00",
        departure: "06:45:00",
      },
      {
        station: 8006552,
        arrival: "07:37:00",
        departure: "07:38:00",
      },
      {
        station: 8000049,
        arrival: "07:55:00",
        departure: "07:57:00",
      },
      {
        station: 8000169,
        arrival: "08:18:00",
        departure: "08:19:00",
      },
      {
        station: 8000128,
        arrival: "08:50:00",
        departure: "08:52:00",
      },
      {
        station: 8003200,
        arrival: "09:12:00",
        departure: "09:14:00",
      },
      {
        station: 8000115,
        arrival: "09:45:00",
        departure: "09:47:00",
      },
      {
        station: 8000150,
        arrival: "10:25:00",
        departure: "10:27:00",
      },
      {
        station: 8000105,
        arrival: "10:44:00",
        departure: "10:52:00",
      },
      {
        station: 8000068,
        arrival: "11:07:00",
        departure: "11:09:00",
      },
      {
        station: 8000244,
        arrival: "11:53:00",
        departure: "11:59:00",
      },
      {
        station: 8000096,
        arrival: "12:38:00",
        departure: "12:38:00",
      },
    ],
  },
  {
    id: "ICE577",
    type: "train",
    stops: [
      {
        station: 8010255,
        arrival: "10:14:00",
        departure: "10:14:00",
      },
      {
        station: 8011160,
        arrival: "10:24:00",
        departure: "10:27:00",
      },
      {
        station: 8010404,
        arrival: "10:43:00",
        departure: "10:45:00",
      },
      {
        station: 8006552,
        arrival: "11:37:00",
        departure: "11:38:00",
      },
      {
        station: 8000049,
        arrival: "11:55:00",
        departure: "11:57:00",
      },
      {
        station: 8000169,
        arrival: "12:18:00",
        departure: "12:19:00",
      },
      {
        station: 8000128,
        arrival: "12:50:00",
        departure: "12:52:00",
      },
      {
        station: 8003200,
        arrival: "13:12:00",
        departure: "13:14:00",
      },
      {
        station: 8000115,
        arrival: "13:45:00",
        departure: "13:47:00",
      },
      {
        station: 8000150,
        arrival: "14:25:00",
        departure: "14:27:00",
      },
      {
        station: 8000105,
        arrival: "14:44:00",
        departure: "14:52:00",
      },
      {
        station: 8000068,
        arrival: "15:07:00",
        departure: "15:09:00",
      },
      {
        station: 8000244,
        arrival: "15:53:00",
        departure: "15:59:00",
      },
      {
        station: 8000096,
        arrival: "16:38:00",
        departure: "16:38:00",
      },
    ],
  },
  {
    id: "ICE575",
    type: "train",
    stops: [
      {
        station: 8010255,
        arrival: "08:17:00",
        departure: "08:17:00",
      },
      {
        station: 8011160,
        arrival: "08:26:00",
        departure: "08:29:00",
      },
      {
        station: 8010404,
        arrival: "08:43:00",
        departure: "08:45:00",
      },
      {
        station: 8006552,
        arrival: "09:37:00",
        departure: "09:38:00",
      },
      {
        station: 8000049,
        arrival: "09:55:00",
        departure: "09:57:00",
      },
      {
        station: 8000169,
        arrival: "10:18:00",
        departure: "10:19:00",
      },
      {
        station: 8000128,
        arrival: "10:50:00",
        departure: "10:52:00",
      },
      {
        station: 8003200,
        arrival: "11:12:00",
        departure: "11:14:00",
      },
      {
        station: 8000115,
        arrival: "11:45:00",
        departure: "11:47:00",
      },
      {
        station: 8000150,
        arrival: "12:25:00",
        departure: "12:27:00",
      },
      {
        station: 8000105,
        arrival: "12:44:00",
        departure: "12:52:00",
      },
      {
        station: 8000068,
        arrival: "13:07:00",
        departure: "13:09:00",
      },
      {
        station: 8000244,
        arrival: "13:53:00",
        departure: "13:59:00",
      },
      {
        station: 8000096,
        arrival: "14:38:00",
        departure: "14:38:00",
      },
    ],
  },
  {
    id: "ICE771",
    type: "train",
    stops: [
      {
        station: 8010255,
        arrival: "14:17:00",
        departure: "14:17:00",
      },
      {
        station: 8011160,
        arrival: "14:26:00",
        departure: "14:29:00",
      },
      {
        station: 8010404,
        arrival: "14:43:00",
        departure: "14:45:00",
      },
      {
        station: 8006552,
        arrival: "15:37:00",
        departure: "15:38:00",
      },
      {
        station: 8000049,
        arrival: "15:55:00",
        departure: "15:57:00",
      },
      {
        station: 8000169,
        arrival: "16:18:00",
        departure: "16:19:00",
      },
      {
        station: 8000128,
        arrival: "16:50:00",
        departure: "16:52:00",
      },
      {
        station: 8003200,
        arrival: "17:12:00",
        departure: "17:14:00",
      },
      {
        station: 8000115,
        arrival: "17:45:00",
        departure: "17:47:00",
      },
      {
        station: 8000150,
        arrival: "18:25:00",
        departure: "18:27:00",
      },
      {
        station: 8000105,
        arrival: "18:44:00",
        departure: "18:52:00",
      },
      {
        station: 8000068,
        arrival: "19:07:00",
        departure: "19:09:00",
      },
      {
        station: 8000244,
        arrival: "19:53:00",
        departure: "19:59:00",
      },
      {
        station: 8000096,
        arrival: "20:38:00",
        departure: "20:38:00",
      },
    ],
  },
  {
    id: "ICE579",
    type: "train",
    stops: [
      {
        station: 8010255,
        arrival: "12:17:00",
        departure: "12:17:00",
      },
      {
        station: 8011160,
        arrival: "12:25:00",
        departure: "12:29:00",
      },
      {
        station: 8010404,
        arrival: "12:43:00",
        departure: "12:45:00",
      },
      {
        station: 8006552,
        arrival: "13:37:00",
        departure: "13:38:00",
      },
      {
        station: 8000049,
        arrival: "13:55:00",
        departure: "13:57:00",
      },
      {
        station: 8000169,
        arrival: "14:18:00",
        departure: "14:19:00",
      },
      {
        station: 8000128,
        arrival: "14:50:00",
        departure: "14:52:00",
      },
      {
        station: 8003200,
        arrival: "15:12:00",
        departure: "15:14:00",
      },
      {
        station: 8000115,
        arrival: "15:45:00",
        departure: "15:47:00",
      },
      {
        station: 8000150,
        arrival: "16:25:00",
        departure: "16:27:00",
      },
      {
        station: 8000105,
        arrival: "16:44:00",
        departure: "16:52:00",
      },
      {
        station: 8000068,
        arrival: "17:07:00",
        departure: "17:09:00",
      },
      {
        station: 8000244,
        arrival: "17:53:00",
        departure: "17:59:00",
      },
      {
        station: 8000096,
        arrival: "18:38:00",
        departure: "18:38:00",
      },
    ],
  },
  {
    id: "ICE773",
    type: "train",
    stops: [
      {
        station: 8010255,
        arrival: "16:15:00",
        departure: "16:15:00",
      },
      {
        station: 8011160,
        arrival: "16:26:00",
        departure: "16:30:00",
      },
      {
        station: 8010404,
        arrival: "16:43:00",
        departure: "16:45:00",
      },
      {
        station: 8006552,
        arrival: "17:37:00",
        departure: "17:38:00",
      },
      {
        station: 8000049,
        arrival: "17:55:00",
        departure: "17:57:00",
      },
      {
        station: 8000169,
        arrival: "18:18:00",
        departure: "18:19:00",
      },
      {
        station: 8000128,
        arrival: "18:50:00",
        departure: "18:52:00",
      },
      {
        station: 8003200,
        arrival: "19:12:00",
        departure: "19:14:00",
      },
      {
        station: 8000115,
        arrival: "19:45:00",
        departure: "19:47:00",
      },
      {
        station: 8000150,
        arrival: "20:25:00",
        departure: "20:27:00",
      },
      {
        station: 8000105,
        arrival: "20:44:00",
        departure: "20:52:00",
      },
      {
        station: 8000068,
        arrival: "21:07:00",
        departure: "21:09:00",
      },
      {
        station: 8000244,
        arrival: "21:52:00",
        departure: "21:58:00",
      },
      {
        station: 8000156,
        arrival: "22:09:00",
        departure: "22:11:00",
      },
      {
        station: 8000096,
        arrival: "22:55:00",
        departure: "22:55:00",
      },
    ],
  },
  {
    id: "R18289",
    type: "train",
    stops: [
      {
        station: 8300151,
        arrival: "11:38:00",
        departure: "11:38:00",
      },
      {
        station: 8300497,
        arrival: "11:43:00",
        departure: "11:44:00",
      },
      {
        station: 8338974,
        arrival: "11:50:00",
        departure: "11:51:00",
      },
      {
        station: 8300237,
        arrival: "11:56:00",
        departure: "11:57:00",
      },
      {
        station: 8301004,
        arrival: "12:06:00",
        departure: "12:07:00",
      },
      {
        station: 8300498,
        arrival: "12:12:00",
        departure: "12:13:00",
      },
      {
        station: 8301005,
        arrival: "12:19:00",
        departure: "12:20:00",
      },
      {
        station: 8301006,
        arrival: "12:25:00",
        departure: "12:26:00",
      },
      {
        station: 8300167,
        arrival: "12:34:00",
        departure: "12:35:00",
      },
      {
        station: 8301007,
        arrival: "12:41:00",
        departure: "12:42:00",
      },
      {
        station: 8302108,
        arrival: "12:45:00",
        departure: "12:46:00",
      },
      {
        station: 8301802,
        arrival: "12:49:00",
        departure: "12:50:00",
      },
      {
        station: 8300169,
        arrival: "12:59:00",
        departure: "13:02:00",
      },
      {
        station: 8300157,
        arrival: "13:20:00",
        departure: "13:20:00",
      },
    ],
  },
  {
    id: "RJ83",
    type: "train",
    stops: [
      {
        station: 8000261,
        arrival: "09:34:00",
        departure: "09:34:00",
      },
      {
        station: 8000262,
        arrival: "09:42:00",
        departure: "09:44:00",
      },
      {
        station: 8000320,
        arrival: "10:12:00",
        departure: "10:13:00",
      },
      {
        station: 8100001,
        arrival: "10:34:00",
        departure: "10:36:00",
      },
      {
        station: 8100099,
        arrival: "10:44:00",
        departure: "10:46:00",
      },
      {
        station: 8100102,
        arrival: "10:58:00",
        departure: "11:00:00",
      },
      {
        station: 8100108,
        arrival: "11:18:00",
        departure: "11:24:00",
      },
      {
        station: 8300092,
        arrival: "12:00:00",
        departure: "12:14:00",
      },
      {
        station: 8300089,
        arrival: "12:44:00",
        departure: "12:46:00",
      },
      {
        station: 8300076,
        arrival: "12:55:00",
        departure: "12:56:00",
      },
      {
        station: 8300084,
        arrival: "13:27:00",
        departure: "13:31:00",
      },
      {
        station: 8300101,
        arrival: "14:02:00",
        departure: "14:04:00",
      },
      {
        station: 8300113,
        arrival: "14:17:00",
        departure: "14:19:00",
      },
      {
        station: 8300120,
        arrival: "14:58:00",
        departure: "15:22:00",
      },
      {
        station: 8300217,
        arrival: "16:19:00",
        departure: "16:19:00",
      },
    ],
  },
  {
    id: "EC87",
    type: "train",
    stops: [
      {
        station: 8000261,
        arrival: "13:34:00",
        departure: "13:34:00",
      },
      {
        station: 8000262,
        arrival: "13:42:00",
        departure: "13:44:00",
      },
      {
        station: 8000320,
        arrival: "14:12:00",
        departure: "14:13:00",
      },
      {
        station: 8100001,
        arrival: "14:34:00",
        departure: "14:36:00",
      },
      {
        station: 8100099,
        arrival: "14:44:00",
        departure: "14:46:00",
      },
      {
        station: 8100102,
        arrival: "14:58:00",
        departure: "15:00:00",
      },
      {
        station: 8100108,
        arrival: "15:18:00",
        departure: "15:24:00",
      },
      {
        station: 8300092,
        arrival: "16:00:00",
        departure: "16:14:00",
      },
      {
        station: 8300089,
        arrival: "16:44:00",
        departure: "16:46:00",
      },
      {
        station: 8300076,
        arrival: "16:55:00",
        departure: "16:56:00",
      },
      {
        station: 8300084,
        arrival: "17:27:00",
        departure: "17:31:00",
      },
      {
        station: 8300101,
        arrival: "18:02:00",
        departure: "18:04:00",
      },
      {
        station: 8300113,
        arrival: "18:17:00",
        departure: "18:19:00",
      },
      {
        station: 8300120,
        arrival: "18:58:00",
        departure: "19:15:00",
      },
      {
        station: 8300217,
        arrival: "20:16:00",
        departure: "20:16:00",
      },
    ],
  },
  {
    id: "RJ81",
    type: "train",
    stops: [
      {
        station: 8000261,
        arrival: "07:34:00",
        departure: "07:34:00",
      },
      {
        station: 8000262,
        arrival: "07:42:00",
        departure: "07:44:00",
      },
      {
        station: 8000320,
        arrival: "08:12:00",
        departure: "08:13:00",
      },
      {
        station: 8100001,
        arrival: "08:34:00",
        departure: "08:36:00",
      },
      {
        station: 8100099,
        arrival: "08:44:00",
        departure: "08:46:00",
      },
      {
        station: 8100102,
        arrival: "08:58:00",
        departure: "09:00:00",
      },
      {
        station: 8100108,
        arrival: "09:18:00",
        departure: "09:24:00",
      },
      {
        station: 8300092,
        arrival: "10:00:00",
        departure: "10:14:00",
      },
      {
        station: 8300089,
        arrival: "10:44:00",
        departure: "10:46:00",
      },
      {
        station: 8300076,
        arrival: "10:55:00",
        departure: "10:56:00",
      },
      {
        station: 8300084,
        arrival: "11:27:00",
        departure: "11:31:00",
      },
      {
        station: 8300101,
        arrival: "12:02:00",
        departure: "12:04:00",
      },
      {
        station: 8300113,
        arrival: "12:17:00",
        departure: "12:19:00",
      },
      {
        station: 8300120,
        arrival: "12:56:00",
        departure: "13:13:00",
      },
      {
        station: 8300217,
        arrival: "14:10:00",
        departure: "14:10:00",
      },
    ],
  },
  {
    id: "RJ85",
    type: "train",
    stops: [
      {
        station: 8000261,
        arrival: "11:33:00",
        departure: "11:33:00",
      },
      {
        station: 8000262,
        arrival: "11:42:00",
        departure: "11:44:00",
      },
      {
        station: 8000320,
        arrival: "12:12:00",
        departure: "12:13:00",
      },
      {
        station: 8100001,
        arrival: "12:34:00",
        departure: "12:36:00",
      },
      {
        station: 8100099,
        arrival: "12:44:00",
        departure: "12:46:00",
      },
      {
        station: 8100102,
        arrival: "12:58:00",
        departure: "13:00:00",
      },
      {
        station: 8100108,
        arrival: "13:18:00",
        departure: "13:24:00",
      },
      {
        station: 8300092,
        arrival: "14:00:00",
        departure: "14:14:00",
      },
      {
        station: 8300089,
        arrival: "14:44:00",
        departure: "14:46:00",
      },
      {
        station: 8300076,
        arrival: "14:55:00",
        departure: "14:56:00",
      },
      {
        station: 8300084,
        arrival: "15:27:00",
        departure: "15:31:00",
      },
      {
        station: 8300101,
        arrival: "16:02:00",
        departure: "16:04:00",
      },
      {
        station: 8300113,
        arrival: "16:17:00",
        departure: "16:19:00",
      },
      {
        station: 8300120,
        arrival: "16:58:00",
        departure: "17:10:00",
      },
      {
        station: 8300126,
        arrival: "17:35:00",
        departure: "17:37:00",
      },
      {
        station: 8300098,
        arrival: "17:56:00",
        departure: "17:58:00",
      },
      {
        station: 8300093,
        arrival: "18:12:00",
        departure: "18:14:00",
      },
      {
        station: 8300094,
        arrival: "18:25:00",
        departure: "18:25:00",
      },
    ],
  },
  {
    id: "EC89",
    type: "train",
    stops: [
      {
        station: 8000261,
        arrival: "15:34:00",
        departure: "15:34:00",
      },
      {
        station: 8000262,
        arrival: "15:42:00",
        departure: "15:44:00",
      },
      {
        station: 8000320,
        arrival: "16:12:00",
        departure: "16:13:00",
      },
      {
        station: 8100001,
        arrival: "16:34:00",
        departure: "16:36:00",
      },
      {
        station: 8100099,
        arrival: "16:44:00",
        departure: "16:46:00",
      },
      {
        station: 8100102,
        arrival: "16:58:00",
        departure: "17:00:00",
      },
      {
        station: 8100108,
        arrival: "17:18:00",
        departure: "17:24:00",
      },
      {
        station: 8300092,
        arrival: "18:00:00",
        departure: "18:14:00",
      },
      {
        station: 8300089,
        arrival: "18:44:00",
        departure: "18:46:00",
      },
      {
        station: 8300076,
        arrival: "18:55:00",
        departure: "18:56:00",
      },
      {
        station: 8300084,
        arrival: "19:27:00",
        departure: "19:31:00",
      },
      {
        station: 8300101,
        arrival: "20:02:00",
        departure: "20:04:00",
      },
      {
        station: 8300113,
        arrival: "20:17:00",
        departure: "20:19:00",
      },
      {
        station: 8300120,
        arrival: "21:00:00",
        departure: "21:00:00",
      },
    ],
  },
  {
    id: "FR8507",
    type: "train",
    stops: [
      {
        station: 8300084,
        arrival: "07:12:00",
        departure: "07:12:00",
      },
      {
        station: 8300101,
        arrival: "07:41:00",
        departure: "07:43:00",
      },
      {
        station: 8300113,
        arrival: "07:55:00",
        departure: "07:57:00",
      },
      {
        station: 8300120,
        arrival: "08:40:00",
        departure: "08:52:00",
      },
      {
        station: 8300217,
        arrival: "09:44:00",
        departure: "09:47:00",
      },
      {
        station: 8300151,
        arrival: "10:24:00",
        departure: "10:33:00",
      },
      {
        station: 8300262,
        arrival: "11:59:00",
        departure: "12:02:00",
      },
      {
        station: 8300263,
        arrival: "12:10:00",
        departure: "12:10:00",
      },
    ],
  },
  {
    id: "FR8519",
    type: "train",
    stops: [
      {
        station: 8300084,
        arrival: "13:12:00",
        departure: "13:12:00",
      },
      {
        station: 8300101,
        arrival: "13:41:00",
        departure: "13:43:00",
      },
      {
        station: 8300113,
        arrival: "13:55:00",
        departure: "13:57:00",
      },
      {
        station: 8300120,
        arrival: "14:40:00",
        departure: "14:52:00",
      },
      {
        station: 8300217,
        arrival: "15:44:00",
        departure: "15:47:00",
      },
      {
        station: 8300151,
        arrival: "16:24:00",
        departure: "16:33:00",
      },
      {
        station: 8300262,
        arrival: "17:59:00",
        departure: "18:02:00",
      },
      {
        station: 8300263,
        arrival: "18:10:00",
        departure: "18:20:00",
      },
      {
        station: 8309988,
        arrival: "19:21:00",
        departure: "19:23:00",
      },
      {
        station: 8300269,
        arrival: "19:48:00",
        departure: "19:50:00",
      },
      {
        station: 8300923,
        arrival: "21:12:00",
        departure: "21:14:00",
      },
      {
        station: 8300335,
        arrival: "21:38:00",
        departure: "21:40:00",
      },
      {
        station: 8302714,
        arrival: "22:02:00",
        departure: "22:04:00",
      },
      {
        station: 8300329,
        arrival: "22:31:00",
        departure: "22:31:00",
      },
    ],
  },
  {
    id: "FR8513",
    type: "train",
    stops: [
      {
        station: 8300084,
        arrival: "05:50:00",
        departure: "05:50:00",
      },
      {
        station: 8300101,
        arrival: "06:20:00",
        departure: "06:22:00",
      },
      {
        station: 8300113,
        arrival: "06:34:00",
        departure: "06:36:00",
      },
      {
        station: 8300120,
        arrival: "07:44:00",
        departure: "07:53:00",
      },
      {
        station: 8300217,
        arrival: "08:44:00",
        departure: "08:47:00",
      },
      {
        station: 8300151,
        arrival: "09:24:00",
        departure: "09:33:00",
      },
      {
        station: 8300262,
        arrival: "10:59:00",
        departure: "11:02:00",
      },
      {
        station: 8300263,
        arrival: "11:10:00",
        departure: "11:10:00",
      },
    ],
  },
  {
    id: "FR8527",
    type: "train",
    stops: [
      {
        station: 8300048,
        arrival: "17:00:00",
        departure: "17:00:00",
      },
      {
        station: 8300124,
        arrival: "17:23:00",
        departure: "17:25:00",
      },
      {
        station: 8300120,
        arrival: "17:41:00",
        departure: "17:52:00",
      },
      {
        station: 8300217,
        arrival: "18:44:00",
        departure: "18:47:00",
      },
      {
        station: 8300151,
        arrival: "19:24:00",
        departure: "19:33:00",
      },
      {
        station: 8300262,
        arrival: "20:59:00",
        departure: "21:02:00",
      },
      {
        station: 8300263,
        arrival: "21:10:00",
        departure: "21:10:00",
      },
    ],
  },
  {
    id: "FR8505",
    type: "train",
    stops: [
      {
        station: 8300084,
        arrival: "05:12:00",
        departure: "05:12:00",
      },
      {
        station: 8300101,
        arrival: "05:41:00",
        departure: "05:43:00",
      },
      {
        station: 8300113,
        arrival: "05:55:00",
        departure: "05:57:00",
      },
      {
        station: 8300120,
        arrival: "06:40:00",
        departure: "06:52:00",
      },
      {
        station: 8300217,
        arrival: "07:44:00",
        departure: "07:47:00",
      },
      {
        station: 8300151,
        arrival: "08:24:00",
        departure: "08:33:00",
      },
      {
        station: 8300262,
        arrival: "10:00:00",
        departure: "10:03:00",
      },
      {
        station: 8300263,
        arrival: "10:10:00",
        departure: "10:10:00",
      },
    ],
  },
  {
    id: "FR8503",
    type: "train",
    stops: [
      {
        station: 8300048,
        arrival: "08:47:00",
        departure: "08:47:00",
      },
      {
        station: 8300124,
        arrival: "09:07:00",
        departure: "09:09:00",
      },
      {
        station: 8300120,
        arrival: "09:24:00",
        departure: "09:37:00",
      },
      {
        station: 8300217,
        arrival: "10:44:00",
        departure: "10:47:00",
      },
      {
        station: 8300151,
        arrival: "11:24:00",
        departure: "11:33:00",
      },
      {
        station: 8300263,
        arrival: "13:05:00",
        departure: "13:05:00",
      },
    ],
  },
  {
    id: "FR8529",
    type: "train",
    stops: [
      {
        station: 8300084,
        arrival: "17:10:00",
        departure: "17:10:00",
      },
      {
        station: 8300101,
        arrival: "17:41:00",
        departure: "17:43:00",
      },
      {
        station: 8300113,
        arrival: "17:55:00",
        departure: "17:57:00",
      },
      {
        station: 8300120,
        arrival: "18:40:00",
        departure: "18:52:00",
      },
      {
        station: 8300217,
        arrival: "19:44:00",
        departure: "19:47:00",
      },
      {
        station: 8300151,
        arrival: "20:24:00",
        departure: "20:33:00",
      },
      {
        station: 8300262,
        arrival: "21:59:00",
        departure: "22:02:00",
      },
      {
        station: 8300263,
        arrival: "22:10:00",
        departure: "22:10:00",
      },
    ],
  },
  {
    id: "FR8525",
    type: "train",
    stops: [
      {
        station: 8300084,
        arrival: "15:12:00",
        departure: "15:12:00",
      },
      {
        station: 8300101,
        arrival: "15:41:00",
        departure: "15:43:00",
      },
      {
        station: 8300113,
        arrival: "15:55:00",
        departure: "15:57:00",
      },
      {
        station: 8300120,
        arrival: "16:40:00",
        departure: "16:52:00",
      },
      {
        station: 8300217,
        arrival: "17:44:00",
        departure: "17:47:00",
      },
      {
        station: 8300151,
        arrival: "18:24:00",
        departure: "18:33:00",
      },
      {
        station: 8300262,
        arrival: "19:59:00",
        departure: "20:02:00",
      },
      {
        station: 8300263,
        arrival: "20:10:00",
        departure: "20:25:00",
      },
      {
        station: 8300239,
        arrival: "21:33:00",
        departure: "21:33:00",
      },
    ],
  },
  {
    id: "FR8503",
    type: "train",
    stops: [
      {
        station: 8300048,
        arrival: "08:47:00",
        departure: "08:47:00",
      },
      {
        station: 8300124,
        arrival: "09:07:00",
        departure: "09:09:00",
      },
      {
        station: 8300120,
        arrival: "09:24:00",
        departure: "09:37:00",
      },
      {
        station: 8300217,
        arrival: "10:44:00",
        departure: "10:47:00",
      },
      {
        station: 8300151,
        arrival: "11:24:00",
        departure: "11:33:00",
      },
      {
        station: 8300263,
        arrival: "13:05:00",
        departure: "13:05:00",
      },
    ],
  },
  {
    id: "TGV9580",
    type: "train",
    stops: [
      {
        station: 8000244,
        arrival: "14:39:00",
        departure: "14:39:00",
      },
      {
        station: 8000191,
        arrival: "15:05:00",
        departure: "15:12:00",
      },
      {
        station: 8000774,
        arrival: "15:34:00",
        departure: "15:35:00",
      },
      {
        station: 8700023,
        arrival: "16:04:00",
        departure: "16:16:00",
      },
      {
        station: 8700031,
        arrival: "17:05:00",
        departure: "17:09:00",
      },
      {
        station: 8730082,
        arrival: "17:31:00",
        departure: "17:34:00",
      },
      {
        station: 8730086,
        arrival: "17:55:00",
        departure: "17:58:00",
      },
      {
        station: 8700091,
        arrival: "18:53:00",
        departure: "18:56:00",
      },
      {
        station: 8700152,
        arrival: "19:56:00",
        departure: "20:06:00",
      },
      {
        station: 8704918,
        arrival: "21:09:00",
        departure: "21:12:00",
      },
      {
        station: 8704980,
        arrival: "21:31:00",
        departure: "21:34:00",
      },
      {
        station: 8700074,
        arrival: "21:46:00",
        departure: "21:46:00",
      },
    ],
  },
  {
    id: "ICE71",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "05:16:00",
        departure: "05:16:00",
      },
      {
        station: 8011160,
        arrival: "05:21:00",
        departure: "05:26:00",
      },
      {
        station: 8011113,
        arrival: "05:31:00",
        departure: "05:33:00",
      },
      {
        station: 8010222,
        arrival: "06:09:00",
        departure: "06:10:00",
      },
      {
        station: 8010205,
        arrival: "06:42:00",
        departure: "06:48:00",
      },
      {
        station: 8010101,
        arrival: "07:28:00",
        departure: "07:30:00",
      },
      {
        station: 8010097,
        arrival: "07:54:00",
        departure: "07:55:00",
      },
      {
        station: 8000115,
        arrival: "08:48:00",
        departure: "08:50:00",
      },
      {
        station: 8000105,
        arrival: "09:44:00",
        departure: "09:52:00",
      },
      {
        station: 8000068,
        arrival: "10:07:00",
        departure: "10:09:00",
      },
      {
        station: 8000191,
        arrival: "11:09:00",
        departure: "11:11:00",
      },
      {
        station: 8000774,
        arrival: "11:26:00",
        departure: "11:27:00",
      },
      {
        station: 8000107,
        arrival: "12:12:00",
        departure: "12:14:00",
      },
      {
        station: 8000026,
        arrival: "12:46:00",
        departure: "13:03:00",
      },
      {
        station: 8500010,
        arrival: "13:10:00",
        departure: "13:10:00",
      },
    ],
  },
  {
    id: "ICE273",
    type: "train",
    stops: [
      {
        station: 8011160,
        arrival: "17:26:00",
        departure: "17:26:00",
      },
      {
        station: 8011113,
        arrival: "17:31:00",
        departure: "17:33:00",
      },
      {
        station: 8010222,
        arrival: "18:09:00",
        departure: "18:10:00",
      },
      {
        station: 8010205,
        arrival: "18:42:00",
        departure: "18:48:00",
      },
      {
        station: 8010101,
        arrival: "19:28:00",
        departure: "19:30:00",
      },
      {
        station: 8010097,
        arrival: "19:58:00",
        departure: "19:59:00",
      },
      {
        station: 8000115,
        arrival: "20:48:00",
        departure: "20:50:00",
      },
      {
        station: 8002041,
        arrival: "21:41:00",
        departure: "21:45:00",
      },
      {
        station: 8000068,
        arrival: "22:07:00",
        departure: "22:09:00",
      },
      {
        station: 8000191,
        arrival: "23:09:00",
        departure: "23:09:00",
      },
    ],
  },
  {
    id: "ICE1171",
    type: "train",
    stops: [
      {
        station: 8011160,
        arrival: "15:26:00",
        departure: "15:26:00",
      },
      {
        station: 8011113,
        arrival: "15:31:00",
        departure: "15:33:00",
      },
      {
        station: 8010222,
        arrival: "16:09:00",
        departure: "16:10:00",
      },
      {
        station: 8010205,
        arrival: "16:42:00",
        departure: "16:48:00",
      },
      {
        station: 8010101,
        arrival: "17:28:00",
        departure: "17:30:00",
      },
      {
        station: 8010097,
        arrival: "17:54:00",
        departure: "17:55:00",
      },
      {
        station: 8000115,
        arrival: "18:48:00",
        departure: "18:50:00",
      },
      {
        station: 8000105,
        arrival: "19:44:00",
        departure: "19:52:00",
      },
      {
        station: 8000068,
        arrival: "20:07:00",
        departure: "20:09:00",
      },
      {
        station: 8000191,
        arrival: "21:09:00",
        departure: "21:11:00",
      },
      {
        station: 8000774,
        arrival: "21:27:00",
        departure: "21:28:00",
      },
      {
        station: 8000290,
        arrival: "21:45:00",
        departure: "21:47:00",
      },
      {
        station: 8000107,
        arrival: "22:17:00",
        departure: "22:19:00",
      },
      {
        station: 8000026,
        arrival: "22:51:00",
        departure: "22:51:00",
      },
    ],
  },
  {
    id: "ICE71",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "05:16:00",
        departure: "05:16:00",
      },
      {
        station: 8011160,
        arrival: "05:21:00",
        departure: "05:26:00",
      },
      {
        station: 8011113,
        arrival: "05:31:00",
        departure: "05:33:00",
      },
      {
        station: 8010222,
        arrival: "06:09:00",
        departure: "06:10:00",
      },
      {
        station: 8010205,
        arrival: "06:42:00",
        departure: "06:48:00",
      },
      {
        station: 8010101,
        arrival: "07:28:00",
        departure: "07:30:00",
      },
      {
        station: 8010097,
        arrival: "07:54:00",
        departure: "07:55:00",
      },
      {
        station: 8000115,
        arrival: "08:48:00",
        departure: "08:50:00",
      },
      {
        station: 8000105,
        arrival: "09:44:00",
        departure: "09:52:00",
      },
      {
        station: 8000068,
        arrival: "10:07:00",
        departure: "10:09:00",
      },
      {
        station: 8000191,
        arrival: "11:09:00",
        departure: "11:11:00",
      },
      {
        station: 8000774,
        arrival: "11:26:00",
        departure: "11:27:00",
      },
      {
        station: 8000290,
        arrival: "11:44:00",
        departure: "11:46:00",
      },
      {
        station: 8000107,
        arrival: "12:14:00",
        departure: "12:16:00",
      },
      {
        station: 8000026,
        arrival: "12:48:00",
        departure: "13:05:00",
      },
      {
        station: 8500010,
        arrival: "13:12:00",
        departure: "13:12:00",
      },
    ],
  },
  {
    id: "FR9663",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "19:35:00",
        departure: "19:35:00",
      },
      {
        station: 8300263,
        arrival: "22:34:00",
        departure: "22:34:00",
      },
    ],
  },
  {
    id: "FR9649",
    type: "train",
    stops: [
      {
        station: 8300001,
        arrival: "15:50:00",
        departure: "15:50:00",
      },
      {
        station: 8300522,
        arrival: "15:58:00",
        departure: "16:00:00",
      },
      {
        station: 8300046,
        arrival: "16:50:00",
        departure: "16:58:00",
      },
      {
        station: 8300217,
        arrival: "18:04:00",
        departure: "18:07:00",
      },
      {
        station: 8300263,
        arrival: "20:10:00",
        departure: "20:10:00",
      },
    ],
  },
  {
    id: "FR9601",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "05:20:00",
        departure: "05:20:00",
      },
      {
        station: 8300418,
        arrival: "05:30:00",
        departure: "05:32:00",
      },
      {
        station: 8305254,
        arrival: "06:08:00",
        departure: "06:10:00",
      },
      {
        station: 8300217,
        arrival: "06:34:00",
        departure: "06:37:00",
      },
      {
        station: 8300263,
        arrival: "08:40:00",
        departure: "08:53:00",
      },
      {
        station: 8309988,
        arrival: "09:48:00",
        departure: "09:50:00",
      },
      {
        station: 8300239,
        arrival: "10:06:00",
        departure: "10:06:00",
      },
    ],
  },
  {
    id: "FR9623",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "10:58:00",
        departure: "10:58:00",
      },
      {
        station: 8300217,
        arrival: "12:04:00",
        departure: "12:07:00",
      },
      {
        station: 8300263,
        arrival: "14:10:00",
        departure: "14:25:00",
      },
      {
        station: 8309988,
        arrival: "15:20:00",
        departure: "15:22:00",
      },
      {
        station: 8300269,
        arrival: "16:14:00",
        departure: "16:16:00",
      },
      {
        station: 8300397,
        arrival: "16:28:00",
        departure: "16:30:00",
      },
      {
        station: 8300345,
        arrival: "16:54:00",
        departure: "16:56:00",
      },
      {
        station: 8300333,
        arrival: "17:30:00",
        departure: "17:32:00",
      },
      {
        station: 8300335,
        arrival: "18:23:00",
        departure: "18:26:00",
      },
      {
        station: 8300328,
        arrival: "18:51:00",
        departure: "18:54:00",
      },
      {
        station: 8300346,
        arrival: "19:12:00",
        departure: "19:14:00",
      },
      {
        station: 8300430,
        arrival: "19:30:00",
        departure: "19:32:00",
      },
      {
        station: 8300344,
        arrival: "19:38:00",
        departure: "19:40:00",
      },
      {
        station: 8300342,
        arrival: "20:03:00",
        departure: "20:06:00",
      },
      {
        station: 8300337,
        arrival: "20:24:00",
        departure: "20:24:00",
      },
    ],
  },
  {
    id: "FR9527",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "10:10:00",
        departure: "10:10:00",
      },
      {
        station: 8300418,
        arrival: "10:18:00",
        departure: "10:20:00",
      },
      {
        station: 8305254,
        arrival: "10:54:00",
        departure: "10:56:00",
      },
      {
        station: 8300217,
        arrival: "11:24:00",
        departure: "11:27:00",
      },
      {
        station: 8300151,
        arrival: "12:04:00",
        departure: "12:14:00",
      },
      {
        station: 8300262,
        arrival: "13:40:00",
        departure: "13:43:00",
      },
      {
        station: 8300263,
        arrival: "13:49:00",
        departure: "14:00:00",
      },
      {
        station: 8309988,
        arrival: "14:56:00",
        departure: "14:58:00",
      },
      {
        station: 8300239,
        arrival: "15:12:00",
        departure: "15:25:00",
      },
      {
        station: 8300269,
        arrival: "16:06:00",
        departure: "16:06:00",
      },
    ],
  },
  {
    id: "FR9651",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "17:35:00",
        departure: "17:35:00",
      },
      {
        station: 8300263,
        arrival: "20:34:00",
        departure: "20:34:00",
      },
    ],
  },
  {
    id: "FR9617",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "09:35:00",
        departure: "09:35:00",
      },
      {
        station: 8300263,
        arrival: "12:34:00",
        departure: "12:34:00",
      },
    ],
  },
  {
    id: "FR9603",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "06:00:00",
        departure: "06:00:00",
      },
      {
        station: 8300217,
        arrival: "07:04:00",
        departure: "07:07:00",
      },
      {
        station: 8300263,
        arrival: "09:10:00",
        departure: "09:25:00",
      },
      {
        station: 8300239,
        arrival: "10:36:00",
        departure: "10:36:00",
      },
    ],
  },
  {
    id: "FR9607",
    type: "train",
    stops: [
      {
        station: 8300001,
        arrival: "05:50:00",
        departure: "05:50:00",
      },
      {
        station: 8300522,
        arrival: "05:58:00",
        departure: "06:00:00",
      },
      {
        station: 8300046,
        arrival: "06:50:00",
        departure: "07:00:00",
      },
      {
        station: 8300217,
        arrival: "08:04:00",
        departure: "08:07:00",
      },
      {
        station: 8300263,
        arrival: "10:11:00",
        departure: "10:25:00",
      },
      {
        station: 8300239,
        arrival: "11:41:00",
        departure: "11:41:00",
      },
    ],
  },
  {
    id: "FR9641",
    type: "train",
    stops: [
      {
        station: 8300001,
        arrival: "13:50:00",
        departure: "13:50:00",
      },
      {
        station: 8300522,
        arrival: "13:58:00",
        departure: "14:00:00",
      },
      {
        station: 8300046,
        arrival: "14:50:00",
        departure: "15:00:00",
      },
      {
        station: 8300217,
        arrival: "16:04:00",
        departure: "16:07:00",
      },
      {
        station: 8300263,
        arrival: "18:10:00",
        departure: "18:10:00",
      },
    ],
  },
  {
    id: "FR9604",
    type: "train",
    stops: [
      {
        station: 8300048,
        arrival: "06:42:00",
        departure: "06:42:00",
      },
      {
        station: 8300046,
        arrival: "07:20:00",
        departure: "07:30:00",
      },
      {
        station: 8300418,
        arrival: "07:38:00",
        departure: "07:40:00",
      },
      {
        station: 8300263,
        arrival: "10:40:00",
        departure: "10:53:00",
      },
      {
        station: 8309988,
        arrival: "11:48:00",
        departure: "11:50:00",
      },
      {
        station: 8300239,
        arrival: "12:06:00",
        departure: "12:06:00",
      },
    ],
  },
  {
    id: "FR9643",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "15:25:00",
        departure: "15:25:00",
      },
      {
        station: 8300418,
        arrival: "15:36:00",
        departure: "15:38:00",
      },
      {
        station: 8300217,
        arrival: "16:34:00",
        departure: "16:37:00",
      },
      {
        station: 8300263,
        arrival: "18:40:00",
        departure: "18:53:00",
      },
      {
        station: 8309988,
        arrival: "19:48:00",
        departure: "19:50:00",
      },
      {
        station: 8300239,
        arrival: "20:06:00",
        departure: "20:06:00",
      },
    ],
  },
  {
    id: "FR9625",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "11:25:00",
        departure: "11:25:00",
      },
      {
        station: 8300418,
        arrival: "11:36:00",
        departure: "11:38:00",
      },
      {
        station: 8300217,
        arrival: "12:34:00",
        departure: "12:37:00",
      },
      {
        station: 8300263,
        arrival: "14:43:00",
        departure: "14:53:00",
      },
      {
        station: 8309988,
        arrival: "15:48:00",
        departure: "15:50:00",
      },
      {
        station: 8300239,
        arrival: "16:06:00",
        departure: "16:06:00",
      },
    ],
  },
  {
    id: "FR9653",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "18:00:00",
        departure: "18:00:00",
      },
      {
        station: 8300217,
        arrival: "19:04:00",
        departure: "19:07:00",
      },
      {
        station: 8300263,
        arrival: "21:10:00",
        departure: "21:25:00",
      },
      {
        station: 8300239,
        arrival: "22:33:00",
        departure: "22:45:00",
      },
      {
        station: 8300269,
        arrival: "23:22:00",
        departure: "23:22:00",
      },
    ],
  },
  {
    id: "FR9657",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "18:30:00",
        departure: "18:30:00",
      },
      {
        station: 8300217,
        arrival: "19:34:00",
        departure: "19:37:00",
      },
      {
        station: 8300263,
        arrival: "21:40:00",
        departure: "21:53:00",
      },
      {
        station: 8309988,
        arrival: "22:48:00",
        departure: "22:50:00",
      },
      {
        station: 8300239,
        arrival: "23:06:00",
        departure: "23:06:00",
      },
    ],
  },
  {
    id: "FR9661",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "19:00:00",
        departure: "19:00:00",
      },
      {
        station: 8300217,
        arrival: "20:04:00",
        departure: "20:07:00",
      },
      {
        station: 8300263,
        arrival: "22:10:00",
        departure: "22:26:00",
      },
      {
        station: 8300239,
        arrival: "23:31:00",
        departure: "23:31:00",
      },
    ],
  },
  {
    id: "FR9627",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "11:58:00",
        departure: "11:58:00",
      },
      {
        station: 8300217,
        arrival: "13:04:00",
        departure: "13:07:00",
      },
      {
        station: 8300263,
        arrival: "15:10:00",
        departure: "15:25:00",
      },
      {
        station: 8300239,
        arrival: "16:36:00",
        departure: "16:36:00",
      },
    ],
  },
  {
    id: "FR9645",
    type: "train",
    stops: [
      {
        station: 8300001,
        arrival: "14:50:00",
        departure: "14:50:00",
      },
      {
        station: 8300522,
        arrival: "14:58:00",
        departure: "15:00:00",
      },
      {
        station: 8300046,
        arrival: "15:50:00",
        departure: "16:00:00",
      },
      {
        station: 8300217,
        arrival: "17:04:00",
        departure: "17:07:00",
      },
      {
        station: 8300263,
        arrival: "19:10:00",
        departure: "19:10:00",
      },
    ],
  },
  {
    id: "FR9605",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "06:35:00",
        departure: "06:35:00",
      },
      {
        station: 8300263,
        arrival: "09:34:00",
        departure: "09:53:00",
      },
      {
        station: 8309988,
        arrival: "10:51:00",
        departure: "10:53:00",
      },
      {
        station: 8300239,
        arrival: "11:06:00",
        departure: "11:06:00",
      },
    ],
  },
  {
    id: "FR9647",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "16:30:00",
        departure: "16:30:00",
      },
      {
        station: 8300418,
        arrival: "16:38:00",
        departure: "16:40:00",
      },
      {
        station: 8300263,
        arrival: "19:40:00",
        departure: "19:53:00",
      },
      {
        station: 8300244,
        arrival: "21:06:00",
        departure: "21:08:00",
      },
      {
        station: 8300243,
        arrival: "21:55:00",
        departure: "21:57:00",
      },
      {
        station: 8300287,
        arrival: "22:56:00",
        departure: "22:56:00",
      },
    ],
  },
  {
    id: "FR9615",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "08:58:00",
        departure: "08:58:00",
      },
      {
        station: 8300217,
        arrival: "10:04:00",
        departure: "10:07:00",
      },
      {
        station: 8300263,
        arrival: "12:10:00",
        departure: "12:10:00",
      },
    ],
  },
  {
    id: "FR9619",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "09:58:00",
        departure: "09:58:00",
      },
      {
        station: 8300217,
        arrival: "11:04:00",
        departure: "11:07:00",
      },
      {
        station: 8300263,
        arrival: "13:10:00",
        departure: "13:25:00",
      },
      {
        station: 8300239,
        arrival: "14:36:00",
        departure: "14:36:00",
      },
    ],
  },
  {
    id: "FR9631",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "13:00:00",
        departure: "13:00:00",
      },
      {
        station: 8300217,
        arrival: "14:04:00",
        departure: "14:07:00",
      },
      {
        station: 8300262,
        arrival: "16:04:00",
        departure: "16:07:00",
      },
      {
        station: 8300263,
        arrival: "16:15:00",
        departure: "16:25:00",
      },
      {
        station: 8300239,
        arrival: "17:33:00",
        departure: "17:33:00",
      },
    ],
  },
  {
    id: "FR9611",
    type: "train",
    stops: [
      {
        station: 8300001,
        arrival: "06:50:00",
        departure: "06:50:00",
      },
      {
        station: 8300522,
        arrival: "06:58:00",
        departure: "07:00:00",
      },
      {
        station: 8300046,
        arrival: "07:50:00",
        departure: "08:00:00",
      },
      {
        station: 8300217,
        arrival: "09:04:00",
        departure: "09:07:00",
      },
      {
        station: 8300263,
        arrival: "11:10:00",
        departure: "11:25:00",
      },
      {
        station: 8300239,
        arrival: "12:36:00",
        departure: "12:36:00",
      },
    ],
  },
  {
    id: "FR9535",
    type: "train",
    stops: [
      {
        station: 8300001,
        arrival: "11:00:00",
        departure: "11:00:00",
      },
      {
        station: 8300522,
        arrival: "11:08:00",
        departure: "11:10:00",
      },
      {
        station: 8300046,
        arrival: "12:02:00",
        departure: "12:10:00",
      },
      {
        station: 8300418,
        arrival: "12:18:00",
        departure: "12:20:00",
      },
      {
        station: 8305254,
        arrival: "12:54:00",
        departure: "12:56:00",
      },
      {
        station: 8300217,
        arrival: "13:24:00",
        departure: "13:27:00",
      },
      {
        station: 8300151,
        arrival: "14:04:00",
        departure: "14:14:00",
      },
      {
        station: 8300262,
        arrival: "15:40:00",
        departure: "15:43:00",
      },
      {
        station: 8300263,
        arrival: "15:49:00",
        departure: "16:00:00",
      },
      {
        station: 8309988,
        arrival: "16:56:00",
        departure: "16:58:00",
      },
      {
        station: 8300239,
        arrival: "17:12:00",
        departure: "17:12:00",
      },
    ],
  },
  {
    id: "FR9681",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "20:35:00",
        departure: "20:35:00",
      },
      {
        station: 8300263,
        arrival: "23:25:00",
        departure: "23:25:00",
      },
    ],
  },
  {
    id: "FR9633",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "13:30:00",
        departure: "13:30:00",
      },
      {
        station: 8300418,
        arrival: "13:38:00",
        departure: "13:40:00",
      },
      {
        station: 8300263,
        arrival: "16:40:00",
        departure: "16:53:00",
      },
      {
        station: 8309988,
        arrival: "17:49:00",
        departure: "17:51:00",
      },
      {
        station: 8300239,
        arrival: "18:06:00",
        departure: "18:06:00",
      },
    ],
  },
  {
    id: "FR9613",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "08:30:00",
        departure: "08:30:00",
      },
      {
        station: 8300217,
        arrival: "09:34:00",
        departure: "09:37:00",
      },
      {
        station: 8300263,
        arrival: "11:40:00",
        departure: "11:55:00",
      },
      {
        station: 8309988,
        arrival: "12:50:00",
        departure: "12:52:00",
      },
      {
        station: 8300239,
        arrival: "13:13:00",
        departure: "13:13:00",
      },
    ],
  },
  {
    id: "FR9639",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "14:30:00",
        departure: "14:30:00",
      },
      {
        station: 8300217,
        arrival: "15:34:00",
        departure: "15:37:00",
      },
      {
        station: 8300263,
        arrival: "17:40:00",
        departure: "17:53:00",
      },
      {
        station: 8309988,
        arrival: "18:48:00",
        departure: "18:50:00",
      },
      {
        station: 8300269,
        arrival: "19:19:00",
        departure: "19:21:00",
      },
      {
        station: 8300335,
        arrival: "21:15:00",
        departure: "21:17:00",
      },
      {
        station: 8300328,
        arrival: "21:44:00",
        departure: "21:47:00",
      },
      {
        station: 8300430,
        arrival: "22:15:00",
        departure: "22:17:00",
      },
      {
        station: 8300342,
        arrival: "22:46:00",
        departure: "22:49:00",
      },
      {
        station: 8300337,
        arrival: "23:09:00",
        departure: "23:09:00",
      },
    ],
  },
  {
    id: "FR9637",
    type: "train",
    stops: [
      {
        station: 8300046,
        arrival: "13:58:00",
        departure: "13:58:00",
      },
      {
        station: 8300217,
        arrival: "15:04:00",
        departure: "15:07:00",
      },
      {
        station: 8300263,
        arrival: "17:10:00",
        departure: "17:25:00",
      },
      {
        station: 8300239,
        arrival: "18:36:00",
        departure: "18:36:00",
      },
    ],
  },
  {
    id: "ICE73",
    type: "train",
    stops: [
      {
        station: 8011160,
        arrival: "07:26:00",
        departure: "07:26:00",
      },
      {
        station: 8011113,
        arrival: "07:31:00",
        departure: "07:33:00",
      },
      {
        station: 8010222,
        arrival: "08:09:00",
        departure: "08:10:00",
      },
      {
        station: 8010205,
        arrival: "08:42:00",
        departure: "08:48:00",
      },
      {
        station: 8010101,
        arrival: "09:28:00",
        departure: "09:30:00",
      },
      {
        station: 8010097,
        arrival: "09:55:00",
        departure: "09:56:00",
      },
      {
        station: 8000115,
        arrival: "10:48:00",
        departure: "10:50:00",
      },
      {
        station: 8000105,
        arrival: "11:44:00",
        departure: "11:52:00",
      },
      {
        station: 8000068,
        arrival: "12:07:00",
        departure: "12:09:00",
      },
      {
        station: 8000191,
        arrival: "13:09:00",
        departure: "13:11:00",
      },
      {
        station: 8000774,
        arrival: "13:26:00",
        departure: "13:27:00",
      },
      {
        station: 8000107,
        arrival: "14:12:00",
        departure: "14:14:00",
      },
      {
        station: 8000026,
        arrival: "14:46:00",
        departure: "14:48:00",
      },
      {
        station: 8500010,
        arrival: "14:55:00",
        departure: "15:06:00",
      },
      {
        station: 8503000,
        arrival: "16:00:00",
        departure: "16:00:00",
      },
    ],
  },
  {
    id: "ICE79",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "13:16:00",
        departure: "13:16:00",
      },
      {
        station: 8011160,
        arrival: "13:21:00",
        departure: "13:26:00",
      },
      {
        station: 8011113,
        arrival: "13:31:00",
        departure: "13:33:00",
      },
      {
        station: 8010222,
        arrival: "14:09:00",
        departure: "14:10:00",
      },
      {
        station: 8010205,
        arrival: "14:42:00",
        departure: "14:48:00",
      },
      {
        station: 8010101,
        arrival: "15:28:00",
        departure: "15:30:00",
      },
      {
        station: 8010097,
        arrival: "15:54:00",
        departure: "15:55:00",
      },
      {
        station: 8000115,
        arrival: "16:48:00",
        departure: "16:50:00",
      },
      {
        station: 8000105,
        arrival: "17:44:00",
        departure: "17:52:00",
      },
      {
        station: 8000068,
        arrival: "18:07:00",
        departure: "18:09:00",
      },
      {
        station: 8000191,
        arrival: "19:09:00",
        departure: "19:11:00",
      },
      {
        station: 8000774,
        arrival: "19:26:00",
        departure: "19:27:00",
      },
      {
        station: 8000107,
        arrival: "20:12:00",
        departure: "20:14:00",
      },
      {
        station: 8000026,
        arrival: "20:46:00",
        departure: "20:48:00",
      },
      {
        station: 8500010,
        arrival: "20:55:00",
        departure: "21:06:00",
      },
      {
        station: 8503000,
        arrival: "22:00:00",
        departure: "22:00:00",
      },
    ],
  },
  {
    id: "ICE75",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "09:15:00",
        departure: "09:15:00",
      },
      {
        station: 8011160,
        arrival: "09:21:00",
        departure: "09:26:00",
      },
      {
        station: 8011113,
        arrival: "09:31:00",
        departure: "09:33:00",
      },
      {
        station: 8010222,
        arrival: "10:09:00",
        departure: "10:10:00",
      },
      {
        station: 8010205,
        arrival: "10:42:00",
        departure: "10:48:00",
      },
      {
        station: 8010101,
        arrival: "11:28:00",
        departure: "11:30:00",
      },
      {
        station: 8010097,
        arrival: "11:54:00",
        departure: "11:55:00",
      },
      {
        station: 8000115,
        arrival: "12:48:00",
        departure: "12:50:00",
      },
      {
        station: 8000105,
        arrival: "13:44:00",
        departure: "13:52:00",
      },
      {
        station: 8000068,
        arrival: "14:08:00",
        departure: "14:10:00",
      },
      {
        station: 8000191,
        arrival: "15:09:00",
        departure: "15:11:00",
      },
      {
        station: 8000774,
        arrival: "15:26:00",
        departure: "15:27:00",
      },
      {
        station: 8000107,
        arrival: "16:12:00",
        departure: "16:14:00",
      },
      {
        station: 8000026,
        arrival: "16:46:00",
        departure: "16:48:00",
      },
      {
        station: 8500010,
        arrival: "16:55:00",
        departure: "17:06:00",
      },
      {
        station: 8503000,
        arrival: "18:00:00",
        departure: "18:00:00",
      },
    ],
  },
  {
    id: "ICE77",
    type: "train",
    stops: [
      {
        station: 8011102,
        arrival: "11:16:00",
        departure: "11:16:00",
      },
      {
        station: 8011160,
        arrival: "11:21:00",
        departure: "11:26:00",
      },
      {
        station: 8011113,
        arrival: "11:31:00",
        departure: "11:33:00",
      },
      {
        station: 8010222,
        arrival: "12:09:00",
        departure: "12:10:00",
      },
      {
        station: 8010205,
        arrival: "12:42:00",
        departure: "12:48:00",
      },
      {
        station: 8010101,
        arrival: "13:28:00",
        departure: "13:30:00",
      },
      {
        station: 8010097,
        arrival: "13:55:00",
        departure: "13:56:00",
      },
      {
        station: 8000115,
        arrival: "14:48:00",
        departure: "14:50:00",
      },
      {
        station: 8000105,
        arrival: "15:44:00",
        departure: "15:52:00",
      },
      {
        station: 8000068,
        arrival: "16:08:00",
        departure: "16:10:00",
      },
      {
        station: 8000191,
        arrival: "17:09:00",
        departure: "17:11:00",
      },
      {
        station: 8000774,
        arrival: "17:26:00",
        departure: "17:27:00",
      },
      {
        station: 8000107,
        arrival: "18:12:00",
        departure: "18:14:00",
      },
      {
        station: 8000026,
        arrival: "18:46:00",
        departure: "18:48:00",
      },
      {
        station: 8500010,
        arrival: "18:55:00",
        departure: "19:06:00",
      },
      {
        station: 8503000,
        arrival: "20:00:00",
        departure: "20:00:00",
      },
    ],
  },
  {
    id: "EC315",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "09:33:00",
        departure: "09:33:00",
      },
      {
        station: 8502204,
        arrival: "09:59:00",
        departure: "10:00:00",
      },
      {
        station: 8505004,
        arrival: "10:16:00",
        departure: "10:18:00",
      },
      {
        station: 8505213,
        arrival: "11:12:00",
        departure: "11:14:00",
      },
      {
        station: 8505300,
        arrival: "11:28:00",
        departure: "11:30:00",
      },
      {
        station: 8505307,
        arrival: "11:55:00",
        departure: "12:02:00",
      },
      {
        station: 8300056,
        arrival: "12:08:00",
        departure: "12:10:00",
      },
      {
        station: 8300046,
        arrival: "12:53:00",
        departure: "12:53:00",
      },
    ],
  },
  {
    id: "ECE151",
    type: "train",
    stops: [
      {
        station: 8000105,
        arrival: "07:52:00",
        departure: "07:52:00",
      },
      {
        station: 8000068,
        arrival: "08:07:00",
        departure: "08:09:00",
      },
      {
        station: 8000191,
        arrival: "09:09:00",
        departure: "09:11:00",
      },
      {
        station: 8005101,
        arrival: "09:56:00",
        departure: "09:58:00",
      },
      {
        station: 8000107,
        arrival: "10:13:00",
        departure: "10:15:00",
      },
      {
        station: 8000026,
        arrival: "10:45:00",
        departure: "10:47:00",
      },
      {
        station: 8500010,
        arrival: "10:55:00",
        departure: "11:06:00",
      },
      {
        station: 8503000,
        arrival: "12:00:00",
        departure: "12:33:00",
      },
      {
        station: 8502204,
        arrival: "12:59:00",
        departure: "13:00:00",
      },
      {
        station: 8505004,
        arrival: "13:16:00",
        departure: "13:18:00",
      },
      {
        station: 8505213,
        arrival: "14:12:00",
        departure: "14:14:00",
      },
      {
        station: 8505300,
        arrival: "14:28:00",
        departure: "14:30:00",
      },
      {
        station: 8505307,
        arrival: "14:55:00",
        departure: "15:02:00",
      },
      {
        station: 8300056,
        arrival: "15:08:00",
        departure: "15:10:00",
      },
      {
        station: 8300046,
        arrival: "15:53:00",
        departure: "15:53:00",
      },
    ],
  },
  {
    id: "EC327",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "10:33:00",
        departure: "10:33:00",
      },
      {
        station: 8502204,
        arrival: "10:59:00",
        departure: "11:00:00",
      },
      {
        station: 8505004,
        arrival: "11:16:00",
        departure: "11:18:00",
      },
      {
        station: 8505213,
        arrival: "12:12:00",
        departure: "12:14:00",
      },
      {
        station: 8505300,
        arrival: "12:28:00",
        departure: "12:30:00",
      },
      {
        station: 8505307,
        arrival: "12:55:00",
        departure: "13:02:00",
      },
      {
        station: 8300056,
        arrival: "13:08:00",
        departure: "13:10:00",
      },
      {
        station: 8300062,
        arrival: "14:09:00",
        departure: "14:11:00",
      },
      {
        station: 8300418,
        arrival: "14:18:00",
        departure: "14:20:00",
      },
      {
        station: 8300049,
        arrival: "14:39:00",
        departure: "14:41:00",
      },
      {
        station: 8300029,
        arrival: "15:11:00",
        departure: "15:13:00",
      },
      {
        station: 8300153,
        arrival: "15:52:00",
        departure: "15:52:00",
      },
    ],
  },
  {
    id: "EC321",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "15:33:00",
        departure: "15:33:00",
      },
      {
        station: 8502204,
        arrival: "15:59:00",
        departure: "16:00:00",
      },
      {
        station: 8505004,
        arrival: "16:16:00",
        departure: "16:18:00",
      },
      {
        station: 8505213,
        arrival: "17:12:00",
        departure: "17:14:00",
      },
      {
        station: 8505300,
        arrival: "17:28:00",
        departure: "17:30:00",
      },
      {
        station: 8505307,
        arrival: "17:55:00",
        departure: "18:02:00",
      },
      {
        station: 8300056,
        arrival: "18:08:00",
        departure: "18:10:00",
      },
      {
        station: 8300046,
        arrival: "18:53:00",
        departure: "18:53:00",
      },
    ],
  },
  {
    id: "EC323",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "17:33:00",
        departure: "17:33:00",
      },
      {
        station: 8502204,
        arrival: "17:59:00",
        departure: "18:00:00",
      },
      {
        station: 8505004,
        arrival: "18:16:00",
        departure: "18:18:00",
      },
      {
        station: 8505213,
        arrival: "19:12:00",
        departure: "19:14:00",
      },
      {
        station: 8505300,
        arrival: "19:28:00",
        departure: "19:30:00",
      },
      {
        station: 8505307,
        arrival: "19:55:00",
        departure: "20:02:00",
      },
      {
        station: 8300056,
        arrival: "20:08:00",
        departure: "20:10:00",
      },
      {
        station: 8300046,
        arrival: "20:53:00",
        departure: "20:53:00",
      },
    ],
  },
  {
    id: "EC313",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "07:33:00",
        departure: "07:33:00",
      },
      {
        station: 8502204,
        arrival: "07:59:00",
        departure: "08:00:00",
      },
      {
        station: 8505004,
        arrival: "08:16:00",
        departure: "08:18:00",
      },
      {
        station: 8505213,
        arrival: "09:12:00",
        departure: "09:14:00",
      },
      {
        station: 8505300,
        arrival: "09:28:00",
        departure: "09:30:00",
      },
      {
        station: 8505307,
        arrival: "09:55:00",
        departure: "10:02:00",
      },
      {
        station: 8300056,
        arrival: "10:08:00",
        departure: "10:10:00",
      },
      {
        station: 8300046,
        arrival: "10:53:00",
        departure: "10:53:00",
      },
    ],
  },
  {
    id: "EC307",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "06:33:00",
        departure: "06:33:00",
      },
      {
        station: 8502204,
        arrival: "06:59:00",
        departure: "07:00:00",
      },
      {
        station: 8505004,
        arrival: "07:16:00",
        departure: "07:18:00",
      },
      {
        station: 8505213,
        arrival: "08:12:00",
        departure: "08:14:00",
      },
      {
        station: 8505300,
        arrival: "08:28:00",
        departure: "08:30:00",
      },
      {
        station: 8505307,
        arrival: "08:55:00",
        departure: "09:02:00",
      },
      {
        station: 8300056,
        arrival: "09:08:00",
        departure: "09:10:00",
      },
      {
        station: 8300062,
        arrival: "10:09:00",
        departure: "10:11:00",
      },
      {
        station: 8300418,
        arrival: "10:20:00",
        departure: "10:22:00",
      },
      {
        station: 8300230,
        arrival: "10:59:00",
        departure: "11:01:00",
      },
      {
        station: 8300215,
        arrival: "11:31:00",
        departure: "11:33:00",
      },
      {
        station: 8300220,
        arrival: "11:49:00",
        departure: "11:51:00",
      },
      {
        station: 8300214,
        arrival: "12:07:00",
        departure: "12:09:00",
      },
      {
        station: 8300217,
        arrival: "12:30:00",
        departure: "12:30:00",
      },
    ],
  },
  {
    id: "EC311",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "08:33:00",
        departure: "08:33:00",
      },
      {
        station: 8502204,
        arrival: "08:59:00",
        departure: "09:00:00",
      },
      {
        station: 8505004,
        arrival: "09:16:00",
        departure: "09:18:00",
      },
      {
        station: 8505213,
        arrival: "10:12:00",
        departure: "10:14:00",
      },
      {
        station: 8505300,
        arrival: "10:28:00",
        departure: "10:30:00",
      },
      {
        station: 8505307,
        arrival: "10:55:00",
        departure: "11:02:00",
      },
      {
        station: 8300056,
        arrival: "11:08:00",
        departure: "11:10:00",
      },
      {
        station: 8300046,
        arrival: "11:53:00",
        departure: "12:05:00",
      },
      {
        station: 8300048,
        arrival: "12:51:00",
        departure: "12:53:00",
      },
      {
        station: 8300124,
        arrival: "13:12:00",
        departure: "13:14:00",
      },
      {
        station: 8300120,
        arrival: "13:28:00",
        departure: "13:30:00",
      },
      {
        station: 8300126,
        arrival: "13:55:00",
        departure: "13:57:00",
      },
      {
        station: 8300098,
        arrival: "14:14:00",
        departure: "14:16:00",
      },
      {
        station: 8300093,
        arrival: "14:30:00",
        departure: "14:32:00",
      },
      {
        station: 8300094,
        arrival: "14:42:00",
        departure: "14:42:00",
      },
    ],
  },
  {
    id: "EC319",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "13:33:00",
        departure: "13:33:00",
      },
      {
        station: 8502204,
        arrival: "13:59:00",
        departure: "14:00:00",
      },
      {
        station: 8505004,
        arrival: "14:16:00",
        departure: "14:18:00",
      },
      {
        station: 8505213,
        arrival: "15:12:00",
        departure: "15:14:00",
      },
      {
        station: 8505300,
        arrival: "15:28:00",
        departure: "15:30:00",
      },
      {
        station: 8505307,
        arrival: "15:55:00",
        departure: "16:02:00",
      },
      {
        station: 8300056,
        arrival: "16:08:00",
        departure: "16:10:00",
      },
      {
        station: 8300046,
        arrival: "16:53:00",
        departure: "16:53:00",
      },
    ],
  },
  {
    id: "EC325",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "19:33:00",
        departure: "19:33:00",
      },
      {
        station: 8502204,
        arrival: "19:59:00",
        departure: "20:00:00",
      },
      {
        station: 8505004,
        arrival: "20:16:00",
        departure: "20:18:00",
      },
      {
        station: 8505213,
        arrival: "21:12:00",
        departure: "21:14:00",
      },
      {
        station: 8505300,
        arrival: "21:28:00",
        departure: "21:30:00",
      },
      {
        station: 8505307,
        arrival: "21:55:00",
        departure: "22:02:00",
      },
      {
        station: 8300056,
        arrival: "22:08:00",
        departure: "22:10:00",
      },
      {
        station: 8300046,
        arrival: "22:53:00",
        departure: "22:53:00",
      },
    ],
  },
  {
    id: "EC317",
    type: "train",
    stops: [
      {
        station: 8503000,
        arrival: "11:33:00",
        departure: "11:33:00",
      },
      {
        station: 8502204,
        arrival: "11:59:00",
        departure: "12:00:00",
      },
      {
        station: 8505004,
        arrival: "12:16:00",
        departure: "12:18:00",
      },
      {
        station: 8505213,
        arrival: "13:12:00",
        departure: "13:14:00",
      },
      {
        station: 8505300,
        arrival: "13:28:00",
        departure: "13:30:00",
      },
      {
        station: 8505307,
        arrival: "13:55:00",
        departure: "14:02:00",
      },
      {
        station: 8300056,
        arrival: "14:08:00",
        departure: "14:10:00",
      },
      {
        station: 8300046,
        arrival: "14:53:00",
        departure: "14:53:00",
      },
    ],
  },
];
