export interface GenericResponse<T> {
  status: 'ok' | 'error';
  message: string;
  data: T;
}
