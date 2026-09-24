package com.edore.backend.features.auth.init;

import com.edore.backend.features.auth.entity.Permission;
import com.edore.backend.features.auth.entity.Role;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.model.RoleName;
import com.edore.backend.features.auth.repository.PermissionRepository;
import com.edore.backend.features.auth.repository.RoleRepository;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.classConfig.security.ClassConfigPermissions;
import com.edore.backend.features.course.security.CoursePermissions;
import com.edore.backend.features.order.security.OrderPermissions;
import com.edore.backend.features.user.security.UserPermissions;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Component
@Order(1)
@RequiredArgsConstructor
public class RbacDataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // 1. Seed Permissions
        Permission readOwn      = seed(UserPermissions.READ_OWN,  "Read own profile");
        Permission writeOwn     = seed(UserPermissions.WRITE_OWN, "Update own profile");
        Permission adminReadAny = seed(UserPermissions.READ_ANY,  "Admin: read any profile");
        Permission adminWriteAny= seed(UserPermissions.WRITE_ANY, "Admin: update any profile");

        Permission orderCreate  = seed(OrderPermissions.CREATE,   "Create order");
        Permission orderReadOwn = seed(OrderPermissions.READ_OWN,  "Read own orders");
        Permission orderCheckout= seed(OrderPermissions.CHECKOUT,  "Checkout order");

        Permission courseCreate   = seed(CoursePermissions.CREATE,    "Create course");
        Permission courseReadOwn  = seed(CoursePermissions.READ_OWN,  "Read own courses");
        Permission courseWriteOwn = seed(CoursePermissions.WRITE_OWN, "Update own course");
        Permission courseDeleteOwn= seed(CoursePermissions.DELETE_OWN, "Delete own course");
        Permission courseReadAny  = seed(CoursePermissions.READ_ANY,  "Admin: read any course");
        Permission courseWriteAny = seed(CoursePermissions.WRITE_ANY, "Admin: update any course");
        Permission courseDeleteAny= seed(CoursePermissions.DELETE_ANY, "Admin: delete any course");

        Permission cfgCreate   = seed(ClassConfigPermissions.CREATE,    "Create class config");
        Permission cfgReadOwn  = seed(ClassConfigPermissions.READ_OWN,  "Read own class config");
        Permission cfgWriteOwn = seed(ClassConfigPermissions.WRITE_OWN, "Update own class config");
        Permission cfgDeleteOwn= seed(ClassConfigPermissions.DELETE_OWN, "Delete own class config");
        Permission cfgReadAny  = seed(ClassConfigPermissions.READ_ANY,  "Admin: read any class config");
        Permission cfgWriteAny = seed(ClassConfigPermissions.WRITE_ANY, "Admin: update any class config");
        Permission cfgDeleteAny= seed(ClassConfigPermissions.DELETE_ANY, "Admin: delete any class config");

        // 2. Seed ROLE_USER
        Role userRole = roleRepository.findByName(RoleName.ROLE_USER).orElseGet(() -> {
            Set<Permission> userPermissions = new HashSet<>();
            userPermissions.add(readOwn);
            userPermissions.add(writeOwn);
            userPermissions.add(orderCreate);
            userPermissions.add(orderReadOwn);
            userPermissions.add(orderCheckout);
            userPermissions.add(courseCreate);
            userPermissions.add(courseReadOwn);
            userPermissions.add(courseWriteOwn);
            userPermissions.add(courseDeleteOwn);
            userPermissions.add(cfgCreate);
            userPermissions.add(cfgReadOwn);
            userPermissions.add(cfgWriteOwn);
            userPermissions.add(cfgDeleteOwn);

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
            adminPermissions.add(orderCreate);
            adminPermissions.add(orderReadOwn);
            adminPermissions.add(orderCheckout);

            adminPermissions.add(courseCreate);
            adminPermissions.add(courseReadOwn);
            adminPermissions.add(courseWriteOwn);
            adminPermissions.add(courseDeleteOwn);
            adminPermissions.add(courseReadAny);
            adminPermissions.add(courseWriteAny);
            adminPermissions.add(courseDeleteAny);

            adminPermissions.add(cfgCreate);
            adminPermissions.add(cfgReadOwn);
            adminPermissions.add(cfgWriteOwn);
            adminPermissions.add(cfgDeleteOwn);
            adminPermissions.add(cfgReadAny);
            adminPermissions.add(cfgWriteAny);
            adminPermissions.add(cfgDeleteAny);

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
