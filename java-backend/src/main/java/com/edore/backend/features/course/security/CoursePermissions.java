package com.edore.backend.features.course.security;

public final class CoursePermissions {
    private CoursePermissions() {}

    public static final String CREATE = "course:create";
    public static final String READ_OWN = "course:read_own";
    public static final String WRITE_OWN = "course:write_own";
    public static final String DELETE_OWN = "course:delete_own";

    public static final String READ_ANY = "course:read_any";
    public static final String WRITE_ANY = "course:write_any";
    public static final String DELETE_ANY = "course:delete_any";
}
