package com.edore.backend.features.order.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum OrderResponseCode implements ResponseCode {

    // --- Success codes ---
    CREATE_ORDER_SUCCESS(1300, "Tạo đơn hàng thành công.", HttpStatus.OK, "order.create_success"),
    GET_MY_ORDERS_SUCCESS(1301, "Lấy danh sách đơn hàng thành công.", HttpStatus.OK, "order.get_my_orders_success"),
    CREATE_PAYMENT_LINK_SUCCESS(1302, "Tạo link thanh toán thành công.", HttpStatus.OK, "order.create_payment_link_success"),
    WEBHOOK_PROCESSED_SUCCESS(1303, "Xử lý webhook thanh toán thành công.", HttpStatus.OK, "order.webhook_processed_success"),
    VERIFY_PAYMENT_SUCCESS(1304, "Xác minh thanh toán thành công.", HttpStatus.OK, "order.verify_payment_success"),
    GET_ENUMS_SUCCESS(1305, "Lấy danh sách enums đơn hàng và thanh toán thành công.", HttpStatus.OK, "order.get_enums_success"),

    // --- Error codes ---
    ORDER_NOT_FOUND(2301, "Không tìm thấy đơn hàng.", HttpStatus.NOT_FOUND, "order.not_found"),
    ORDER_NOT_OWNED(2302, "Đơn hàng không thuộc về người dùng này.", HttpStatus.FORBIDDEN, "order.not_owned"),
    ORDER_NOT_PAYABLE(2303, "Đơn hàng không ở trạng thái có thể thanh toán.", HttpStatus.BAD_REQUEST, "order.not_payable"),
    ORDER_ALREADY_PAID(2304, "Đơn hàng đã được thanh toán.", HttpStatus.CONFLICT, "order.already_paid"),
    SUBSCRIPTION_PLAN_NOT_FOUND(2305, "Không tìm thấy gói đăng ký.", HttpStatus.NOT_FOUND, "order.subscription_plan_not_found"),
    SUBSCRIPTION_PLAN_INACTIVE(2306, "Gói đăng ký hiện không hoạt động.", HttpStatus.BAD_REQUEST, "order.subscription_plan_inactive"),
    INVALID_WEBHOOK_SIGNATURE(2307, "Chữ ký webhook không hợp lệ.", HttpStatus.BAD_REQUEST, "order.invalid_webhook_signature"),
    PAYMENT_NOT_FOUND(2308, "Không tìm thấy giao dịch thanh toán.", HttpStatus.NOT_FOUND, "order.payment_not_found"),
    USER_NOT_FOUND(2309, "Không tìm thấy người dùng.", HttpStatus.NOT_FOUND, "order.user_not_found"),
    UNSUPPORTED_PAYMENT_PROVIDER(2310, "Cổng thanh toán không được hỗ trợ.", HttpStatus.BAD_REQUEST, "order.unsupported_payment_provider"),
    CREATE_PAYMENT_LINK_FAILED(2311, "Không thể tạo liên kết thanh toán PayOS. Vui lòng kiểm tra cấu hình PayOS (Client ID, API Key, Checksum Key).", HttpStatus.BAD_REQUEST, "order.create_payment_link_failed"),
    ACTIVE_SUBSCRIPTION_EXISTS(2312, "Bạn đang có gói đăng ký đang hoạt động.", HttpStatus.CONFLICT, "order.active_subscription_exists"),
    CONCURRENT_ORDER_CREATION(2313, "Yêu cầu tạo đơn hàng đang được xử lý, vui lòng không thao tác quá nhanh.", HttpStatus.TOO_MANY_REQUESTS, "order.concurrent_creation"),
    PENDING_ORDER_EXISTS(2314, "Bạn đang có đơn hàng chưa thanh toán cho gói khác. Vui lòng hoàn tất đơn cũ trước.", HttpStatus.CONFLICT, "order.pending_order_exists");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    OrderResponseCode(int code, String message, HttpStatus status, String key) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.key = key;
    }

    @Override public int getCode() { return code; }
    @Override public String getMessage() { return message; }
    @Override public HttpStatus getStatus() { return status; }
    @Override public String getKey() { return key; }
    @Override public String getDomain() { return "ORDER"; }
}
