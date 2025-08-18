import { useState, useEffect } from "react";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const listener = () => setMatches(media.matches);
    setMatches(media.matches);
    media.addListener(listener);
    return () => media.removeListener(listener);
  }, [query]);

  return matches;
};
export {useMediaQuery};