package com.dreamCollection.board.service;


import com.dreamCollection.board.dto.BoardLikeResponseDTO;
import com.dreamCollection.board.entity.BoardLike;
import com.dreamCollection.board.entity.BoardPost;
import com.dreamCollection.board.exception.PostNotFoundException;
import com.dreamCollection.board.repository.BoardLikeRepository;
import com.dreamCollection.board.repository.BoardPostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BoardLikeService {

    private final BoardLikeRepository boardLikeRepository;
    private final BoardPostRepository boardPostRepository;

    @Transactional
    public BoardLikeResponseDTO toggleLike(Long userId, Long postId){
        BoardPost post = boardPostRepository.findById(postId)
                .orElseThrow(PostNotFoundException::new);

        boolean alreadyLiked = boardLikeRepository.existsByPostIdAndUserId(postId,userId);

        if(alreadyLiked){
            boardLikeRepository.deleteByPostIdAndUserId(postId,userId);
            post.decreaseLikeCount();
            return new BoardLikeResponseDTO(false,post.getLikeCount());
        } else{
            BoardLike like = BoardLike.builder()
                    .postId(postId)
                    .userId(userId)
                    .build();
            boardLikeRepository.save(like);
            post.increaseViewCount();
            return new BoardLikeResponseDTO(true,post.getLikeCount());
        }
    }
}
