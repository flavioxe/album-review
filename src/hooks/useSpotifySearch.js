import { useEffect, useRef, useState } from "react";
import { searchAlbums } from "../services/spotifyService";

const PAGE_SIZE = 5;

export default function useSpotifySearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const requestIdRef = useRef(0);

  const reset = () => {
    setResults([]);
    setError(null);
    setOffset(0);
    setHasMore(false);
  };

  const runSearch = async (searchText, nextOffset = 0, append = false) => {
    const currentRequestId = ++requestIdRef.current;
    setIsLoading(true);
    setError(null);

    try {
      const albums = await searchAlbums(searchText, nextOffset);
      if (currentRequestId !== requestIdRef.current) return;

      setResults((prev) => (append ? [...prev, ...albums] : albums));
      setOffset(nextOffset);
      setHasMore(albums.length === PAGE_SIZE);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(err.message || "Nao foi possivel buscar albuns.");
      if (!append) {
        setResults([]);
        setHasMore(false);
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  };

  const search = async (searchText) => {
    const normalized = (searchText || "").trim();
    if (!normalized) {
      reset();
      return;
    }

    await runSearch(normalized, 0, false);
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;
    const normalized = query.trim();
    if (!normalized) return;

    const nextOffset = offset + PAGE_SIZE;
    await runSearch(normalized, nextOffset, true);
  };

  useEffect(() => {
    if (!query.trim()) {
      requestIdRef.current += 1;
      setIsLoading(false);
      reset();
      return;
    }

    if (query.trim().length < 3) {
      return;
    }

    const timeoutId = setTimeout(() => {
      runSearch(query.trim(), 0, false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    isLoading,
    error,
    hasMore,
    loadMore,
    reset,
    search,
  };
}
