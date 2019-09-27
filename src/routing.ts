export enum ValidRoutes {
  Home = "/",
  Favorited = "/favorited"
}

export type Route = ValidRoutes.Home | ValidRoutes.Favorited;

export const getActualRoute = (): Route => {
  switch (window.location.pathname) {
    case "/favorited":
      return ValidRoutes.Favorited;
    // when accessing an invalid route, displaying Home by default
    default:
      return ValidRoutes.Home;
  }
};
