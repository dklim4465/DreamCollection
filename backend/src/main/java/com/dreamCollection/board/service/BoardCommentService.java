package com.dreamCollection.board.service;

import com.dreamCollection.board.dto.BoardCommentCreateRequestDTO;
import com.dreamCollection.board.dto.BoardCommentResponseDTO;
import com.dreamCollection.board.dto.BoardCommentUpdateRequestDTO;
import com.dreamCollection.board.entity.BoardComment;
import com.dreamCollection.board.exception.CommentAccessDeniedException;
import com.dreamCollection.board.exception.CommentNotFoundException;
import com.dreamCollection.board.exception.PostNotFoundException;
import com.dreamCollection.board.repository.BoardCommentRepository;
import com.dreamCollection.board.repository.BoardPostRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardCommentService {

    private final BoardCommentRepository boardCommentRepository;
    private final BoardPostRepository boardPostRepository;

    @Transactional
    public BoardCommentResponseDTO createComment(Long userId, Long postId, BoardCommentCreateRequestDTO requestDTO){
        if(!boardPostRepository.existsById(postId)){
            throw new PostNotFoundException();
        }

        BoardComment comment = BoardComment.builder()
                .postId(postId)
                .userId(userId)
                .parentCommentId(requestDTO.getParentCommentId())
                .content(requestDTO.getContent())
                .build();

        BoardComment saved = boardCommentRepository.save(comment);
        return BoardCommentResponseDTO.from(saved);
}

    @Transactional(readOnly = true)
    public List<BoardCommentResponseDTO> getCommentList(Long postId){
    return boardCommentRepository.findByPostIdOrderByCreatedAtAsc(postId).stream()
            .map(BoardCommentResponseDTO::from)
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
        return BoardCommentResponseDTO.from(comment);
    }
}
