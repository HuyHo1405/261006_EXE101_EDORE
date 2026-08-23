package com.edore.backend.core.init;

import com.edore.backend.features.auth.entity.Permission;
import com.edore.backend.features.auth.entity.Role;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.model.RoleName;
import com.edore.backend.features.auth.repository.PermissionRepository;
import com.edore.backend.features.auth.repository.RoleRepository;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.profile.security.ProfilePermissions;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class RbacDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Permissions — values sourced from ProfilePermissions (single source of truth)
        Permission readOwn      = seed(ProfilePermissions.READ_OWN,  "Read own profile");
        Permission writeOwn     = seed(ProfilePermissions.WRITE_OWN, "Update own profile");
        Permission adminReadAny = seed(ProfilePermissions.READ_ANY,  "Admin: read any profile");
        Permission adminWriteAny= seed(ProfilePermissions.WRITE_ANY, "Admin: update any profile");

        // 2. Seed ROLE_USER
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER).orElseGet(() -> {
            Set<Permission> userPermissions = new HashSet<>();
            userPermissions.add(readOwn);
            userPermissions.add(writeOwn);

            Role role = Role.builder()
                    .name(RoleName.ROLE_USER)
                    .permissions(userPermissions)
                    .build();
            return roleRepository.save(role);
        });

        // 3. Seed ROLE_ADMIN
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN).orElseGet(() -> {
            Set<Permission> adminPermissions = new HashSet<>();
            adminPermissions.add(readOwn);
            adminPermissions.add(writeOwn);
            adminPermissions.add(adminReadAny);
            adminPermissions.add(adminWriteAny);

            Role role = Role.builder()
                    .name(RoleName.ROLE_ADMIN)
                    .permissions(adminPermissions)
                    .build();
            return roleRepository.save(role);
        });

        // 4. Seed Default User (user@sba.com)
        if (!userRepository.existsByEmail("user@sba.com")) {
            Set<Role> roles = new HashSet<>();
            roles.add(userRole);

            User user = User.builder()
                    .username("user")
                    .email("user@sba.com")
                    .password(passwordEncoder.encode("P@ssw0rd123"))
                    .phone("0912345678")
                    .isActive(true)
                    .roles(roles)
                    .build();
            userRepository.save(user);
        }

        // 5. Seed Default Admin (admin@sba.com)
        if (!userRepository.existsByEmail("admin@sba.com")) {
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);

            User admin = User.builder()
                    .username("admin")
                    .email("admin@sba.com")
                    .password(passwordEncoder.encode("P@ssw0rd123"))
                    .phone("0987654321")
                    .isActive(true)
                    .roles(roles)
                    .build();
            userRepository.save(admin);
        }
    }

    private Permission seed(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> permissionRepository.save(
                        Permission.builder().name(name).description(description).build()
                ));
    }
}
