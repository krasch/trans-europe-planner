function createElementFromTemplate(templateId, templateData) {
  const template = document.getElementById(templateId);

  // create new element by cloning template
  const element = template.content.firstElementChild.cloneNode(true);

  // fill in data
  for (let className in templateData) {
    const children = element.getElementsByClassName(className);

    for (let child of children) {
      for (let key in templateData[className]) {
        child[key] = templateData[className][key];
      }
    }
  }

  return element;
}

// https://stackoverflow.com/a/10893658
function timeStringToFloat(time) {
  const hoursMinutes = time.split(":");
  const hours = parseInt(hoursMinutes[0], 10);
  const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
  return hours + minutes / 60;
}

function differenceInDays(earlierDate, laterDate) {
  const diffMilliseconds = laterDate - earlierDate;
  const diffDays = diffMilliseconds / 1000.0 / 60.0 / 60.0 / 24.0;
  return diffDays; // todo rounding or assert that no hours
}

function differenceInHours(earlierTime, laterTime) {
  const earlier = new Date("01/01/2007 " + earlierTime);
  const later = new Date("01/01/2007 " + laterTime);

  return later.getHours() - earlier.getHours();
}

// exports for testing only (NODE_ENV='test' is automatically set by jest)
if (typeof process === "object" && process.env.NODE_ENV === "test") {
  module.exports.differenceInDays = differenceInDays;
}
