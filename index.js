/* ======== GLOBALS ======= */

const favoriteManager = new FavoriteManager();

// assigned once the DOM is rendered, on window.onload
let alertManager = null;

// usefull not to fetch Giphy API on each keystoke
const searchbarDebounce = new Debouncer(
  (
    event,
    gifsWrapper,
    noGifsWrapper,
    searchbarMGlass,
    searchbarLoader,
    offset = 0
  ) => {
    fetch(
      `${GIPHY_SEARCH_API_ENDPOINT}?api_key=${GIPHY_DEV_API_KEY}&q=${event.target.value}&offset=${offset}`
    ).then(response => {
      if (response.ok) {
        response.json().then(({ data, pagination }) => {
          if (data.length > 0) {
            hideNoGifsWrapper(noGifsWrapper);
            showGifsWrapper(gifsWrapper);
            if (offset === 0) emptyGifsWrapper(gifsWrapper);
            document.getElementById(
              "gifs-count"
            ).innerText = `${pagination.offset + pagination.count} out of ${
              pagination.total_count
            }`;

            for (let giphyGifObject of data) {
              addGifToDivFromGiphyRow(
                gifsWrapper,
                new Gif(
                  giphyGifObject.id,
                  giphyGifObject.images.fixed_width.url,
                  giphyGifObject.embed_url
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

            addLoadMoreButton(gifsWrapper, pagination, () => {
              hideLoadMoreButton();
              searchbarDebounce.directCall(
                event,
                gifsWrapper,
                noGifsWrapper,
                searchbarMGlass,
                searchbarLoader,
                pagination.offset + pagination.count
              );
            });
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

  const initialQParam = parseSearchParams(window.location.href).get("q");
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

  if (isHrefHome()) {
    displayHome(
      homeNavItem,
      favoritedNavItem,
      searchbarInput,
      gifsWrapper,
      noGifsWrapper
    );
  } else {
    displayFavorited(
      homeNavItem,
      favoritedNavItem,
      gifsWrapper,
      noGifsWrapper,
      favoriteManager
    );
  }

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

  // allows user to skip the timeout on input field on Enter press
  searchbarInput.addEventListener("keyup", event => {
    if (event.key === "Enter" && searchbarInput.value.length > 0) {
      searchbarDebounce.directCall(
        event,
        gifsWrapper,
        noGifsWrapper,
        searchbarMGlass,
        searchbarLoader
      );
    }
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

  const initialQParam = parseSearchParams(window.location.href).get("q");
  if (initialQParam !== null) {
    searchbarInput.value = initialQParam;
    // triggering fetching only if accessing '/'
    if (isHrefHome()) {
      searchbarInput.dispatchEvent(new Event("input"));
    }
    showSearchbarCross(searchbarCross);
  }
};
