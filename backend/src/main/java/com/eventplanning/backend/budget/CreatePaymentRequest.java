package com.eventplanning.backend.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

public record CreatePaymentRequest(
        @NotNull Long eventVendorId,
        @NotNull @DecimalMin("0.0") BigDecimal amount,
        @NotNull LocalDate paymentDate,
        @NotNull PaymentStatus paymentStatus,
        @NotBlank String recipientName
) {
}