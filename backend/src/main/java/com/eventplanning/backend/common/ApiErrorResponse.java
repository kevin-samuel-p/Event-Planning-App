package com.eventplanning.backend.common;

import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;

public record ApiErrorResponse(Instant timestamp, int status, String error, String message, String path) {
    public static ApiErrorResponse of(int status, String error, String message, HttpServletRequest request) {
        return new ApiErrorResponse(Instant.now(), status, error, message, request.getRequestURI());
    }
}