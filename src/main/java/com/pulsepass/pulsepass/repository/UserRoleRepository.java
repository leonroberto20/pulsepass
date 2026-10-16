package com.pulsepass.pulsepass.repository;

import com.pulsepass.pulsepass.domain.RoleName;
import com.pulsepass.pulsepass.domain.User;
import com.pulsepass.pulsepass.domain.UserRole;
import com.pulsepass.pulsepass.domain.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    List<UserRole> findByUser(User user);

    List<UserRole> findByUser_Id(Long userId);

    boolean existsByUser_IdAndRole(Long userId, RoleName role);
}
