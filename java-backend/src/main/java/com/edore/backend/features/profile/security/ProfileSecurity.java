package com.edore.backend.features.profile.security;

import com.edore.backend.features.auth.security.CustomUserDetail;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("profileSecurity")
public class ProfileSecurity {

    public boolean isOwner(Authentication authentication, UUID targetUserId) {
        if (!(authentication.getPrincipal() instanceof CustomUserDetail userDetail)) {
            return false;
        }
        return userDetail.getUser().getId().equals(targetUserId);
    }
}
