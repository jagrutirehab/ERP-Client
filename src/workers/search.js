import Fuse from "fuse.js";

let fuse;
onmessage = function (e) {
  const { type, data, query } = e.data;

  if (type === "initialize") {
    const fuseOptions = {
      isCaseSensitive: false,
      // includeScore: false,
      // shouldSort: true,
      // includeMatches: false,
      // findAllMatches: false,
      minMatchCharLength: 3,
      // location: 0,
      threshold: 0.2,
      distance: 10,
      // useExtendedSearch: false,
      // ignoreLocation: false,
      ignoreFieldNorm: true,
      // fieldNormWeight: 1,
      keys: ["name", "phoneNumber"],
    };
    fuse = new Fuse(data, fuseOptions);
  } else if (type === "search" && fuse) {
    const result = fuse.search(query);
    postMessage(result);
  }
};
