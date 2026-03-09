package com.eventplanning.backend.vendor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateEventVendorRequest(
        @NotNull Long vendorId,
        @NotBlank String serviceType,
        @NotNull ContractStatus contractStatus
) {
}