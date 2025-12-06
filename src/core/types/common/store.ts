export interface GenericStore<T> {
  data: T;
  setData: (data: T) => void;
  updateField: (key: keyof T, value: any) => void;
  reset: () => void;
}
