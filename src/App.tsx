import React, { useState, useEffect } from "react";
import "../node_modules/tailwindcss/dist/tailwind.min.css";

import Header from "./components/header/Header";
import GifList from "./components/giflist/GifList";
import { GIF } from "./types";
import useDebounce from "./hooks/useDebounce";
import { Route, getActualRoute } from "./routing";
import { updateHrefQValue } from "./utils";
import {
  SEARCHBAR_DEBOUNCE_DELAY,
  GIPHY_SEARCH_API_ENDPOINT,
  GIPHY_DEV_API_KEY
} from "./utils";

const App: React.FC = () => {
  const [route, setRoute] = useState<Route>(getActualRoute());
  const [searchValue, setSearchValue] = useState<string>("");
  const [gifs, setGifs] = useState<Array<GIF>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounce(
    searchValue,
    SEARCHBAR_DEBOUNCE_DELAY
  );

  // fetching gifs on searchbar value change
  useEffect(() => {
    if (debouncedSearchValue) {
      fetch(
        `${GIPHY_SEARCH_API_ENDPOINT}?api_key=${GIPHY_DEV_API_KEY}&q=${debouncedSearchValue}`
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
        className="w-1/2 h-full flex flex-col justify-center shadow-lg"
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

      <div className="w-1/2 bg-black">
        <GifList gifs={gifs}></GifList>
      </div>
    </div>
  );
};

export default App;
