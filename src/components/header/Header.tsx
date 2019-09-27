import React from "react";

import Searchbar from "../searchbar/Searchbar";
import { InputChangeCallback } from "../../types";
import { Route, ValidRoutes } from "../../routing";

type HeaderProps = {
  isLoading: boolean;
  onInputFieldChange: InputChangeCallback;
  route: Route;
  setRoute: (route: Route) => void;
};

const Header: React.FC<HeaderProps> = ({
  isLoading,
  onInputFieldChange,
  route,
  setRoute
}) => {
  return (
    <header className="container mx-auto flex flex-col items-center m-2 mb-20">
      <h1 id="title" className="text-white bold text-4xl mb-8">
        Gipheehee.
      </h1>

      <div className="searchbar-wrapper w-3/5 mb-4">
        <Searchbar
          onInputFieldChange={onInputFieldChange}
          isLoading={isLoading}
        ></Searchbar>
      </div>

      <div className="flex justify-between">
        <div className="w-full flex justify-center">
          <button
            className={`focus:outline-none rounded text-white px-4 py-2 mr-4 ${route ===
              ValidRoutes.Home && "bg-purple-700 shadow-lg"} `}
            onClick={() => setRoute(ValidRoutes.Home)}
          >
            Home
          </button>
          <button
            className={`focus:outline-none rounded text-white px-4 py-2 mr-4 ${route ===
              ValidRoutes.Favorited && "bg-purple-700 shadow-lg"} `}
            onClick={() => setRoute(ValidRoutes.Favorited)}
          >
            Favorited
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
