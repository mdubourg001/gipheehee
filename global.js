import {
  GIPHY_SEARCH_API_ENDPOINT,
  GIPHY_DEV_API_KEY,
  SEARCHBAR_DEBOUNCE_DELAY,
  Debouncer
} from "./utils";

/* ======== GLOBALS ======= */

// usefull not to fetch Giphy API on each keystoke
const searchbarDebounce = new Debouncer((event, gifsWrapper) => {
  fetch(
    `${GIPHY_SEARCH_API_ENDPOINT}?api_key=${GIPHY_DEV_API_KEY}&q=${event.target.value}`
  ).then(response => {
    while (gifsWrapper.firstChild)
      gifsWrapper.removeChild(gifsWrapper.firstChild);

    if (response.ok) {
      response.json().then(({ data }) => {
        let newGif = null;
        for (let row of data) {
          newGif = document.createElement("img");
          newGif.src = row.images.fixed_width.url;
          newGif.alt = row.title;
          newGif.className = "gif";
          gifsWrapper.appendChild(newGif);
        }
      });
    } else {
      // TODO HANDLE GIPHY ERRORS
    }
  });
}, SEARCHBAR_DEBOUNCE_DELAY);

/* ======== EVENT HANDLERS ======= */

const handleSearchbarInput = (
  event,
  searchbarCrossHTMLElement,
  gifsWrapperHTMLElement
) => {
  if (event.target.value.length === 0)
    searchbarCrossHTMLElement.classList.add("hidden");
  else searchbarCrossHTMLElement.classList.remove("hidden");

  if (event.target.value.length > 0)
    searchbarDebounce.call(event, gifsWrapperHTMLElement);
  // clears displayed GIFs
  else
    while (gifsWrapperHTMLElement.firstChild)
      gifsWrapperHTMLElement.removeChild(gifsWrapperHTMLElement.firstChild);

  // TODO IMPLEMENT HREF UPDATE
};

const handleSearchbarCrossClick = (event, searchbarInputHTMLElement) => {
  searchbarInputHTMLElement.value = "";
  event.target.classList.add("hidden");
};

window.onload = () => {
  const searchbarInput = document.getElementById("searchbar-input");
  const searchbarCross = document.getElementById("searchbar-cross");

  const gifsWrapper = document.getElementById("gifs-wrapper");

  /* ======== SEARCHBAR ELISTENERS ======= */

  // loads GIFs, updates browser href and manage cross icon display
  searchbarInput.addEventListener("input", event =>
    handleSearchbarInput(event, searchbarCross, gifsWrapper)
  );

  searchbarCross.addEventListener("click", event =>
    handleSearchbarCrossClick(event, searchbarInput)
  );
};
