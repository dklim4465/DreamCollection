package com.dreamCollection.chat.service;

import com.dreamCollection.chat.dto.ChatMessageResponseDTO;
import com.dreamCollection.chat.dto.ChatMessageSendRequestDTO;
import com.dreamCollection.chat.dto.ChatRoomResponseDTO;
import com.dreamCollection.chat.dto.NotificationResponseDTO;
import com.dreamCollection.chat.entity.ChatMessage;
import com.dreamCollection.chat.entity.ChatRoom;
import com.dreamCollection.chat.entity.ChatRoomMember;
import com.dreamCollection.chat.exception.ChatRoomAccessDeniedException;
import com.dreamCollection.chat.exception.ChatRoomNotFoundException;
import com.dreamCollection.chat.repository.ChatMessageRepository;
import com.dreamCollection.chat.repository.ChatRoomMemberRepository;
import com.dreamCollection.chat.repository.ChatRoomRepository;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.excpetion.MatePostNotFoundException;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.mate.repository.MateRequestRepository;
import com.dreamCollection.social.entity.Notification;
import com.dreamCollection.social.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatRoomMemberRepository chatRoomMemberRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final MatePostRepository matePostRepository;
    private final MateRequestRepository mateRequestRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Long getOrCreateRoom(Long matePostId, Long userId) {
        MatePost post = matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);

        boolean isHost = post.getUserId().equals(userId);
        boolean isAcceptedRequester = mateRequestRepository.findByMatePostId(matePostId).stream()
                .anyMatch(r -> r.getRequesterId().equals(userId) && "ACCEPTED".equals(r.getStatus()));

        if (!isHost && !isAcceptedRequester) {
            throw new ChatRoomAccessDeniedException();
        }

        ChatRoom room = chatRoomRepository.findByMatePostId(matePostId)
                .orElseGet(() -> chatRoomRepository.save(ChatRoom.builder().matePostId(matePostId).build()));

        chatRoomMemberRepository.findByRoomIdAndUserId(room.getId(), userId)
                .orElseGet(() -> chatRoomMemberRepository.save(
                        ChatRoomMember.builder().roomId(room.getId()).userId(userId).build()
                ));

        return room.getId();
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponseDTO> getMyRooms(Long userId) {
        List<ChatRoomMember> myMemberships = chatRoomMemberRepository.findByUserId(userId);

        return myMemberships.stream()
                .map(membership -> {
                    Long roomId = membership.getRoomId();
                    ChatRoom room = chatRoomRepository.findById(roomId)
                            .orElseThrow(ChatRoomNotFoundException::new);

                    List<Long> memberIds = chatRoomMemberRepository.findByRoomId(roomId).stream()
                            .map(ChatRoomMember::getUserId)
                            .toList();

                    List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId);
                    ChatMessage last = messages.isEmpty() ? null : messages.get(messages.size() - 1);

                    LocalDateTime since = membership.getLastReadAt() != null
                            ? membership.getLastReadAt()
                            : LocalDateTime.of(1970, 1, 1, 0, 0);
                    long unreadCount = chatMessageRepository.countByRoomIdAndSentAtAfter(roomId, since);

                    return new ChatRoomResponseDTO(
                            roomId,
                            room.getMatePostId(),
                            memberIds,
                            last != null ? last.getContent() : null,
                            last != null ? last.getSentAt() : null,
                            unreadCount
                    );
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponseDTO> getMessages(Long roomId, Long userId) {
        validateMember(roomId, userId);

        return chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId).stream()
                .map(ChatMessageResponseDTO::from)
                .toList();
    }

    @Transactional
    public ChatMessageResponseDTO sendMessage(Long roomId, Long senderId, ChatMessageSendRequestDTO request) {
        validateMember(roomId, senderId);

        ChatMessage message = ChatMessage.builder()
                .roomId(roomId)
                .senderId(senderId)
                .content(request.content())
                .messageType(request.messageType())
                .build();

        ChatMessage saved = chatMessageRepository.save(message);
        notifyOtherMembers(roomId, senderId, saved);

        return ChatMessageResponseDTO.from(saved);
    }

    private void notifyOtherMembers(Long roomId, Long senderId, ChatMessage message) {
        String preview = "IMAGE".equals(message.getMessageType())
                ? "사진을 보냈습니다."
                : message.getContent();

        chatRoomMemberRepository.findByRoomId(roomId).stream()
                .map(ChatRoomMember::getUserId)
                .filter(memberId -> !memberId.equals(senderId))
                .forEach(memberId -> {
                    Notification notification = notificationRepository.save(
                            Notification.builder()
                                    .userId(memberId)
                                    .type("CHAT_MESSAGE")
                                    .targetType("CHAT_ROOM")
                                    .targetId(roomId)
                                    .content(preview)
                                    .build()
                    );

                    messagingTemplate.convertAndSendToUser(
                            String.valueOf(memberId),
                            "/queue/notifications",
                            NotificationResponseDTO.from(notification)
                    );
                });
    }

    @Transactional
    public void markRead(Long roomId, Long userId) {
        ChatRoomMember member = chatRoomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(ChatRoomAccessDeniedException::new);
        member.markRead();
    }

    private void validateMember(Long roomId, Long userId) {
        chatRoomRepository.findById(roomId).orElseThrow(ChatRoomNotFoundException::new);
        chatRoomMemberRepository.findByRoomIdAndUserId(roomId, userId)
                .orElseThrow(ChatRoomAccessDeniedException::new);
    }
}