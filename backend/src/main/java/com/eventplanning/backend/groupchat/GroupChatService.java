package com.eventplanning.backend.groupchat;

import com.eventplanning.backend.common.CurrentUserProvider;
import com.eventplanning.backend.common.NotFoundException;
import com.eventplanning.backend.event.Event;
import com.eventplanning.backend.event.EventRepository;
import com.eventplanning.backend.groupchat.ChatMemberAttributeRepository;
import com.eventplanning.backend.user.Role;
import com.eventplanning.backend.user.User;
import com.eventplanning.backend.user.UserRepository;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Random;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class GroupChatService {

    private final GroupChatRepository groupChatRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final ChatMemberAttributeRepository attributeRepository;
    private final CurrentUserProvider currentUserProvider;

    public GroupChatService(GroupChatRepository groupChatRepository, EventRepository eventRepository,
                            UserRepository userRepository, ChatMemberRepository chatMemberRepository,
                            ChatMemberAttributeRepository attributeRepository, CurrentUserProvider currentUserProvider) {
        this.groupChatRepository = groupChatRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.attributeRepository = attributeRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public GroupChatResponse getEventGroupChat(Long eventId) {
        User currentUser = currentUserProvider.requireCurrentUser();
        
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found"));

        // Find or create group chat for this event
        GroupChat groupChat = groupChatRepository.findByEventId(eventId)
                .orElseGet(() -> {
                    // Create a new group chat if none exists
                    String joinCode = generateJoinCode();
                    GroupChat newGroupChat = groupChatRepository.save(GroupChat.builder()
                            .gcName(event.getEventName() + " Chat")
                            .joinCode(joinCode)
                            .createdByUser(currentUser)
                            .event(event)
                            .createdAt(java.time.LocalDate.now())
                            .build());
                    
                    // Auto-join the event organizer
                    chatMemberRepository.save(ChatMember.builder()
                            .groupChat(newGroupChat)
                            .user(currentUser)
                            .joinedAt(java.time.LocalDate.now())
                            .build());
                    
                    return newGroupChat;
                });

        // Ensure current user is a member
        if (chatMemberRepository.findByGroupChatIdAndUserId(groupChat.getId(), currentUser.getId()).isEmpty()) {
            chatMemberRepository.save(ChatMember.builder()
                    .groupChat(groupChat)
                    .user(currentUser)
                    .joinedAt(java.time.LocalDate.now())
                    .build());
        }

        return GroupChatResponse.from(groupChat);
    }

    public GroupChatResponse createGroupChat(CreateGroupChatRequest request) {
        User currentUser = currentUserProvider.requireCurrentUser();
        
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new NotFoundException("Event not found"));
        
        // Check if group chat already exists for this event
        groupChatRepository.findByEventId(event.getId())
                .ifPresent(existing -> {
                    throw new IllegalStateException("Group chat already exists for this event");
                });

        String joinCode = generateJoinCode();
        
        GroupChat groupChat = groupChatRepository.save(GroupChat.builder()
                .gcName(request.gcName())
                .joinCode(joinCode)
                .createdByUser(currentUser)
                .event(event)
                .createdAt(java.time.LocalDate.now())
                .build());

        return GroupChatResponse.from(groupChat);
    }

    public GroupChatResponse joinGroupChat(JoinGroupChatRequest request) {
        User currentUser = currentUserProvider.requireCurrentUser();
        
        GroupChat groupChat = groupChatRepository.findByJoinCode(request.joinCode())
                .orElseThrow(() -> new NotFoundException("Group chat not found"));

        // Check if already a member
        if (chatMemberRepository.findByGroupChatIdAndUserId(groupChat.getId(), currentUser.getId()).isPresent()) {
            throw new IllegalStateException("Already a member of this group chat");
        }

        ChatMember chatMember = chatMemberRepository.save(ChatMember.builder()
                .groupChat(groupChat)
                .user(currentUser)
                .joinedAt(java.time.LocalDate.now())
                .build());

        return GroupChatResponse.from(groupChat);
    }

    public List<ChatMemberResponse> getGroupChatMembers(Long groupChatId) {
        User currentUser = currentUserProvider.requireCurrentUser();
        
        GroupChat groupChat = groupChatRepository.findById(groupChatId)
                .orElseThrow(() -> new NotFoundException("Group chat not found"));

        // Check if user is a member
        if (!chatMemberRepository.findByGroupChatIdAndUserId(groupChatId, currentUser.getId()).isPresent()) {
            throw new IllegalStateException("Not a member of this group chat");
        }

        List<ChatMember> members = chatMemberRepository.findByGroupChatId(groupChatId);
        return members.stream().map(ChatMemberResponse::from).toList();
    }

    private String generateJoinCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code = new StringBuilder();
        Random random = new Random();
        
        for (int i = 0; i < 6; i++) {
            code.append(chars.charAt(random.nextInt(chars.length())));
        }
        
        return code.toString();
    }
}
