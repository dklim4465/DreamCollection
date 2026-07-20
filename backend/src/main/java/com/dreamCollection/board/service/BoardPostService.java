package com.dreamCollection.board.service;

import com.dreamCollection.board.dto.AuthorLevelBadgeInfo;
import com.dreamCollection.board.dto.BoardPostCreateRequestDTO;
import com.dreamCollection.board.dto.BoardPostDetailResponseDTO;
import com.dreamCollection.board.dto.BoardPostListResponseDTO;
import com.dreamCollection.board.dto.BoardPostUpdateRequestDTO;
import com.dreamCollection.board.entity.BoardPost;
import com.dreamCollection.board.exception.PostAccessDeniedException;
import com.dreamCollection.board.exception.PostNotFoundException;
import com.dreamCollection.board.repository.BoardCommentRepository;
import com.dreamCollection.board.repository.BoardLikeRepository;
import com.dreamCollection.board.repository.BoardPostRepository;
import com.dreamCollection.user.entity.User;
import com.dreamCollection.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class BoardPostService {

    private final BoardPostRepository boardPostRepository;
    private final UserRepository userRepository;
    private final BoardCommentRepository boardCommentRepository;
    private final BoardLikeRepository boardLikeRepository;
    private final BoardAuthorLevelBadgeService boardAuthorLevelBadgeService;

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

        User author = userRepository.findById(userId).orElse(null);
        String nickname = author != null ? author.getNickname() : "알 수 없음";
        String profileImageUrl = author != null ? author.getProfileImageUrl() : null;

        // 방금 작성한 글이라 좋아요는 항상 false
        return BoardPostDetailResponseDTO.from(saved, nickname, profileImageUrl, false);
    }

    @Transactional(readOnly = true)
    public Page<BoardPostListResponseDTO> getPostList(String category, Pageable pageable){
        Page<BoardPost> posts = "ALL".equalsIgnoreCase(category)
                ? boardPostRepository.findAllByOrderByCreatedAtDesc(pageable)
                : boardPostRepository.findByCategoryOrderByCreatedAtDesc(category, pageable);
        return posts.map(post -> {
            User author = userRepository.findById(post.getUserId()).orElse(null);
            String nickname = author != null ? author.getNickname() : "알 수 없음";
            String profileImageUrl = author != null ? author.getProfileImageUrl() : null;
            long commentCount = boardCommentRepository.countByPostId(post.getId());
            AuthorLevelBadgeInfo levelBadgeInfo = boardAuthorLevelBadgeService.resolve(post.getUserId());
            return BoardPostListResponseDTO.from(post, nickname, profileImageUrl, commentCount, levelBadgeInfo);
        });
    }

    @Transactional
    public BoardPostDetailResponseDTO getPostDetail(Long postId, Long userId){
        BoardPost post = findPostOrThrow(postId);
        post.increaseViewCount();

        User author = userRepository.findById(post.getUserId()).orElse(null);
        String nickname = author != null ? author.getNickname() : "알 수 없음";
        String profileImageUrl = author != null ? author.getProfileImageUrl() : null;
        boolean liked = userId != null && boardLikeRepository.existsByPostIdAndUserId(postId, userId);

        return BoardPostDetailResponseDTO.from(post, nickname, profileImageUrl, liked);
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

        User author = userRepository.findById(post.getUserId()).orElse(null);
        String nickname = author != null ? author.getNickname() : "알 수 없음";
        String profileImageUrl = author != null ? author.getProfileImageUrl() : null;
        boolean liked = boardLikeRepository.existsByPostIdAndUserId(postId, userId);

        return BoardPostDetailResponseDTO.from(post, nickname, profileImageUrl, liked);
    }

    @Transactional
    public void deletePost(long userId, Long postId){
        BoardPost post = findPostOrThrow(postId);
        validateOwner(post,userId);
        boardPostRepository.delete(post);
    }

    // 관리자 전용 삭제 — 작성자 검증 없이 어떤 게시글이든 지울 수 있다 (신고 처리 등)
    @Transactional
    public void adminDeletePost(Long postId){
        BoardPost post = findPostOrThrow(postId);
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
