export async function showLandingPage(modal) {
  const select = modal.querySelector("form select");

  const fromSelectedPromise = new Promise((resolve) =>
    modal.addEventListener("close", (e) => {
      resolve(select.value);
    }),
  );

  // modal will be automagically closed when user clicks the submit button
  modal.show();

  return fromSelectedPromise;
}
