package com.eventplanning.backend.groupchat;

import com.eventplanning.backend.common.CurrentUserProvider;
import com.eventplanning.backend.common.NotFoundException;
import jakarta.transaction.Transactional;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
@Transactional
public class ForumService {

    private final ForumRepository forumRepository;
    private final GroupChatRepository groupChatRepository;
    private final ChatMemberRepository chatMemberRepository;
    private final CurrentUserProvider currentUserProvider;

    public ForumService(ForumRepository forumRepository, GroupChatRepository groupChatRepository,
                      ChatMemberRepository chatMemberRepository, CurrentUserProvider currentUserProvider) {
        this.forumRepository = forumRepository;
        this.groupChatRepository = groupChatRepository;
        this.chatMemberRepository = chatMemberRepository;
        this.currentUserProvider = currentUserProvider;
    }

    public ForumResponse createForum(CreateForumRequest request) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        GroupChat groupChat = groupChatRepository.findById(request.groupChatId())
                .orElseThrow(() -> new NotFoundException("Group chat not found"));

        // Check if user has permission to create forums (via attributes)
        // For now, we'll assume group chat creator can create forums
        
        Forum forum = forumRepository.save(Forum.builder()
                .forumName(request.forumName())
                .createdByUser(currentUser)
                .groupChat(groupChat)
                .createdAt(java.time.LocalDate.now())
                .build());

        return ForumResponse.from(forum);
    }

    public List<ForumResponse> getGroupChatForums(Long groupChatId) {
        var currentUser = currentUserProvider.requireCurrentUser();
        
        GroupChat groupChat = groupChatRepository.findById(groupChatId)
                .orElseThrow(() -> new NotFoundException("Group chat not found"));

        // Check if user is a member
        if (!chatMemberRepository.findByGroupChatIdAndUserId(groupChatId, currentUser.getId()).isPresent()) {
            throw new IllegalStateException("Not a member of this group chat");
        }

        List<Forum> forums = forumRepository.findByGroupChatId(groupChatId);
        return forums.stream().map(ForumResponse::from).toList();
    }
}
