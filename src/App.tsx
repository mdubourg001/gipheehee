import React, { useState, useEffect, useCallback } from "react";
import "../node_modules/tailwindcss/dist/tailwind.min.css";

import Header from "./components/header/Header";
import GifList from "./components/giflist/GifList";
import { GIF } from "./types";
import useDebounce from "./hooks/useDebounce";
import { Route, getActualRoute, ValidRoutes } from "./routing";
import {
  updateHrefQValue,
  LOCAL_STORAGE_FAVORITES_KEY,
  ALERTS_TIMEOUT_DELAY
} from "./utils";
import {
  SEARCHBAR_DEBOUNCE_DELAY,
  GIPHY_SEARCH_API_ENDPOINT,
  GIPHY_DEV_API_KEY
} from "./utils";

/* Not implemented yet:
  - Keeping the 'q' param on refresh
  - Mobile support
  - Toast system (alerts on GIF copy / fav)
  - 'Load more' button
  - Hide 'X' icon when searchbar is empty
*/

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(getActualRoute());
  const [searchValue, setSearchValue] = useState<string>("");
  const [gifs, setGifs] = useState<Array<GIF>>([]);
  const [favorites, setFavorites] = useState<Array<GIF>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<string>("");

  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounce(
    searchValue,
    SEARCHBAR_DEBOUNCE_DELAY
  );

  const fetchAndUpdateGifs = useCallback(() => {
    if (debouncedSearchValue) {
      fetch(
        `${GIPHY_SEARCH_API_ENDPOINT}?api_key=${GIPHY_DEV_API_KEY}&q=${debouncedSearchValue}&limit=50`
      ).then(response => {
        if (response.ok) {
          response.json().then((data: any) => {
            const newGifs = Array<GIF>();
            for (let giphyGifObject of data.data) {
              newGifs.push({
                id: giphyGifObject.id,
                title: giphyGifObject.title,
                url: giphyGifObject.images.fixed_width.url,
                embed_url: giphyGifObject.embed_url,
                width: giphyGifObject.images.fixed_width.width,
                height: giphyGifObject.images.fixed_width.height
              });
            }
            setGifs(newGifs);
          });
        }
      });
    } else {
      setGifs([]);
    }
  }, [debouncedSearchValue, setGifs]);

  // querying favorites on app mount
  useEffect(() => {
    const lsFavorites = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
    if (lsFavorites) setFavorites(JSON.parse(lsFavorites));
    else setFavorites([]);
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_FAVORITES_KEY,
      JSON.stringify(favorites)
    );
  }, [favorites]);

  // fetching gifs on searchbar value change
  useEffect(() => {
    if (route !== ValidRoutes.Home) setRoute(ValidRoutes.Home);
    fetchAndUpdateGifs();
    setIsLoading(false);
  }, [debouncedSearchValue]);

  useEffect(() => updateHrefQValue(searchValue), [searchValue]);

  // updating browser's href on route change
  useEffect(() => {
    window.history.replaceState(undefined, document.title, route.toString());
  }, [route]);

  const displayToast = (content: string) => {
    setToast(content);
    // will create race conditions :/
    // fix it: by setting up a more complex toast queue system (with ids)
    setTimeout(() => setToast(""), ALERTS_TIMEOUT_DELAY);
  };

  return (
    <div className="App h-full flex overflow-hidden">
      <div
        id="header-wrapper"
        className="w-2/5 h-full flex flex-col justify-center shadow-lg"
      >
        <Header
          isLoading={isLoading}
          onInputFieldChange={(value, skipDebounce) => {
            if (!skipDebounce) {
              setIsLoading(true);
              setSearchValue(value);
            }
            // skipping debounce by direct updating debounce value (without timeout)
            else {
              setSearchValue(value);
              setDebouncedSearchValue(value);
            }
          }}
          route={route}
          setRoute={setRoute}
          toast={toast}
        ></Header>
      </div>

      <div className="w-3/5 bg-black flex items-center justify-center">
        <GifList
          gifs={route === ValidRoutes.Home ? gifs : favorites}
          favorites={favorites}
          // might memoise those two callbacks for performance (?)
          toggleFavorite={(gif: GIF) => {
            if (favorites.some(f => f.id === gif.id)) {
              setFavorites(favorites.filter(f => f.id !== gif.id));
              displayToast("😞 - GIF removed from favorites.");
            } else {
              setFavorites([...favorites, gif]);
              displayToast("🎉 - GIF added to favorites!");
            }
          }}
          copyToClipboard={(gif: GIF) => {
            // might not work on some browsers (IE, Edge), did not found any polyfills 🤷
            // https://caniuse.com/#feat=mdn-api_clipboard
            navigator.clipboard.writeText(gif.embed_url).then(() => {
              displayToast("📃 - GIF URL copied to clipboard!");
            });
          }}
        ></GifList>
        {gifs.length === 0 && route === ValidRoutes.Home && (
          <b className="text-white pb-10">
            {!debouncedSearchValue && (
              <span>👈 &nbsp; Use the searchbar to search for some GIFs.</span>
            )}
            {debouncedSearchValue && (
              <span>
                😭 &nbsp; No GIFs found for '{debouncedSearchValue}...'
              </span>
            )}
          </b>
        )}
        {favorites.length === 0 && route === ValidRoutes.Favorited && (
          <b className="text-white pb-10">
            <span>🤷 &nbsp; You marked no GIFs as favorites yet.</span>
          </b>
        )}
      </div>
    </div>
  );
};

export default App;
