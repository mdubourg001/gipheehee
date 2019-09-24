/* ======== CONSTANTS ======= */

export const GIPHY_SEARCH_API_ENDPOINT = "https://api.giphy.com/v1/gifs/search";
export const GIPHY_DEV_API_KEY = "hYs1n6z0WOkt24K6w7ttx18gnRLh8Gks";

export const SEARCHBAR_DEBOUNCE_DELAY = 1000;

export const NO_GIFS_SEARCHBAR_EMPTY_MESSAGE =
  "☝ Use the searchbar to search for some GIFs.";
export const NO_GIFS_NO_RESULTS_MESSAGE = "😭 No GIFs found for";

/* ======== UTILS ======= */

export class Debouncer {
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

export const updateHref = qValue => {
  const newHref = new URL(window.location.href);

  // https://stackoverflow.com/questions/486896/adding-a-parameter-to-the-url-with-javascript
  if (qValue) newHref.searchParams.set("q", qValue);
  else newHref.searchParams.delete("q");

  window.history.replaceState({}, null, newHref.href);
};
