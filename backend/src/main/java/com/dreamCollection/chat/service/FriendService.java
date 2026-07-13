package com.dreamCollection.chat.service;

import com.dreamCollection.chat.dto.FriendRequestResponseDTO;
import com.dreamCollection.chat.dto.FriendResponseDTO;
import com.dreamCollection.chat.dto.UserSearchResponseDTO;
import com.dreamCollection.chat.entity.Friendship;
import com.dreamCollection.chat.exception.DuplicateFriendRequestException;
import com.dreamCollection.chat.exception.FriendUserNotFoundException;
import com.dreamCollection.chat.exception.FriendshipNotFoundException;
import com.dreamCollection.chat.exception.SelfFriendRequestException;
import com.dreamCollection.chat.repository.FriendshipRepository;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<UserSearchResponseDTO> searchUsers(String keyword, Long myUserId) {
        List<User> users = userRepository
                .findByEmailContainingOrNicknameContaining(keyword, keyword, PageRequest.of(0, 20))
                .getContent();

        return users.stream()
                .filter(u -> !u.getId().equals(myUserId))
                .map(u -> new UserSearchResponseDTO(
                        u.getId(),
                        u.getNickname(),
                        u.getProfileImageUrl(),
                        resolveStatus(myUserId, u.getId())
                ))
                .toList();
    }

    private String resolveStatus(Long myUserId, Long otherUserId) {
        return friendshipRepository.findBetweenUsers(myUserId, otherUserId)
                .map(f -> {
                    if ("ACCEPTED".equals(f.getStatus())) return "FRIEND";
                    if ("PENDING".equals(f.getStatus())) {
                        return f.getRequesterId().equals(myUserId) ? "PENDING_SENT" : "PENDING_RECEIVED";
                    }
                    return "NONE";
                })
                .orElse("NONE");
    }

    @Transactional
    public void sendRequest(Long requesterId, Long receiverId) {
        if (requesterId.equals(receiverId)) {
            throw new SelfFriendRequestException();
        }
        userRepository.findById(receiverId).orElseThrow(FriendUserNotFoundException::new);

        friendshipRepository.findBetweenUsers(requesterId, receiverId).ifPresent(f -> {
            throw new DuplicateFriendRequestException();
        });

        friendshipRepository.save(
                Friendship.builder()
                        .requesterId(requesterId)
                        .receiverId(receiverId)
                        .build()
        );
    }

    @Transactional(readOnly = true)
    public List<FriendRequestResponseDTO> getReceivedRequests(Long userId) {
        return friendshipRepository.findByReceiverIdAndStatus(userId, "PENDING").stream()
                .map(f -> {
                    User requester = userRepository.findById(f.getRequesterId())
                            .orElseThrow(FriendUserNotFoundException::new);
                    return new FriendRequestResponseDTO(
                            f.getId(),
                            requester.getId(),
                            requester.getNickname(),
                            requester.getProfileImageUrl(),
                            f.getCreatedAt()
                    );
                })
                .toList();
    }

    @Transactional
    public void decideRequest(Long userId, Long requestId, String decision) {
        Friendship friendship = friendshipRepository.findById(requestId)
                .orElseThrow(FriendshipNotFoundException::new);

        if (!friendship.getReceiverId().equals(userId)) {
            throw new FriendshipNotFoundException();
        }

        friendship.setStatus("ACCEPT".equals(decision) ? "ACCEPTED" : "REJECTED");
    }

    @Transactional(readOnly = true)
    public List<FriendResponseDTO> getMyFriends(Long userId) {
        return friendshipRepository.findAcceptedFriendships(userId).stream()
                .map(f -> {
                    Long otherUserId = f.getRequesterId().equals(userId) ? f.getReceiverId() : f.getRequesterId();
                    User other = userRepository.findById(otherUserId)
                            .orElseThrow(FriendUserNotFoundException::new);
                    return new FriendResponseDTO(f.getId(), other.getId(), other.getNickname(), other.getProfileImageUrl());
                })
                .toList();
    }

    @Transactional
    public void deleteFriend(Long userId, Long friendUserId) {
        Friendship friendship = friendshipRepository.findBetweenUsers(userId, friendUserId)
                .orElseThrow(FriendshipNotFoundException::new);
        friendshipRepository.delete(friendship);
    }
}