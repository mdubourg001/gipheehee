import React, { useState, useEffect, useCallback } from "react";
import "../node_modules/tailwindcss/dist/tailwind.min.css";

import Header from "./components/header/Header";
import GifList from "./components/giflist/GifList";
import { GIF } from "./types";
import useDebounce from "./hooks/useDebounce";
import { Route, getActualRoute, ValidRoutes } from "./routing";
import { updateHrefQValue, LOCAL_STORAGE_FAVORITES_KEY } from "./utils";
import {
  SEARCHBAR_DEBOUNCE_DELAY,
  GIPHY_SEARCH_API_ENDPOINT,
  GIPHY_DEV_API_KEY
} from "./utils";
import { spawn } from "child_process";

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(getActualRoute());
  const [searchValue, setSearchValue] = useState<string>("");
  const [gifs, setGifs] = useState<Array<GIF>>([]);
  const [favorites, setFavorites] = useState<Array<GIF>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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
    fetchAndUpdateGifs();
    setIsLoading(false);
  }, [debouncedSearchValue]);

  useEffect(() => updateHrefQValue(searchValue), [searchValue]);

  // updating browser's href on route change
  useEffect(() => {
    window.history.replaceState(undefined, document.title, route.toString());
  }, [route]);

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
        ></Header>
      </div>

      <div className="w-3/5 bg-black flex items-center justify-center">
        <GifList
          gifs={route === ValidRoutes.Home ? gifs : favorites}
          favorites={favorites}
          toggleFavorite={(gif: GIF) => {
            if (favorites.some(f => f.id === gif.id)) {
              setFavorites(favorites.filter(f => f.id !== gif.id));
            } else {
              setFavorites([...favorites, gif]);
            }
          }}
        ></GifList>
        {gifs.length === 0 && route === ValidRoutes.Home && (
          <b className="text-white pb-10">
            {route === ValidRoutes.Home && (
              <span>👈 &nbsp; Use the searchbar to search for some GIFs.</span>
            )}
          </b>
        )}
        {favorites.length === 0 && route === ValidRoutes.Favorited && (
          <b className="text-white pb-10">
            {route === ValidRoutes.Favorited && (
              <span>🤷 &nbsp; You marked no GIFs as favorites yet.</span>
            )}
          </b>
        )}
      </div>
    </div>
  );
};

export default App;
