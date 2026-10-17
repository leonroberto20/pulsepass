package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.UserCredential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserCredentialRepository extends JpaRepository<UserCredential, Long> {

    Optional<UserCredential> findByUserId(Long userId);

    Optional<UserCredential> findByUser_Username(String username);

    Optional<UserCredential> findByUser_EmailIgnoreCase(String email);
}
