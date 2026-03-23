package com.eventplanning.backend.groupchat;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/forums")
public class ForumController {

    private final ForumService forumService;

    public ForumController(ForumService forumService) {
        this.forumService = forumService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ForumResponse createForum(@Valid @RequestBody CreateForumRequest request) {
        return forumService.createForum(request);
    }

    @GetMapping("/group-chat/{groupChatId}")
    public List<ForumResponse> getGroupChatForums(@PathVariable Long groupChatId) {
        return forumService.getGroupChatForums(groupChatId);
    }

    @PostMapping("/{forumId}/members")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMemberResponse addMemberToForum(@PathVariable Long forumId, @RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        return forumService.addMemberToForum(forumId, userId);
    }
}
