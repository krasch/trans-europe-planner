function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  for (let selector in templateData) {
    const children = element.querySelectorAll(selector);

    for (let child of children) {
      for (let key in templateData[selector]) {
        child[key] = templateData[selector][key];
      }
    }
  }

  return element;
}

class InvalidDatetimeFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = "InvalidDateTimeFormat";
  }
}

class CustomDateTime {
  constructor(dateString, timeString) {
    // todo error when wrongly formatted?
    // todo should not have to do this anyway, should export proper timezoned datetimes
    this.datetime = new Date(dateString + " " + timeString);

    if (this.datetime.getSeconds() !== 0)
      throw new InvalidDatetimeFormatError(
        `Seconds not allowed in time format: ${timeString}, ${this.datetime}`,
      );
  }

  get dateString() {
    return this.datetime.toISOString().slice(0, 10);
  }

  get timeString() {
    const hours = this.datetime.getHours().toString();
    const minutes = this.datetime.getMinutes().toString();
    return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
  }

  get minutesSinceMidnight() {
    const hours = this.datetime.getHours();
    const minutes = this.datetime.getMinutes();
    return hours * 60 + minutes;
  }

  minutesSince(other) {
    const diffMilliseconds = this.datetime - other.datetime;
    // floor should not be necessary, value should be whole number anyway because we disallow seconds
    return Math.floor(diffMilliseconds / 1000.0 / 60.0);
  }

  daysSince(dateString) {
    const other = new CustomDateTime(dateString, "00:00:00");
    const diffMilliseconds = this.datetime - other.datetime;
    return Math.floor(diffMilliseconds / 1000.0 / 60.0 / 60.0 / 24.0);
  }

  humanReadableSince(other) {
    let minutes = this.minutesSince(other);
    if (minutes < 0)
      throw Error("Can't do human-redable since with negative diff");

    const days = Math.floor(minutes / (60 * 24));
    minutes = minutes - days * (60 * 24);

    const hours = Math.floor(minutes / 60);
    minutes = minutes - hours * 60;

    let daysString = "";
    if (days > 0) daysString = `${days}d`;

    let hoursString = "";
    if (hours > 0) hoursString = `${hours}h`;

    let minutesString = "";
    if (minutes > 0) minutesString = `${minutes}min`;

    const result = [daysString, hoursString, minutesString];
    return result.filter((e) => e.length > 0).join(" ");
  }
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.CustomDateTime = CustomDateTime;
  module.exports.InvalidDatetimeFormatError = InvalidDatetimeFormatError;
}
