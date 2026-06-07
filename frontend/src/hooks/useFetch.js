import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export function useFetch(path, options = {}) {
  const { enabled = true } = options;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(Boolean(enabled && path));
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    if (!path) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(path);
      setData(res.data);
    } catch (err) {
      setError(err);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    if (!enabled || !path) {
      setLoading(false);
      return;
    }
    refetch();
  }, [path, enabled, refetch]);

  return { data, loading, error, refetch };
}
