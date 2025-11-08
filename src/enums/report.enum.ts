export enum ReportStatus {
    PENDING = 'PENDING',         // Người dùng vừa tạo report
    CONFIRMED = 'CONFIRMED',     // Staff xác nhận, chờ user booking onsite lại
    COMPLETED = 'COMPLETED',     // User đã booking onsite lại xong (hoàn thành quy trình)
    REJECTED = 'REJECTED',       // Staff từ chối report
}