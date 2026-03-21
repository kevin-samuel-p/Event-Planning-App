package com.eventplanning.backend.vendor;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EventVendorRepository extends JpaRepository<EventVendor, Long> {
    List<EventVendor> findByEventId(Long eventId);
    List<EventVendor> findByVendorId(Long vendorId);
}