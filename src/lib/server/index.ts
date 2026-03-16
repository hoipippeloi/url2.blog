export async function fail(status: number, data: Record<string, any>) {
  return {
    type: 'fail',
    status,
    data,
  };
}

export async function message<T extends Record<string, any>>(data: T, message: string) {
  return {
    type: 'success',
    status: 200,
    data,
    message,
  };
}
