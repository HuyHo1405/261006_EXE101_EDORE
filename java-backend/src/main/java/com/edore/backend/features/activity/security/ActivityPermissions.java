package com.edore.backend.features.activity.security;

public final class ActivityPermissions {
    private ActivityPermissions() {}

    public static final String CREATE     = "activity:create";
    public static final String READ       = "activity:read";
    public static final String WRITE_ANY  = "activity:write_any";
    public static final String DELETE_ANY = "activity:delete_any";
}
