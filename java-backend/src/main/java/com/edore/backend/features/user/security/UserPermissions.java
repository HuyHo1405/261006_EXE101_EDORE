package com.edore.backend.features.user.security;

public final class UserPermissions {
    private UserPermissions() {}

    public static final String READ_OWN  = "PROFILE_READ_OWN";
    public static final String WRITE_OWN = "PROFILE_WRITE_OWN";
    public static final String READ_ANY  = "ADMIN_READ_ANY_PROFILE";
    public static final String WRITE_ANY = "ADMIN_WRITE_ANY_PROFILE";
}
