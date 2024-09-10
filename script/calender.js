function initGrid(container){
    const days = [1, 2, 3];
    const hours =  [...Array(24).keys()];  // [0, 1, ..., 23]

    for (let hour in hours){
        for (let day in days){
            const cell = createElementWithId("div", `day${day}-hour${hour}`);
            container.appendChild(cell)
        }
    }
}

function addRoute(container){

}