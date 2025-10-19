export enum SlotStatus {
    EMPTY = 'EMPTY',           // Ô trống, không có pin
    FULL = 'FULL',             // Ô có pin sạc đầy, sẵn sàng để đổi
    CHARGING = 'CHARGING',     // Ô đang sạc pin
    MAINTENANCE = 'MAINTENANCE'// Ô đang bảo trì, không sử dụng được
}