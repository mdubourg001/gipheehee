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

const favoriteManager = new FavoriteManager();

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

            for (let row of data) {
              addGifToDivFromGiphyRow(gifsWrapper, row, favoriteManager);
            }
            // replace all the tags with 'data-feather' by corresponding svg
            feather.replace();

            /* forced to bind buttons eventListeners here and not during gifs insertion
             because feather.replace() doesn't keeps attached eventListeners during <i /> 
             tags replacement. */
            for (let gif of gifsWrapper.getElementsByClassName("gif")) {
              gif
                .querySelector(".gif-share-button")
                .addEventListener("click", _ => () =>
                  console.log("Not implemented.")
                );

              gif
                .querySelector(".gif-fav-button")
                .addEventListener("click", event => {
                  // should be a better way to pass a usable "row" to favoriteManager.add
                  if (favoriteManager.isFavorite(gif.id)) {
                    favoriteManager.remove(gif.id);
                    event.target.closest("svg").classList.remove("fav");
                  } else {
                    favoriteManager.add({
                      id: gif.id,
                      images: {
                        fixed_width: { url: gif.querySelector("img").src }
                      }
                    });
                    event.target.closest("svg").classList.add("fav");
                  }
                });
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

  updateHrefQValue(event.target.value);
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
  updateHrefQValue("");
};

/* ======== ROUTING ======= */

const displayHome = (homeNavItem, favoritedNavItem) => {
  setHrefToHome();
  homeNavItem.classList.add("active");
  favoritedNavItem.classList && favoritedNavItem.classList.remove("active");
};

const displayFavorited = (homeNavItem, favoritedNavItem) => {
  setHrefToFavorited();
  homeNavItem.classList && homeNavItem.classList.remove("active");
  favoritedNavItem.classList.add("active");
};

/* ======== ON PAGE LOADED ======= */

window.onload = () => {
  const homeNavItem = document.getElementById("home-nav-item");
  const favoritedNavItem = document.getElementById("favorited-nav-item");

  const searchbarMGlass = document.getElementById("searchbar-mglass");
  const searchbarLoader = document.getElementById("searchbar-loader");
  const searchbarInput = document.getElementById("searchbar-input");
  const searchbarCross = document.getElementById("searchbar-cross");

  const gifsWrapper = document.getElementById("gifs-wrapper");
  const noGifsWrapper = document.getElementById("no-gifs-wrapper");

  /* ======== NAVBAR ELISTENERS ======= */

  homeNavItem.addEventListener("click", event =>
    displayHome(homeNavItem, favoritedNavItem, favoriteGifs)
  );

  favoritedNavItem.addEventListener("click", event =>
    displayFavorited(homeNavItem, favoritedNavItem, favoriteGifs)
  );

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

  // display home by default
  displayHome(homeNavItem, favoritedNavItem);
};
