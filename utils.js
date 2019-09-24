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

  get() {
    return this._favorites;
  }

  add(giphyRow) {
    this._favorites.push(giphyRow);
    localStorage.setItem(
      LOCAL_STORAGE_FAVORITES_KEY,
      JSON.stringify(this._favorites)
    );
  }

  remove(giphyRow) {
    localStorage.setItem(
      LOCAL_STORAGE_FAVORITES_KEY,
      JSON.stringify(this._favorites.filter(f => f.id !== giphyRow.id))
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

const addGifToFavorited = row => {};

const removeGifFromFavorited = row => {};

const addGifToDivFromGiphyRow = (gifsWrapper, giphyRow) => {
  const newGif = document.createElement("img");
  newGif.src = giphyRow.images.fixed_width.url;
  newGif.alt = giphyRow.title;
  newGif.className = "gif";
  gifsWrapper.appendChild(newGif);
};
