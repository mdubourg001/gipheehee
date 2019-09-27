import React, { useReducer, useEffect } from "react";
import {
  Loader as LoaderIcon,
  Search as SearchIcon,
  X as XIcon
} from "react-feather";

import { InputChangeCallback } from "../../types";

type SearchbarProps = {
  isLoading: boolean;
  onInputFieldChange: InputChangeCallback;
};

type SearchbarState = {
  inputValue: string;
};

enum SearchbarActionType {
  FIELD_CHANGE, // onChange event on searchbar input
  INPUT_CLEAR // on 'X' icon click
}

type SearchbarAction =
  | {
      type: SearchbarActionType.FIELD_CHANGE;
      value: string;
    }
  | { type: SearchbarActionType.INPUT_CLEAR };

const searchbarReducer = (
  state: SearchbarState,
  action: SearchbarAction
): SearchbarState => {
  switch (action.type) {
    case SearchbarActionType.FIELD_CHANGE:
      return { ...state, inputValue: action.value };
    case SearchbarActionType.INPUT_CLEAR:
      return { ...state, inputValue: "" };
  }
};

/*
 This component manages only the 'value' of the input field
 Debouncing and data fetching are handled by upper components
*/
const Searchbar: React.FC<SearchbarProps> = ({
  isLoading,
  onInputFieldChange
}) => {
  // maybe a reducer is a bit 'too much' here, but did it for practicing 👨‍🎓
  const [state, dispatch] = useReducer(searchbarReducer, { inputValue: "" });

  // setting the focus on the searchbar on app mount
  useEffect(() => {
    const searchbarHTMLElement = document.getElementById("searchbar");
    if (searchbarHTMLElement) searchbarHTMLElement.focus();
  }, []);

  return (
    <div className="w-full flex items-center rounded bg-white px-5 py-2">
      {isLoading ? (
        <LoaderIcon
          className="loader-icon"
          color="black"
          size={18}
        ></LoaderIcon>
      ) : (
        <SearchIcon color="black" size={18}></SearchIcon>
      )}

      <input
        type="text"
        id="searchbar"
        className="w-full mx-2 focus:outline-none"
        value={state.inputValue}
        placeholder="ex: Jacques Chirac..."
        onChange={(event: React.FormEvent<HTMLInputElement>) => {
          onInputFieldChange((event.target as HTMLInputElement).value);
          dispatch({
            type: SearchbarActionType.FIELD_CHANGE,
            value: (event.target as HTMLInputElement).value
          });
        }}
        onKeyPress={(event: React.KeyboardEvent<HTMLInputElement>) =>
          event.key === "Enter" &&
          onInputFieldChange((event.target as HTMLInputElement).value, true)
        }
      ></input>

      <XIcon
        color="black"
        size={18}
        onClick={_ => {
          onInputFieldChange("", true);
          dispatch({ type: SearchbarActionType.INPUT_CLEAR });
          const searchbarHTMLElement = document.getElementById("searchbar");
          if (searchbarHTMLElement) searchbarHTMLElement.focus();
        }}
      ></XIcon>
    </div>
  );
};

export default Searchbar;
