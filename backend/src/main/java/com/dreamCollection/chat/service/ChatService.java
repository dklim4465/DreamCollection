package com.dreamCollection.chat.service;

import com.dreamCollection.chat.dto.ChatMessageResponseDTO;
import com.dreamCollection.chat.dto.ChatMessageSendRequestDTO;
import com.dreamCollection.chat.dto.ChatRoomResponseDTO;
import com.dreamCollection.chat.entity.ChatMessage;
import com.dreamCollection.chat.entity.ChatRoom;
import com.dreamCollection.chat.entity.ChatRoomMember;
import com.dreamCollection.chat.exception.ChatRoomAccessDeniedException;
import com.dreamCollection.chat.exception.ChatRoomNotFoundException;
import com.dreamCollection.chat.exception.FriendshipNotFoundException;
import com.dreamCollection.chat.repository.ChatMessageRepository;
import com.dreamCollection.chat.repository.ChatRoomMemberRepository;
import com.dreamCollection.chat.repository.ChatRoomRepository;
import com.dreamCollection.chat.repository.FriendshipRepository;
import com.dreamCollection.mate.entity.MatePost;
import com.dreamCollection.mate.excpetion.MatePostNotFoundException;
import com.dreamCollection.mate.repository.MatePostRepository;
import com.dreamCollection.mate.repository.MateRequestRepository;
import com.dreamCollection.social.repository.NotificationRepository;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
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
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Transactional
    public Long getOrCreateRoom(Long matePostId, Long userId) {
        MatePost post = matePostRepository.findById(matePostId)
                .orElseThrow(MatePostNotFoundException::new);

        boolean isHost = post.getUserId().equals(userId);
        boolean isRequester = mateRequestRepository.existsByMatePostIdAndRequesterId(matePostId, userId);

        if (!isHost && !isRequester) {
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

    @Transactional
    public Long getOrCreateDmRoom(Long myUserId, Long friendUserId) {
        boolean isFriend = friendshipRepository.findBetweenUsers(myUserId, friendUserId)
                .map(f -> "ACCEPTED".equals(f.getStatus()))
                .orElse(false);

        if (!isFriend) {
            throw new FriendshipNotFoundException();
        }

        return chatRoomRepository.findDmRoomIdBetween(myUserId, friendUserId)
                .orElseGet(() -> {
                    MatePost hiddenPost = matePostRepository.save(
                            MatePost.builder()
                                    .userId(myUserId)
                                    .destination("DM")
                                    .startDate(LocalDate.now())
                                    .endDate(LocalDate.now())
                                    .content("1:1 대화")
                                    .recruitCount(2)
                                    .build()
                    );
                    hiddenPost.setStatus("DM");

                    ChatRoom room = chatRoomRepository.save(
                            ChatRoom.builder().matePostId(hiddenPost.getId()).build()
                    );
                    chatRoomMemberRepository.save(
                            ChatRoomMember.builder().roomId(room.getId()).userId(myUserId).build()
                    );
                    chatRoomMemberRepository.save(
                            ChatRoomMember.builder().roomId(room.getId()).userId(friendUserId).build()
                    );
                    return room.getId();
                });
    }

    @Transactional(readOnly = true)
    public List<ChatRoomResponseDTO> getMyRooms(Long userId) {
        List<ChatRoomMember> myMemberships = chatRoomMemberRepository.findByUserId(userId);

        return myMemberships.stream()
                .map(membership -> {
                    Long roomId = membership.getRoomId();
                    ChatRoom room = chatRoomRepository.findById(roomId)
                            .orElseThrow(ChatRoomNotFoundException::new);

                    MatePost matePost = matePostRepository.findById(room.getMatePostId())
                            .orElseThrow(MatePostNotFoundException::new);

                    List<Long> memberIds = chatRoomMemberRepository.findByRoomId(roomId).stream()
                            .map(ChatRoomMember::getUserId)
                            .toList();

                    String roomTitle = resolveRoomTitle(matePost, userId, memberIds);

                    List<ChatMessage> messages = chatMessageRepository.findByRoomIdOrderBySentAtAsc(roomId);
                    ChatMessage last = messages.isEmpty() ? null : messages.get(messages.size() - 1);

                    LocalDateTime since = membership.getLastReadAt() != null
                            ? membership.getLastReadAt()
                            : LocalDateTime.of(1970, 1, 1, 0, 0);
                    long unreadCount = chatMessageRepository.countByRoomIdAndSentAtAfterAndSenderIdNot(roomId, since, userId);

                    return new ChatRoomResponseDTO(
                            roomId,
                            room.getMatePostId(),
                            roomTitle,
                            memberIds,
                            last != null ? last.getContent() : null,
                            last != null ? last.getSentAt() : null,
                            unreadCount
                    );
                })
                .toList();
    }

    private String resolveRoomTitle(MatePost matePost, Long myUserId, List<Long> memberIds) {
        if ("DM".equals(matePost.getStatus())) {
            return memberIds.stream()
                    .filter(id -> !id.equals(myUserId))
                    .findFirst()
                    .flatMap(userRepository::findById)
                    .map(User::getNickname)
                    .orElse("1:1 채팅");
        }
        return matePost.getDestination();
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

        return ChatMessageResponseDTO.from(saved);
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