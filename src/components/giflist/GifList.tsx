import React from "react";

import { GIF } from "../../types";

// ========== GifImage ========== //

type GifImageProps = {
  gif: GIF;
};

const GifImage: React.FC<GifImageProps> = ({ gif }) => {
  return (
    <div className="border border-black shadow rounded-sm m-2">
      <img
        className="rounded-sm"
        src={gif.url}
        alt={gif.title}
        width={gif.width}
        height={gif.height}
      ></img>
    </div>
  );
};

// ========== GifList ========== //

type GifListProps = {
  gifs: Array<GIF>;
};

const GifList: React.FC<GifListProps> = ({ gifs }) => {
  return (
    <section className="flex items-center flex-wrap overflow-y-scroll max-h-full">
      {gifs.map(gif => (
        <GifImage key={gif.id} gif={gif}></GifImage>
      ))}
    </section>
  );
};

export default GifList;
