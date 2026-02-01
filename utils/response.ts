export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

export const createSuccessResponse = <T>(data: T, message: string = 'Success', statusCode: number = 200): ApiResponse<T> => {
  return {
    success: true,
    message,
    data,
    statusCode
  };
};

export const createErrorResponse = (message: string, statusCode: number = 400, error?: string): ApiResponse => {
  return {
    success: false,
    message,
    error,
    statusCode
  };
};

export const createNotFoundResponse = (message: string = 'Resource not found'): ApiResponse => {
  return createErrorResponse(message, 404);
};

export const createUnauthorizedResponse = (message: string = 'Unauthorized'): ApiResponse => {
  return createErrorResponse(message, 401);
};

export const createForbiddenResponse = (message: string = 'Forbidden'): ApiResponse => {
  return createErrorResponse(message, 403);
};

export const createInternalServerErrorResponse = (message: string = 'Internal server error', error?: string): ApiResponse => {
  return createErrorResponse(message, 500, error);
};
