package com.eventplanning.backend.vendor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateEventVendorRequest(
        @NotBlank String serviceType,
        @NotNull ContractStatus contractStatus
) {
}
