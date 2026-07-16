package com.dreamCollection.board.service;

import com.dreamCollection.board.dto.BoardCommentCreateRequestDTO;
import com.dreamCollection.board.dto.BoardCommentResponseDTO;
import com.dreamCollection.board.dto.BoardCommentUpdateRequestDTO;
import com.dreamCollection.board.entity.BoardComment;
import com.dreamCollection.board.entity.BoardPost;
import com.dreamCollection.board.exception.CommentAccessDeniedException;
import com.dreamCollection.board.exception.CommentNotFoundException;
import com.dreamCollection.board.exception.PostNotFoundException;
import com.dreamCollection.board.repository.BoardCommentRepository;
import com.dreamCollection.board.repository.BoardNotificationRepository;
import com.dreamCollection.board.repository.BoardPostRepository;
import com.dreamCollection.social.entity.Notification;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardCommentRepository boardCommentRepository;
    private final BoardPostRepository boardPostRepository;
    private final BoardNotificationRepository boardNotificationRepository;
    private final UserRepository userRepository;

    @Transactional
    public BoardCommentResponseDTO createComment(Long userId, Long postId, BoardCommentCreateRequestDTO requestDTO){
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        BoardComment comment = BoardComment.builder()
                .postId(postId)
                .userId(userId)
                .parentCommentId(requestDTO.getParentCommentId())
                .content(requestDTO.getContent())
                .build();

        BoardComment saved = boardCommentRepository.save(comment);

        if (!post.getUserId().equals(userId)) {
            Notification notification = Notification.builder()
                    .userId(post.getUserId())
                    .type("BOARD_COMMENT")
                    .targetType("BOARD_POST")
                    .targetId(postId)
                    .content("내 게시글에 새 댓글이 달렸어요.")
                    .build();
            boardNotificationRepository.save(notification);
        }

        if (requestDTO.getParentCommentId() != null) {
            boardCommentRepository.findById(requestDTO.getParentCommentId())
                    .ifPresent(parentComment -> {
                        Long parentAuthorId = parentComment.getUserId();
                        boolean isSelfReply = parentAuthorId.equals(userId);
                        boolean alreadyNotifiedAsPostOwner = parentAuthorId.equals(post.getUserId());

                        if (!isSelfReply && !alreadyNotifiedAsPostOwner) {
                            Notification replyNotification = Notification.builder()
                                    .userId(parentAuthorId)
                                    .type("BOARD_REPLY")
                                    .targetType("BOARD_POST")
                                    .targetId(postId)
                                    .content("내 댓글에 답글이 달렸어요.")
                                    .build();
                            boardNotificationRepository.save(replyNotification);
                        }
                    });
        }

        User user = userRepository.findById(userId).orElse(null);
        return BoardCommentResponseDTO.from(
                saved,
                user != null ? user.getNickname() : "알 수 없음",
                user != null ? user.getProfileImageUrl() : null
        );
    }

    @Transactional(readOnly = true)
    public List<BoardCommentResponseDTO> getCommentList(Long postId){
        return boardCommentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
                .map(comment -> {
                    User user = userRepository.findById(comment.getUserId()).orElse(null);
                    return BoardCommentResponseDTO.from(
                            comment,
                            user != null ? user.getNickname() : "알 수 없음",
                            user != null ? user.getProfileImageUrl() : null
                    );
                })
                .toList();
    }

    @Transactional
    public void deleteComment(Long userId, Long postId, Long commentId){
        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(CommentNotFoundException::new);

        if(!comment.getPostId().equals(postId)){
            throw new CommentNotFoundException();
        }
        if(!comment.getUserId().equals(userId)){
            throw new CommentAccessDeniedException();
        }
        boardCommentRepository.delete(comment);
    }

    @Transactional
    public BoardCommentResponseDTO updateComment(Long userId, Long postId, Long commentId, BoardCommentUpdateRequestDTO requestDTO){
        BoardComment comment = boardCommentRepository.findById(commentId)
                .orElseThrow(CommentNotFoundException::new);

        if(!comment.getPostId().equals(postId)){
            throw new CommentNotFoundException();
        }
        if(!comment.getUserId().equals(userId)){
            throw new CommentAccessDeniedException();
        }

        comment.updateContent(requestDTO.getContent());

        User user = userRepository.findById(userId).orElse(null);
        return BoardCommentResponseDTO.from(
                comment,
                user != null ? user.getNickname() : "알 수 없음",
                user != null ? user.getProfileImageUrl() : null
        );
    }
}