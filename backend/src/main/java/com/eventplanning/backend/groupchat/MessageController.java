package com.eventplanning.backend.groupchat;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    @PostMapping("/gc")
    @ResponseStatus(HttpStatus.CREATED)
    public GcMessageResponse sendGcMessage(@Valid @RequestBody SendGcMessageRequest request) {
        return messageService.sendGcMessage(request);
    }

    @GetMapping("/gc/forum/{forumId}")
    public List<GcMessageResponse> getForumMessages(@PathVariable Long forumId) {
        return messageService.getForumMessages(forumId);
    }

    @DeleteMapping("/gc/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGcMessage(@PathVariable Long messageId) {
        System.out.println("DELETE endpoint called for message ID: " + messageId);
        messageService.deleteGcMessage(messageId);
    }

    @PostMapping("/direct")
    @ResponseStatus(HttpStatus.CREATED)
    public DirectMessageResponse createDirectMessage(@Valid @RequestBody CreateDirectMessageRequest request) {
        return messageService.createDirectMessage(request);
    }

    @PostMapping("/dm")
    @ResponseStatus(HttpStatus.CREATED)
    public DmMessageResponse sendDmMessage(@Valid @RequestBody SendDmMessageRequest request) {
        return messageService.sendDmMessage(request);
    }

    @GetMapping("/dm/{dmId}")
    public List<DmMessageResponse> getDirectMessages(@PathVariable Long dmId) {
        return messageService.getDirectMessages(dmId);
    }
}
