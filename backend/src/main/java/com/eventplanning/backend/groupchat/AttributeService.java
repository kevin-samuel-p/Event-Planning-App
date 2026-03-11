package com.eventplanning.backend.groupchat;

import com.eventplanning.backend.common.CurrentUserProvider;
import com.eventplanning.backend.common.NotFoundException;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class AttributeService {

    private final AttributeRepository attributeRepository;
    private final GroupChatRepository groupChatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ChatMemberAttributeRepository chatMemberAttributeRepository;
    private final CurrentUserProvider currentUserProvider;

    public AttributeService(AttributeRepository attributeRepository, GroupChatRepository groupChatRepository,
                          ChatMemberRepository chatMemberRepository,
                          ChatMemberAttributeRepository chatMemberAttributeRepository,
                          CurrentUserProvider currentUserProvider) {
        this.attributeRepository = attributeRepository;
        this.groupChatRepository = groupChatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.chatMemberAttributeRepository = chatMemberAttributeRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public AttributeResponse createAttribute(CreateAttributeRequest request) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        GroupChat groupChat = groupChatRepository.findById(request.groupChatId())
                .orElseThrow(() -> new NotFoundException("Group chat not found"));

        // Check if user has admin privileges (this would be implemented via attribute checking)
        // For now, we'll assume the group chat creator can create attributes
        
        Attribute attribute = attributeRepository.save(Attribute.builder()
                .attributeName(request.attributeName())
                .permissionsConfig(request.permissionsConfig())
                .groupChat(groupChat)
                .build());

        return AttributeResponse.from(attribute);
    }

    public void assignAttributeToMember(AssignAttributeRequest request) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        ChatMember member = chatMemberRepository.findById(request.memberId())
                .orElseThrow(() -> new NotFoundException("Chat member not found"));
        
        Attribute attribute = attributeRepository.findById(request.attributeId())
                .orElseThrow(() -> new NotFoundException("Attribute not found"));

        // Check if user has permission to assign attributes
        // This would be implemented via attribute checking
        
        chatMemberAttributeRepository.save(ChatMemberAttribute.builder()
                .chatMember(member)
                .attribute(attribute)
                .build());
    }

    public List<AttributeResponse> getGroupChatAttributes(Long groupChatId) {
        List<Attribute> attributes = attributeRepository.findByGroupChatId(groupChatId);
        return attributes.stream().map(AttributeResponse::from).toList();
    }
}
