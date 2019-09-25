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

let alertManager = null;

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

            for (let giphyGifObject of data) {
              addGifToDivFromGiphyRow(
                gifsWrapper,
                new Gif(
                  giphyGifObject.id,
                  giphyGifObject.images.fixed_width.url
                ),
                favoriteManager
              );
            }
            // replace all the tags with 'data-feather' by corresponding svg
            feather.replace();

            /* forced to bind buttons eventListeners here and not during gifs insertion
             because feather.replace() doesn't keeps attached eventListeners during <i /> 
             tags replacement. */
            bindEventListenersToGifButtons(
              gifsWrapper,
              favoriteManager,
              alertManager
            );
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
        response
          .json()
          .then(({ message }) =>
            alertManager.push(
              new Alert(
                `☠️ &nbsp; Oops! Something wrong happened. (${response.status})`,
                AlertType.ERROR
              )
            )
          );
        hideSearchbarLoader(searchbarMGlass, searchbarLoader);
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
  updateHrefQValue("");

  if (!isHrefHome()) return;

  emptyGifsWrapper(gifsWrapperHTMLElement);
  hideGifsWrapper(gifsWrapperHTMLElement);
  noGifsWrapperHTMLElement.querySelector(
    "#no-gifs-message"
  ).innerText = NO_GIFS_SEARCHBAR_EMPTY_MESSAGE;
  showNoGifsWrapper(noGifsWrapperHTMLElement);
};

/* ======== ROUTING ======= */

const displayHome = (
  homeNavItem,
  favoritedNavItem,
  searchbarInput,
  gifsWrapper,
  noGifsWrapper
) => {
  setHrefToHome();
  homeNavItem.classList.add("active");
  favoritedNavItem.classList && favoritedNavItem.classList.remove("active");

  const initialQParam = getHrefParams().get("q");
  if (initialQParam !== null) {
    searchbarInput.dispatchEvent(new Event("input"));
  } else {
    hideGifsWrapper(gifsWrapper);
    noGifsWrapper.querySelector(
      "#no-gifs-message"
    ).innerText = NO_GIFS_SEARCHBAR_EMPTY_MESSAGE;
    showNoGifsWrapper(noGifsWrapper);
  }
};

const displayFavorited = (
  homeNavItem,
  favoritedNavItem,
  gifsWrapper,
  noGifsWrapper,
  favoriteManager
) => {
  setHrefToFavorited();
  homeNavItem.classList && homeNavItem.classList.remove("active");
  favoritedNavItem.classList.add("active");

  const favorites = favoriteManager.getFavorites();

  if (favorites.length > 0) {
    hideNoGifsWrapper(noGifsWrapper);
    showGifsWrapper(gifsWrapper);
    emptyGifsWrapper(gifsWrapper);
    document.getElementById("gifs-count").innerText = favorites.length;

    for (let gifObject of favorites) {
      addGifToDivFromGiphyRow(gifsWrapper, gifObject, favoriteManager);
    }

    // replace all the tags with 'data-feather' by corresponding svg
    feather.replace();

    /* forced to bind buttons eventListeners here and not during gifs insertion
     because feather.replace() doesn't keeps attached eventListeners during <i /> 
     tags replacement. */
    bindEventListenersToGifButtons(gifsWrapper, favoriteManager, alertManager);
  } else {
    hideGifsWrapper(gifsWrapper);
    noGifsWrapper.querySelector(
      "#no-gifs-message"
    ).innerText = NO_GIFS_FAVORITES;
    showNoGifsWrapper(noGifsWrapper);
  }
};

/* ======== ON PAGE LOADED ======= */

window.onload = () => {
  const homeNavItem = document.getElementById("home-nav-item");
  const favoritedNavItem = document.getElementById("favorited-nav-item");

  const alertsWrapper = document.getElementById("alerts-wrapper");

  const searchbarMGlass = document.getElementById("searchbar-mglass");
  const searchbarLoader = document.getElementById("searchbar-loader");
  const searchbarInput = document.getElementById("searchbar-input");
  const searchbarCross = document.getElementById("searchbar-cross");

  const gifsWrapper = document.getElementById("gifs-wrapper");
  const noGifsWrapper = document.getElementById("no-gifs-wrapper");

  /* ======== INITIAL SETUP ======== */

  alertManager = new AlertManager(alertsWrapper);

  // display home by default
  displayHome(
    homeNavItem,
    favoritedNavItem,
    searchbarInput,
    gifsWrapper,
    noGifsWrapper
  );

  /* when on Favorited tab, allows us to automatically refresh
     displayed GIFs when "un-favoriting" some GIF */
  favoriteManager.afterRemoveHook = () => {
    !isHrefHome() &&
      displayFavorited(
        homeNavItem,
        favoritedNavItem,
        gifsWrapper,
        noGifsWrapper,
        favoriteManager
      );
  };

  /* ======== NAVBAR ELISTENERS ======= */

  homeNavItem.addEventListener("click", event =>
    displayHome(
      homeNavItem,
      favoritedNavItem,
      searchbarInput,
      gifsWrapper,
      noGifsWrapper,
      favoriteManager
    )
  );

  favoritedNavItem.addEventListener("click", event =>
    displayFavorited(
      homeNavItem,
      favoritedNavItem,
      gifsWrapper,
      noGifsWrapper,
      favoriteManager
    )
  );

  /* ======== SEARCHBAR ELISTENERS ======= */

  // loads GIFs, updates browser href and manage cross icon display
  searchbarInput.addEventListener("input", event => {
    if (!isHrefHome()) {
      displayHome(
        homeNavItem,
        favoritedNavItem,
        searchbarInput,
        gifsWrapper,
        noGifsWrapper,
        favoriteManager
      );
    }

    handleSearchbarInput(
      event,
      searchbarMGlass,
      searchbarLoader,
      searchbarCross,
      gifsWrapper,
      noGifsWrapper
    );
  });

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
