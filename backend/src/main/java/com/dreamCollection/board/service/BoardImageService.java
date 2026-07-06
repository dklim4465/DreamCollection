package com.dreamCollection.board.service;

import com.dreamCollection.board.dto.BoardImageCreateRequestDTO;
import com.dreamCollection.board.dto.BoardImageResponseDTO;
import com.dreamCollection.board.entity.BoardImage;
import com.dreamCollection.board.entity.BoardPost;
import com.dreamCollection.board.exception.BoardImageNotFoundException;
import com.dreamCollection.board.exception.PostAccessDeniedException;
import com.dreamCollection.board.exception.PostNotFoundException;
import com.dreamCollection.board.repository.BoardImageRepository;
import com.dreamCollection.board.repository.BoardPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BoardImageService {

    private final BoardImageRepository boardImageRepository;
    private final BoardPostRepository boardPostRepository;

    @Transactional
    public BoardImageResponseDTO addImage(Long userId, Long postId, BoardImageCreateRequestDTO requestDTO) {
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);
        if (!post.getUserId().equals(userId)) {
            throw new PostAccessDeniedException();
        }

        BoardImage image = BoardImage.builder()
                .postId(postId)
                .imageUrl(requestDTO.getImageUrl())
                .orderNo(requestDTO.getOrderNo())
                .build();

        BoardImage saved = boardImageRepository.save(image);
        return BoardImageResponseDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public List<BoardImageResponseDTO> getImages(Long postId) {
        if (!boardPostRepository.existsById(postId)) {
            throw new PostNotFoundException();
        }
        return boardImageRepository.findByPostIdOrderByOrderNoAsc(postId).stream()
                .map(BoardImageResponseDTO::from)
                .toList();
    }

    @Transactional
    public void deleteImage(Long userId, Long postId, Long imageId) {
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);
        if (!post.getUserId().equals(userId)) {
            throw new PostAccessDeniedException();
        }

        BoardImage image = boardImageRepository.findById(imageId)
                .orElseThrow(BoardImageNotFoundException::new);
        if (!image.getPostId().equals(postId)) {
            throw new BoardImageNotFoundException();
        }
        boardImageRepository.delete(image);
    }
}