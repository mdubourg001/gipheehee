import React, { useState, useEffect } from "react";
import "../node_modules/tailwindcss/dist/tailwind.min.css";

import Header from "./components/header/Header";
import GifList from "./components/giflist/GifList";
import { GIF } from "./types";
import useDebounce from "./hooks/useDebounce";
import {
  SEARCHBAR_DEBOUNCE_DELAY,
  GIPHY_SEARCH_API_ENDPOINT,
  GIPHY_DEV_API_KEY
} from "./utils";

const App: React.FC = () => {
  const [searchValue, setSearchValue] = useState<string>("");
  const [gifs, setGifs] = useState<Array<GIF>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [debouncedSearchValue, setDebouncedSearchValue] = useDebounce(
    searchValue,
    SEARCHBAR_DEBOUNCE_DELAY
  );

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
            setIsLoading(false);
          });
        }
      });
    } else {
      setGifs([]);
    }
  }, [debouncedSearchValue]);

  return (
    <div className="App">
      <Header
        isLoading={isLoading}
        onInputFieldChange={(value, skipDebounce) => {
          if (!skipDebounce) {
            setIsLoading(true);
            setSearchValue(value);
          }
          // skipping debounce by direct updating debounce value (without timeout)
          else setDebouncedSearchValue(value);
        }}
      ></Header>

      <GifList gifs={gifs}></GifList>
    </div>
  );
};

export default App;
