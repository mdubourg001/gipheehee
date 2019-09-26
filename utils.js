/* ======== CONSTANTS & GLOBALS ======= */

const GIPHY_SEARCH_API_ENDPOINT = "https://api.giphy.com/v1/gifs/search";
const GIPHY_DEV_API_KEY = "hYs1n6z0WOkt24K6w7ttx18gnRLh8Gks";

const SEARCHBAR_DEBOUNCE_DELAY = 1000;

const NO_GIFS_SEARCHBAR_EMPTY_MESSAGE =
  "☝ Use the searchbar to search for some GIFs.";
const NO_GIFS_NO_RESULTS_MESSAGE = "😭 No GIFs found for";
const NO_GIFS_FAVORITES = "🤷 You marked no GIFs as favorites yet.";

const LOCAL_STORAGE_FAVORITES_KEY = "FAVORITE_GIFS";

let ALERTS_COUNT = 0;
const ALERTS_TIMEOUT_DELAY = 5000;

/* ======== UTILS ======= */

// class used only to normalize the format of GIFs stored into localStorage
class Gif {
  constructor(id, url) {
    this.id = id;
    this.url = url;
  }
}

const AlertType = {
  INFO: "info",
  ERROR: "error"
};

class Alert {
  constructor(title, type) {
    this.id = ALERTS_COUNT++;
    this.title = title;
    this.type = type;
  }
}

class AlertManager {
  constructor(alertsWrapper) {
    this.alertsWrapper = alertsWrapper;
    this._alerts = [];
  }

  _getHTMLElementFromAlertObject(alertObject) {
    const newAlert = document.createElement("div");
    newAlert.className = `alert alert-${alertObject.type} flex`;
    const alertTitle = document.createElement("span");
    alertTitle.innerHTML = alertObject.title;

    newAlert.appendChild(alertTitle);
    newAlert.addEventListener("click", () => this.remove(alertObject.id));
    return newAlert;
  }

  _emptyAlertsWrapper() {
    const alerts = this.alertsWrapper.getElementsByClassName("alert");
    while (alerts[0]) this.alertsWrapper.removeChild(alerts[0]);
  }

  _displayAlertsWrapper() {
    for (let alert of this.getAlerts()) {
      this.alertsWrapper.appendChild(
        this._getHTMLElementFromAlertObject(alert)
      );
    }
  }

  _refreshAlertsWrapper() {
    this._emptyAlertsWrapper();
    this._displayAlertsWrapper();
  }

  getAlerts() {
    return this._alerts;
  }

  push(alertObject) {
    this._alerts.push(alertObject);
    this._refreshAlertsWrapper();

    setTimeout(() => {
      this.remove(alertObject.id);
    }, ALERTS_TIMEOUT_DELAY);
  }

  remove(alertId) {
    this._alerts = this._alerts.filter(a => a.id !== alertId);
    this._refreshAlertsWrapper();
  }
}

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

  directCall(...args) {
    clearTimeout(this._timeout);
    this._timeout = null;
    this.callback(...args);
  }
}

class FavoriteManager {
  constructor(afterRemoveHook = () => {}) {
    const _lsFavorites = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    this._favorites = _lsFavorites !== null ? JSON.parse(_lsFavorites) : [];
    // useful to refresh GIFs displayed when on Favorited tab
    this.afterRemoveHook = afterRemoveHook;
  }

  getFavorites() {
    return this._favorites;
  }

  isFavorite(giphyGifId) {
    return this._favorites.some(f => f.id === giphyGifId);
  }

  add(gifObject) {
    this._favorites.push({
      id: gifObject.id,
      url: gifObject.url
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
    this.afterRemoveHook();
  }
}

const parseSearchParams = href => {
  const split = href.split("?");
  return split.length > 1
    ? new URLSearchParams(split[1])
    : new URLSearchParams();
};

const isHrefHome = () => {
  const href = new URL(window.location.href);
  return !href.href.includes("/favorited");
};

const setHrefToHome = () => {
  if (!isHrefHome()) {
    const searchParams = parseSearchParams(window.location.href);
    const newHref = new URL(window.location.href);
    newHref.href = newHref.origin;
    newHref.searchParams.set("q", searchParams.get("q"));
    window.history.replaceState({}, null, newHref.href);
  }
};

const setHrefToFavorited = () => {
  if (isHrefHome()) {
    const newHref = new URL(window.location.href);
    newHref.pathname = "/favorited";
    // https://stackoverflow.com/a/5497365
    window.history.replaceState(
      {},
      null,
      newHref.href.replace(/\/([^\/]*)$/, "/#/" + "$1")
    );
  }
};

const updateHrefQValue = qValue => {
  const newHref = new URL(window.location.href);

  if (isHrefHome()) {
    // https://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
    if (qValue) {
      newHref.searchParams.set("q", qValue);
      document.title = `Gipheehee - ${qValue} GIFs`;
    } else {
      newHref.searchParams.delete("q");
      document.title = `Gipheehee`;
    }
  } else {
    newHref.hash = "#/favorited";
  }

  window.history.replaceState({}, null, newHref.href);
};

const addGifToDivFromGiphyRow = (gifsWrapper, gifObject, favoriteManager) => {
  const newGifWrapper = document.createElement("div");
  newGifWrapper.className = "gif";
  newGifWrapper.id = gifObject.id;
  const newGif = document.createElement("img");
  newGif.src = gifObject.url;
  newGif.alt = gifObject.title;

  const gifButtonsWrapper = document.createElement("div");
  gifButtonsWrapper.className =
    "gif-buttons-wrapper flex items-center justify-between";
  const shareButton = document.createElement("i");
  shareButton.className = "gif-share-button";
  shareButton.setAttribute("data-feather", "share-2");
  const favButton = document.createElement("i");
  favButton.className = `gif-fav-button ${
    favoriteManager.isFavorite(gifObject.id) ? "fav" : ""
  }`;
  favButton.setAttribute("data-feather", "heart");

  gifButtonsWrapper.appendChild(shareButton);
  gifButtonsWrapper.appendChild(favButton);
  newGifWrapper.appendChild(newGif);
  newGifWrapper.appendChild(gifButtonsWrapper);
  gifsWrapper.appendChild(newGifWrapper);
};

const addLoadMoreButton = (gifsWrapper, pagination, onClickCallback) => {
  if (pagination.offset + pagination.count >= pagination.total_count) return;

  const loadMoreWrapper = document.createElement("div");
  loadMoreWrapper.id = "load-more-wrapper";
  loadMoreWrapper.className = "w-full flex justify-center";
  const loadMoreButton = document.createElement("button");
  loadMoreButton.id = "load-more-button";
  const loadMoreText = document.createElement("span");
  loadMoreText.innerText = "Load more";

  loadMoreButton.addEventListener("click", onClickCallback);

  loadMoreButton.appendChild(loadMoreText);
  loadMoreWrapper.appendChild(loadMoreButton);
  gifsWrapper.appendChild(loadMoreWrapper);
};

const bindEventListenersToGifButtons = (
  gifsWrapper,
  favoriteManager,
  alertManager
) => {
  for (let gif of gifsWrapper.getElementsByClassName("gif")) {
    gif.querySelector(".gif-share-button").addEventListener("click", _ => {
      // might not work on some browsers (IE, Edge), did not found any polyfills 🤷
      // https://caniuse.com/#feat=mdn-api_clipboard
      navigator.clipboard.writeText(gif.querySelector("img").src).then(() => {
        alertManager.push(
          new Alert("📃 &nbsp; GIF URL copied to clipboard!", AlertType.INFO)
        );
      });
    });

    gif.querySelector(".gif-fav-button").addEventListener("click", event => {
      if (favoriteManager.isFavorite(gif.id)) {
        favoriteManager.remove(gif.id);
        event.target.closest("svg").classList.remove("fav");
        alertManager.push(
          new Alert("😞 &nbsp; GIF removed from favorites.", AlertType.INFO)
        );
      } else {
        favoriteManager.add(new Gif(gif.id, gif.querySelector("img").src));
        event.target.closest("svg").classList.add("fav");
        alertManager.push(
          new Alert("🎉 &nbsp; GIF added to favorites!", AlertType.INFO)
        );
      }
    });
  }
};
