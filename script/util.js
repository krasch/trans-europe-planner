function createElementFromTemplate(templateId){

    const template = document.getElementById(templateId);

    // create new element by cloning template
    const element = template.content.firstElementChild.cloneNode(true);

    return element;
}

// https://stackoverflow.com/a/10893658
function timeStringToFloat(time) {
    const hoursMinutes = time.split(":");
    const hours = parseInt(hoursMinutes[0], 10);
    const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
    return hours + minutes / 60;
}

function differenceInDays(earlierDate, laterDate){
    const diffMilliseconds = laterDate - earlierDate;
    const diffDays = diffMilliseconds / 1000.0 / 60.0 / 60.0 / 24.0;
    return diffDays; // todo rounding or assert that no hours
}