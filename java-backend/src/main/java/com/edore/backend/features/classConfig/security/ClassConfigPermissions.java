package com.edore.backend.features.classConfig.security;

public final class ClassConfigPermissions {
    private ClassConfigPermissions() {}

    public static final String CREATE = "class_config:create";
    public static final String READ_OWN = "class_config:read_own";
    public static final String WRITE_OWN = "class_config:write_own";
    public static final String DELETE_OWN = "class_config:delete_own";

    public static final String READ_ANY = "class_config:read_any";
    public static final String WRITE_ANY = "class_config:write_any";
    public static final String DELETE_ANY = "class_config:delete_any";
}
