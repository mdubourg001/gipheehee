import React from "react";

import Searchbar from "../searchbar/Searchbar";
import { InputChangeCallback } from "../../types";

type HeaderProps = {
  isLoading: boolean;
  onInputFieldChange: InputChangeCallback;
};

const Header: React.FC<HeaderProps> = ({ isLoading, onInputFieldChange }) => {
  return (
    <header className="container mx-auto flex flex-col items-center">
      <div className="searchbar-wrapper w-1/3">
        <Searchbar
          onInputFieldChange={onInputFieldChange}
          isLoading={isLoading}
        ></Searchbar>
      </div>
    </header>
  );
};

export default Header;
