package com.dreamCollection.board.service;

import com.dreamCollection.board.dto.BoardPostCreateRequestDTO;
import com.dreamCollection.board.dto.BoardPostDetailResponseDTO;
import com.dreamCollection.board.dto.BoardPostListResponseDTO;
import com.dreamCollection.board.dto.BoardPostUpdateRequestDTO;
import com.dreamCollection.board.entity.BoardPost;
import com.dreamCollection.board.exception.PostAccessDeniedException;
import com.dreamCollection.board.exception.PostNotFoundException;
import com.dreamCollection.board.repository.BoardPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class BoardPostService {

    private final BoardPostRepository boardPostRepository;

    @Transactional
    public BoardPostDetailResponseDTO createPost(Long userId, BoardPostCreateRequestDTO requestDTO){
        BoardPost post = BoardPost.builder()
                .userId(userId)
                .category(requestDTO.getCategory())
                .title(requestDTO.getTitle())
                .content(requestDTO.getContent())
                .price(requestDTO.getPrice())
                .build();

        BoardPost saved = boardPostRepository.save(post);
        return BoardPostDetailResponseDTO.from(saved);
    }

    @Transactional(readOnly = true)
    public Page<BoardPostListResponseDTO> getPostList(String category, Pageable pageable){
        Page<BoardPost> posts = boardPostRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        return posts.map(BoardPostListResponseDTO::from);
    }

    @Transactional
    public BoardPostDetailResponseDTO getPostDetail(Long postId){
        BoardPost post = findPostOrThrow(postId);
        post.increaseViewCount();
        return BoardPostDetailResponseDTO.from(post);
    }

    @Transactional
    public BoardPostDetailResponseDTO updatePost(Long userId, Long postId, BoardPostUpdateRequestDTO requestDTO){
        BoardPost post = findPostOrThrow(postId);
        validateOwner(post, userId);

        post.setTitle(requestDTO.getTitle());
        post.setContent(requestDTO.getContent());
        post.setPrice(requestDTO.getPrice());
        if(requestDTO.getTradeStatus()!=null){
            post.setTradeStatus(requestDTO.getTradeStatus());
        }

        return BoardPostDetailResponseDTO.from(post);
    }

    @Transactional
    public void deletePost(long userId, Long postId){
        BoardPost post = findPostOrThrow(postId);
        validateOwner(post,userId);
        boardPostRepository.delete(post);
    }

    private BoardPost findPostOrThrow(Long postId){
        return boardPostRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);
    }

    private void validateOwner(BoardPost post, Long userId){
        if(!post.getUserId().equals(userId)){
            throw new PostAccessDeniedException();
        }
    }

}
