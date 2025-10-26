export enum BookingStatus {
    RESERVED = 'RESERVED',              // Đã đặt trước, chờ đến trạm (online)
    PENDING_PAYMENT = 'PENDING_PAYMENT', // Chờ thanh toán (onsite không membership)
    IN_PROGRESS = 'IN_PROGRESS',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    EXPIRED = 'EXPIRED'
}

export enum BookingDetailStatus {
    RESERVED = 'RESERVED',              // Đã đặt trước
    PENDING_PAYMENT = 'PENDING_PAYMENT', // Chờ thanh toán
    IN_PROGRESS = 'IN_PROGRESS',        // Đang swap
    COMPLETED = 'COMPLETED',            // Hoàn thành
    CANCELLED = 'CANCELLED',           // Bị hủy
    EXPIRED = 'EXPIRED'                  // Hết hạn
}