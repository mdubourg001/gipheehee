/* ======== CONSTANTS ======= */

const GIPHY_SEARCH_API_ENDPOINT = "https://api.giphy.com/v1/gifs/search";
const GIPHY_DEV_API_KEY = "hYs1n6z0WOkt24K6w7ttx18gnRLh8Gks";

const SEARCHBAR_DEBOUNCE_DELAY = 1000;

const NO_GIFS_SEARCHBAR_EMPTY_MESSAGE =
  "☝ Use the searchbar to search for some GIFs.";
const NO_GIFS_NO_RESULTS_MESSAGE = "😭 No GIFs found for";
const NO_GIFS_FAVORITES = "🤷 You marked no GIFs as favorites yet.";

const LOCAL_STORAGE_FAVORITES_KEY = "FAVORITE_GIFS";

/* ======== UTILS ======= */

class Debouncer {
  constructor(callback, delay) {
    this._timeout = null;
    this.callback = callback;
    this.delay = delay;
  }

  call(...args) {
    clearTimeout(this._timeout);
    this._timeout = setTimeout(() => {
      this.callback(...args);
    }, this.delay);
  }
}

class FavoriteManager {
  constructor() {
    const _lsFavorites = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    this._favorites = _lsFavorites !== null ? JSON.parse(_lsFavorites) : [];
  }

  getFavorites() {
    return this._favorites;
  }

  isFavorite(giphyGifId) {
    return this._favorites.some(f => f.id === giphyGifId);
  }

  add(giphyRow) {
    this._favorites.push({
      id: giphyRow.id,
      url: giphyRow.images.fixed_width.url
    });
    localStorage.setItem(
      LOCAL_STORAGE_FAVORITES_KEY,
      JSON.stringify(this._favorites)
    );
  }

  remove(giphyGifId) {
    this._favorites = this._favorites.filter(f => f.id !== giphyGifId);
    localStorage.setItem(
      LOCAL_STORAGE_FAVORITES_KEY,
      JSON.stringify(this._favorites)
    );
  }
}

const setHrefToHome = () => {
  const newHref = new URL(window.location.href);

  if (newHref.pathname !== "/") {
    newHref.pathname = "/";
    newHref.searchParams.forEach(p => newHref.searchParams.delete(p));
  }

  window.history.replaceState({}, null, newHref.href);
};

const setHrefToFavorited = () => {
  const newHref = new URL(window.location.href);

  if (newHref.pathname !== "/favorited") {
    newHref.pathname = "/favorited";
    newHref.searchParams.forEach(p => newHref.searchParams.delete(p));
  }

  window.history.replaceState({}, null, newHref.href);
};

const updateHrefQValue = qValue => {
  const newHref = new URL(window.location.href);

  // https://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
  if (qValue) {
    newHref.searchParams.set("q", qValue);
    document.title = `Gipheehee - ${qValue} GIFs`;
  } else {
    newHref.searchParams.delete("q");
    document.title = `Gipheehee`;
  }

  window.history.replaceState({}, null, newHref.href);
};

// returns a URLSearchParams object
// (https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
const getHrefParams = () => new URL(window.location.href).searchParams;

const addGifToDivFromGiphyRow = (gifsWrapper, giphyRow, favoriteManager) => {
  const newGifWrapper = document.createElement("div");
  newGifWrapper.className = "gif";
  newGifWrapper.id = giphyRow.id;
  const newGif = document.createElement("img");
  newGif.src = giphyRow.images.fixed_width.url;
  newGif.alt = giphyRow.title;

  const gifButtonsWrapper = document.createElement("div");
  gifButtonsWrapper.className =
    "gif-buttons-wrapper flex items-center justify-between";
  const shareButton = document.createElement("i");
  shareButton.className = "gif-share-button";
  shareButton.setAttribute("data-feather", "share-2");
  const favButton = document.createElement("i");
  favButton.className = `gif-fav-button ${
    favoriteManager.isFavorite(giphyRow.id) ? "fav" : ""
  }`;
  favButton.setAttribute("data-feather", "heart");

  gifButtonsWrapper.appendChild(shareButton);
  gifButtonsWrapper.appendChild(favButton);
  newGifWrapper.appendChild(newGif);
  newGifWrapper.appendChild(gifButtonsWrapper);
  gifsWrapper.appendChild(newGifWrapper);
};
