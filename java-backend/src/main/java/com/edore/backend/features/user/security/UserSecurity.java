package com.edore.backend.features.user.security;

import com.edore.backend.features.auth.security.CustomUserDetail;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("userSecurity")
public class UserSecurity {

    public boolean isOwner(Authentication authentication, UUID targetUserId) {
        if (!(authentication.getPrincipal() instanceof CustomUserDetail userDetail)) {
            return false;
        }
        return userDetail.getUser().getId().equals(targetUserId);
    }
}
