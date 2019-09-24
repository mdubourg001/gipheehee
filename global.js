/* ======== UTILS ======= */

const hideSearchbarLoader = (searchbarMGlass, searchbarLoader) => {
  searchbarMGlass.classList.remove("hidden");
  searchbarLoader.classList.add("hidden");
};
const showSearchbarLoader = (searchbarMGlass, searchbarLoader) => {
  searchbarMGlass.classList.add("hidden");
  searchbarLoader.classList.remove("hidden");
};
const hideSearchbarCross = searchbarCross => {
  searchbarCross.classList.add("hidden");
};
const showSearchbarCross = searchbarCross => {
  searchbarCross.classList.remove("hidden");
};

const hideGifsWrapper = gifsWrapper => {
  gifsWrapper.classList.remove("flex");
  gifsWrapper.classList.add("hidden");
};
const showGifsWrapper = gifsWrapper => {
  gifsWrapper.classList.remove("hidden");
  gifsWrapper.classList.add("flex");
};
const emptyGifsWrapper = gifsWrapper => {
  const gifs = document.getElementsByClassName("gif");
  while (gifs[0]) gifsWrapper.removeChild(gifs[0]);
};

const hideNoGifsWrapper = noGifsWrapper => {
  noGifsWrapper.classList.remove("flex");
  noGifsWrapper.classList.add("hidden");
};
const showNoGifsWrapper = noGifsWrapper => {
  noGifsWrapper.classList.remove("hidden");
  noGifsWrapper.classList.add("flex");
};

/* ======== GLOBALS ======= */

// usefull not to fetch Giphy API on each keystoke
const searchbarDebounce = new Debouncer(
  (event, gifsWrapper, noGifsWrapper, searchbarMGlass, searchbarLoader) => {
    fetch(
      `${GIPHY_SEARCH_API_ENDPOINT}?api_key=${GIPHY_DEV_API_KEY}&q=${event.target.value}`
    ).then(response => {
      if (response.ok) {
        response.json().then(({ data }) => {
          if (data.length > 0) {
            hideNoGifsWrapper(noGifsWrapper);
            showGifsWrapper(gifsWrapper);
            emptyGifsWrapper(gifsWrapper);
            document.getElementById("gifs-count").innerText = data.length;

            let newGif = null;
            for (let row of data) {
              newGif = document.createElement("img");
              newGif.src = row.images.fixed_width.url;
              newGif.alt = row.title;
              newGif.className = "gif";
              gifsWrapper.appendChild(newGif);
            }
          } else {
            hideGifsWrapper(gifsWrapper);
            noGifsWrapper.querySelector(
              "#no-gifs-message"
            ).innerText = `${NO_GIFS_NO_RESULTS_MESSAGE} \"${event.target.value}\".`;
            showNoGifsWrapper(noGifsWrapper);
          }

          hideSearchbarLoader(searchbarMGlass, searchbarLoader);
        });
      } else {
        // TODO HANDLE GIPHY ERRORS
      }
    });
  },
  SEARCHBAR_DEBOUNCE_DELAY
);

/* ======== EVENT HANDLERS ======= */

const handleSearchbarInput = (
  event,
  searchbarMGlassHTMLElement,
  searchbarLoaderHTMLElement,
  searchbarCrossHTMLElement,
  gifsWrapperHTMLElement,
  noGifsWrapperHTMLElement
) => {
  if (event.target.value.length > 0) {
    showSearchbarCross(searchbarCrossHTMLElement);
    showSearchbarLoader(searchbarMGlassHTMLElement, searchbarLoaderHTMLElement);

    searchbarDebounce.call(
      event,
      gifsWrapperHTMLElement,
      noGifsWrapperHTMLElement,
      searchbarMGlassHTMLElement,
      searchbarLoaderHTMLElement
    );
  } else {
    hideSearchbarCross(searchbarCrossHTMLElement);
    hideSearchbarLoader(searchbarMGlassHTMLElement, searchbarLoaderHTMLElement);
    emptyGifsWrapper(gifsWrapperHTMLElement);
    hideGifsWrapper(gifsWrapperHTMLElement);
    noGifsWrapperHTMLElement.querySelector(
      "#no-gifs-message"
    ).innerText = NO_GIFS_SEARCHBAR_EMPTY_MESSAGE;
    showNoGifsWrapper(noGifsWrapperHTMLElement);
  }
  // TODO IMPLEMENT HREF UPDATE

  updateHref(event.target.value);
};

const handleSearchbarCrossClick = (
  _,
  searchbarCrossHTMLElement,
  searchbarInputHTMLElement,
  gifsWrapperHTMLElement,
  noGifsWrapperHTMLElement
) => {
  searchbarInputHTMLElement.value = "";
  hideSearchbarCross(searchbarCrossHTMLElement);
  emptyGifsWrapper(gifsWrapperHTMLElement);
  hideGifsWrapper(gifsWrapperHTMLElement);
  noGifsWrapperHTMLElement.querySelector(
    "#no-gifs-message"
  ).innerText = NO_GIFS_SEARCHBAR_EMPTY_MESSAGE;
  showNoGifsWrapper(noGifsWrapperHTMLElement);
  updateHref("");
};

window.onload = () => {
  const searchbarMGlass = document.getElementById("searchbar-mglass");
  const searchbarLoader = document.getElementById("searchbar-loader");
  const searchbarInput = document.getElementById("searchbar-input");
  const searchbarCross = document.getElementById("searchbar-cross");

  const gifsWrapper = document.getElementById("gifs-wrapper");
  const noGifsWrapper = document.getElementById("no-gifs-wrapper");

  /* ======== SEARCHBAR ELISTENERS ======= */

  // loads GIFs, updates browser href and manage cross icon display
  searchbarInput.addEventListener("input", event =>
    handleSearchbarInput(
      event,
      searchbarMGlass,
      searchbarLoader,
      searchbarCross,
      gifsWrapper,
      noGifsWrapper
    )
  );

  searchbarCross.addEventListener("click", event =>
    handleSearchbarCrossClick(
      event,
      searchbarCross,
      searchbarInput,
      gifsWrapper,
      noGifsWrapper
    )
  );

  /* ======== HANDLING INITIAL Q PARAM ======== */

  const initialQParam = getHrefParams().get("q");
  if (initialQParam !== null) {
    searchbarInput.value = initialQParam;
    searchbarInput.dispatchEvent(new Event("input"));
  }
};
