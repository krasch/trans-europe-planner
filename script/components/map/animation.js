function animateDropWithBounce(
  map,
  markers,
  initialHeightPixels,
  bounciness,
  callback,
) {
  const speedup = 1.5;

  // don't start higher than top of screen
  //marker.addTo(map); // must be added to map to get y pos
  //initialHeightPixels = Math.min(initialHeightPixels, marker._pos.y);

  const animationStart = document.timeline.currentTime;
  let previousHeight = 1000;

  function update(timestamp) {
    const secondsSinceStart = (timestamp - animationStart) / 1000.0;
    const x = secondsSinceStart * speedup;

    // https://gamedev.stackexchange.com/a/137185
    const height = Math.floor(
      Math.exp(-x) * Math.abs(initialHeightPixels * Math.cos(bounciness * x)),
    );

    for (let m of markers) {
      m.setOffset([0, -height]);
      m.addTo(map);
    }

    // no more changes happening, can stop the animation
    if (height < 1 && previousHeight < 1) {
      if (callback) callback();
      return;
    }

    previousHeight = height;
    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}
