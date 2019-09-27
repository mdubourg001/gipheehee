/* ======== CONSTANTS & GLOBALS ======= */

export const GIPHY_SEARCH_API_ENDPOINT = "https://api.giphy.com/v1/gifs/search";
export const GIPHY_DEV_API_KEY = "hYs1n6z0WOkt24K6w7ttx18gnRLh8Gks";

export const SEARCHBAR_DEBOUNCE_DELAY = 1000;

export const LOCAL_STORAGE_FAVORITES_KEY = "FAVORITE_GIFS";

export const ALERTS_TIMEOUT_DELAY = 5000;

/* ========= UTILS ======== */

export const updateHrefQValue = (qValue: string): void => {
  const newHref = new URL(window.location.href);

  if (qValue) {
    newHref.searchParams.set("q", qValue);
    document.title = `Gipheehee - ${qValue} GIFs`;
  } else {
    newHref.searchParams.delete("q");
    document.title = `Gipheehee`;
  }

  window.history.replaceState({}, document.title, newHref.href);
};
