package com.edore.backend.features.order.security;

public final class OrderPermissions {
    private OrderPermissions() {}

    public static final String CREATE   = "ORDER_CREATE";
    public static final String READ_OWN = "ORDER_READ_OWN";
    public static final String CHECKOUT = "ORDER_CHECKOUT";
}
