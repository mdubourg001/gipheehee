/* ======== CONSTANTS ======= */

const GIPHY_SEARCH_API_ENDPOINT = "https://api.giphy.com/v1/gifs/search";
const GIPHY_DEV_API_KEY = "hYs1n6z0WOkt24K6w7ttx18gnRLh8Gks";

/* ======== EVENT HANDLERS ======= */

const handleSearchbarInput = (event, searchbarCrossHTMLElement) => {
  if (event.target.value.length === 0)
    searchbarCrossHTMLElement.classList.add("hidden");
  else searchbarCrossHTMLElement.classList.remove("hidden");

  if (event.target.value.length > 0) {
    fetch(
      `${GIPHY_SEARCH_API_ENDPOINT}?api_key=${GIPHY_DEV_API_KEY}&q=${event.target.value}`,
      response => {},
      error => {}
    );
  }

  // TODO IMPLEMENT HREF UPDATE
};

const handleSearchbarCrossClick = (event, searchbarInputHTMLElement) => {
  searchbarInputHTMLElement.value = "";
  event.target.classList.add("hidden");
};

window.onload = () => {
  const searchbarInput = document.getElementById("searchbar-input");
  const searchbarCross = document.getElementById("searchbar-cross");

  const gifsWrapper = document.getElementById("gifs-wrapper");

  /* ======== SEARCHBAR ELISTENERS ======= */

  // loads GIFs, updates browser href and manage cross icon display
  searchbarInput.addEventListener("input", event =>
    handleSearchbarInput(event, searchbarCross)
  );

  searchbarCross.addEventListener("click", event =>
    handleSearchbarCrossClick(event, searchbarInput)
  );
};
