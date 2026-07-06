package com.dreamCollection.user.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.dreamCollection.user.entity.UserOauthAccount;

public interface UserOauthAccountRepository extends JpaRepository<UserOauthAccount, Long> {
    Optional<UserOauthAccount> findByProviderAndProviderUserId(
            UserOauthAccount.OauthProvider provider, String providerUserId);
}
