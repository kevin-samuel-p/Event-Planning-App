package com.eventplanning.backend.groupchat;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/group-chats")
public class GroupChatController {

    private final GroupChatService groupChatService;

    public GroupChatController(GroupChatService groupChatService) {
        this.groupChatService = groupChatService;
    }

    @GetMapping("/event/{eventId}")
    public GroupChatResponse getEventGroupChat(@PathVariable Long eventId) {
        return groupChatService.getEventGroupChat(eventId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public GroupChatResponse createGroupChat(@Valid @RequestBody CreateGroupChatRequest request) {
        return groupChatService.createGroupChat(request);
    }

    @PostMapping("/join")
    public GroupChatResponse joinGroupChat(@Valid @RequestBody JoinGroupChatRequest request) {
        return groupChatService.joinGroupChat(request);
    }

    @GetMapping("/{groupChatId}/members")
    public List<ChatMemberResponse> getGroupChatMembers(@PathVariable Long groupChatId) {
        return groupChatService.getGroupChatMembers(groupChatId);
    }
}
