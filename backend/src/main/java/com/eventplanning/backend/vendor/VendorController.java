package com.eventplanning.backend.vendor;

import com.eventplanning.backend.event.EventWorkflowService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class VendorController {

    private final EventWorkflowService eventWorkflowService;

    public VendorController(EventWorkflowService eventWorkflowService) {
        this.eventWorkflowService = eventWorkflowService;
    }

    @GetMapping("/vendor-directory")
    public List<VendorResponse> getAllVendors() {
        return eventWorkflowService.getAllVendors();
    }

    @GetMapping("/vendor-test")
    public String testEndpoint() {
        return "Vendor controller is working!";
    }

    @GetMapping("/simple-test")
    public String simpleTest() {
        return "API is working!";
    }
}
