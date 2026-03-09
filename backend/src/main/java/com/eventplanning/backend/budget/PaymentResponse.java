package com.eventplanning.backend.budget;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentResponse(
        Long id,
        Long budgetId,
        Long vendorId,
        BigDecimal amount,
        LocalDate paymentDate,
        PaymentStatus paymentStatus
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBudget().getId(),
                payment.getVendor().getId(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getPaymentStatus()
        );
    }
}