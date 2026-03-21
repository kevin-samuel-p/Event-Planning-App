package com.eventplanning.backend.budget;

import java.math.BigDecimal;
import java.time.LocalDate;

public record PaymentResponse(
        Long id,
        Long budgetId,
        Long eventVendorId,
        BigDecimal amount,
        LocalDate paymentDate,
        PaymentStatus paymentStatus,
        String recipientName
) {
    public static PaymentResponse from(Payment payment) {
        return new PaymentResponse(
                payment.getId(),
                payment.getBudget().getId(),
                payment.getEventVendor().getId(),
                payment.getAmount(),
                payment.getPaymentDate(),
                payment.getPaymentStatus(),
                payment.getRecipientName()
        );
    }
}