package com.community.crm.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {

    Optional<UserProfile> findByExternalUserIdAndProvider(String externalUserId, String provider);

    Optional<UserProfile> findByEmail(String email);

    boolean existsByExternalUserIdAndProvider(String externalUserId, String provider);

    @Query("SELECT u FROM UserProfile u WHERE u.provider = :provider")
    java.util.List<UserProfile> findByProvider(@Param("provider") String provider);
}
