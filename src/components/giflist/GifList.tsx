import React from "react";
import { Heart as HeartIcon, Link as LinkIcon } from "react-feather";

import { GIF } from "../../types";

// ========== GifImage ========== //

type GifImageProps = {
  gif: GIF;
  isFavorite: boolean;
  toggleFavorite: (gif: GIF) => void;
  copyToClipboard: (gif: GIF) => void;
};

const GifImage: React.FC<GifImageProps> = ({
  gif,
  isFavorite,
  toggleFavorite,
  copyToClipboard
}) => {
  return (
    <div
      className={`gif relative flex justify-center shadow-lg rounded-sm m-3 ${isFavorite &&
        "favorite"}`}
    >
      <img
        className="rounded-sm"
        src={gif.url}
        alt={gif.title}
        width={gif.width}
        height={gif.height}
      ></img>
      <div className="gif-cloak rounded-sm w-full h-full absolute top-0 left-0 flex justify-center items-center">
        <span onClick={() => copyToClipboard(gif)}>
          <LinkIcon size={40} color="white"></LinkIcon>
        </span>
        <span onClick={() => toggleFavorite(gif)}>
          <HeartIcon size={40} color="#E44854"></HeartIcon>
        </span>
      </div>
    </div>
  );
};

// ========== GifList ========== //

type GifListProps = {
  gifs: Array<GIF>;
  favorites: Array<GIF>;
  toggleFavorite: (gif: GIF) => void;
  copyToClipboard: (gif: GIF) => void;
};

const GifList: React.FC<GifListProps> = ({
  gifs,
  favorites,
  toggleFavorite,
  copyToClipboard
}) => {
  return (
    <section className="flex flex-wrap overflow-y-scroll max-h-full">
      {gifs.map(gif => (
        <GifImage
          key={gif.id}
          gif={gif}
          isFavorite={favorites.some(f => f.id === gif.id)}
          toggleFavorite={toggleFavorite}
          copyToClipboard={copyToClipboard}
        ></GifImage>
      ))}
    </section>
  );
};

export default GifList;
