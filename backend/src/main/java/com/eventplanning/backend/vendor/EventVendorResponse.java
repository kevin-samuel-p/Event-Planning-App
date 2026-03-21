package com.eventplanning.backend.vendor;

public record EventVendorResponse(Long id, Long eventId, Long vendorId, String vendorName, String vendorEmail, String vendorPhone, String serviceType, ContractStatus contractStatus) {
    public static EventVendorResponse from(EventVendor eventVendor) {
        return new EventVendorResponse(
                eventVendor.getId(),
                eventVendor.getEvent().getId(),
                eventVendor.getVendor().getId(),
                eventVendor.getVendor().getName(),
                eventVendor.getVendor().getEmail(),
                eventVendor.getVendor().getPhone(),
                eventVendor.getServiceType(),
                eventVendor.getContractStatus()
        );
    }
}