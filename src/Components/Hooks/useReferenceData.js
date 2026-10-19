import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchReferenceList } from "../../store/features/reference/referenceSlice";

const EMPTY = { items: [], loading: false, error: null };


export const useReferenceList = (name) => {
  const dispatch = useDispatch();
  const list = useSelector((state) => state.Reference?.lists?.[name]) || EMPTY;

  useEffect(() => {
    dispatch(fetchReferenceList({ name }));
  }, [dispatch, name]);

  return {
    items: list.items,
    // "loading" only while there is nothing to show yet, so a refresh never blanks the dropdown
    loading: list.loading && list.items.length === 0,
    error: list.error,
    refresh: () => dispatch(fetchReferenceList({ name, force: true })),
  };
};

export default useReferenceList;