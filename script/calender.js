function drawBoard(canvas){
    const ctx = canvas.getContext("2d");

    const scaleX = canvas.width / 300.0;  // 3 columns with 100 px each
    const scaleY = canvas.height / (60.0 * 24) // 1 = 1 minute
    //ctx.scale(scaleX, scaleY);

    ctx.lineWidth = 3;
    ctx.strokeStyle = "lightgray";


    const hours = [...Array(24).keys()];
    for (let i in hours){
        const left = 0;
        const top = i * 60;
        ctx.moveTo(0, 0);
        ctx.lineTo(100, 100);
        break;

        /*context.moveTo(0.5 + x + p, p);
        ctx.strokeRect(0, i*60, 100, 60);*/
    }


    /*for (var x = 0; x <= bw; x += 40) {
        context.moveTo(0.5 + x + p, p);
        context.lineTo(0.5 + x + p, bh + p);
    }

    for (var x = 0; x <= bh; x += 40) {
        context.moveTo(p, 0.5 + x + p);
        context.lineTo(bw + p, 0.5 + x + p);
    }*/

    //ctx.moveTo(0, 100);
    //ctx.lineTo(100, 100);
}

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