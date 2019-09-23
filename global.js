const handleSearchbarFocus = event => {
  console.log("coucou");
  document.getElementById("searchbar-cross").classList.remove("hidden");
};

const handleSearchbarBlur = event => {
  document.getElementById("searchbar-cross").classList.add("hidden");
};

document.onload = () => {
  // display cross icon on searchbar input focus
  document
    .getElementById("searchbar-input")
    .addEventListener("focus", handleSearchbarFocus);
  // hide cross icon on searchbar input focus
  document
    .getElementById("searchbar-input")
    .addEventListener("blur", handleSearchbarBlur);
};
