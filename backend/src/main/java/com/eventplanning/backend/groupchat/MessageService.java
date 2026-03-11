package com.eventplanning.backend.groupchat;

import com.eventplanning.backend.common.CurrentUserProvider;
import com.eventplanning.backend.common.NotFoundException;
import jakarta.transaction.Transactional;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class MessageService {

    private final GcMessageRepository gcMessageRepository;
    private final DmMessageRepository dmMessageRepository;
    private final DirectMessageRepository directMessageRepository;
    private final ForumRepository forumRepository;
    private final GroupChatRepository groupChatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final CurrentUserProvider currentUserProvider;

    public MessageService(GcMessageRepository gcMessageRepository, DmMessageRepository dmMessageRepository,
                        DirectMessageRepository directMessageRepository, ForumRepository forumRepository,
                        GroupChatRepository groupChatRepository, ChatMemberRepository chatMemberRepository,
                        CurrentUserProvider currentUserProvider) {
        this.gcMessageRepository = gcMessageRepository;
        this.dmMessageRepository = dmMessageRepository;
        this.directMessageRepository = directMessageRepository;
        this.forumRepository = forumRepository;
        this.groupChatRepository = groupChatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public GcMessageResponse sendGcMessage(SendGcMessageRequest request) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        Forum forum = forumRepository.findById(request.forumId())
                .orElseThrow(() -> new NotFoundException("Forum not found"));

        GroupChat groupChat = forum.getGroupChat();
        
        // Check if user is a member and has permission to send messages
        ChatMember member = chatMemberRepository.findByGroupChatIdAndUserId(groupChat.getId(), currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Not a member of this group chat"));

        GcMessage message = gcMessageRepository.save(GcMessage.builder()
                .forum(forum)
                .member(member)
                .message(request.message())
                .timestamp(Instant.now())
                .build());

        return GcMessageResponse.from(message);
    }

    public List<GcMessageResponse> getForumMessages(Long forumId) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        Forum forum = forumRepository.findById(forumId)
                .orElseThrow(() -> new NotFoundException("Forum not found"));

        GroupChat groupChat = forum.getGroupChat();
        
        // Check if user is a member and has permission to read messages
        chatMemberRepository.findByGroupChatIdAndUserId(groupChat.getId(), currentUser.getId())
                .orElseThrow(() -> new IllegalStateException("Not a member of this group chat"));

        List<GcMessage> messages = gcMessageRepository.findByForumIdOrderByTimestampAsc(forumId);
        return messages.stream().map(GcMessageResponse::from).toList();
    }

    public DirectMessageResponse createDirectMessage(CreateDirectMessageRequest request) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        ChatMember currentMember = chatMemberRepository.findById(currentUser.getId())
                .orElseThrow(() -> new NotFoundException("Chat member not found"));

        ChatMember targetMember = chatMemberRepository.findById(request.member2Id())
                .orElseThrow(() -> new NotFoundException("Target member not found"));

        // Check if both members are in the same group chat
        if (!currentMember.getGroupChat().getId().equals(targetMember.getGroupChat().getId())) {
            throw new IllegalStateException("Members must be in the same group chat");
        }

        DirectMessage directMessage = directMessageRepository.save(DirectMessage.builder()
                .groupChat(currentMember.getGroupChat())
                .member1(currentMember)
                .member2(targetMember)
                .createdAt(java.time.LocalDate.now())
                .build());

        return DirectMessageResponse.from(directMessage);
    }

    public DmMessageResponse sendDmMessage(SendDmMessageRequest request) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        DirectMessage directMessage = directMessageRepository.findById(request.dmId())
                .orElseThrow(() -> new NotFoundException("Direct message not found"));

        // Check if user is one of the participants
        if (!directMessage.getMember1().getUser().getId().equals(currentUser.getId()) &&
            !directMessage.getMember2().getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Not a participant in this direct message");
        }

        DmMessage message = dmMessageRepository.save(DmMessage.builder()
                .directMessage(directMessage)
                .user(currentUser)
                .message(request.message())
                .timestamp(Instant.now())
                .build());

        return DmMessageResponse.from(message);
    }

    public List<DmMessageResponse> getDirectMessages(Long dmId) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        DirectMessage directMessage = directMessageRepository.findById(dmId)
                .orElseThrow(() -> new NotFoundException("Direct message not found"));

        // Check if user is one of the participants
        if (!directMessage.getMember1().getUser().getId().equals(currentUser.getId()) &&
            !directMessage.getMember2().getUser().getId().equals(currentUser.getId())) {
            throw new IllegalStateException("Not a participant in this direct message");
        }

        List<DmMessage> messages = dmMessageRepository.findByDirectMessageIdAndUserId(dmId, currentUser.getId());
        return messages.stream().map(DmMessageResponse::from).toList();
    }
}
