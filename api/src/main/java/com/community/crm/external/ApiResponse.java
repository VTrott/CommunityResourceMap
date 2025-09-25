package com.community.crm.external;

/**
 * Generic response wrapper for external API calls
 * Provides consistent error handling and response structure
 */
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String error;
    private int statusCode;
    private long executionTimeMs;
    
    public ApiResponse() {}
    
    public ApiResponse(boolean success, T data, String error, int statusCode, long executionTimeMs) {
        this.success = success;
        this.data = data;
        this.error = error;
        this.statusCode = statusCode;
        this.executionTimeMs = executionTimeMs;
    }
    
    public static <T> ApiResponseBuilder<T> builder() {
        return new ApiResponseBuilder<>();
    }
    
    public boolean isSuccess() {
        return success;
    }
    
    public boolean hasError() {
        return !success || error != null;
    }
    
    public T getData() {
        return data;
    }
    
    public String getError() {
        return error;
    }
    
    public int getStatusCode() {
        return statusCode;
    }
    
    public long getExecutionTimeMs() {
        return executionTimeMs;
    }
    
    public static class ApiResponseBuilder<T> {
        private boolean success;
        private T data;
        private String error;
        private int statusCode;
        private long executionTimeMs;
        
        public ApiResponseBuilder<T> success(boolean success) {
            this.success = success;
            return this;
        }
        
        public ApiResponseBuilder<T> data(T data) {
            this.data = data;
            return this;
        }
        
        public ApiResponseBuilder<T> error(String error) {
            this.error = error;
            return this;
        }
        
        public ApiResponseBuilder<T> statusCode(int statusCode) {
            this.statusCode = statusCode;
            return this;
        }
        
        public ApiResponseBuilder<T> executionTimeMs(long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
            return this;
        }
        
        public ApiResponse<T> build() {
            return new ApiResponse<>(success, data, error, statusCode, executionTimeMs);
        }
    }
}
