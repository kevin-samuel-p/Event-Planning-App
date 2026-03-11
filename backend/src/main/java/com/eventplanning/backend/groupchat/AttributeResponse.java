package com.eventplanning.backend.groupchat;

public record AttributeResponse(
        Long id,
        String attributeName,
        String permissionsConfig,
        Long groupChatId
) {
    
    public static AttributeResponse from(Attribute attribute) {
        return new AttributeResponse(
                attribute.getId(),
                attribute.getAttributeName(),
                attribute.getPermissionsConfig(),
                attribute.getGroupChat().getId()
        );
    }
}
