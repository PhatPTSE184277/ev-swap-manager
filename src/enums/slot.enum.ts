export enum SlotStatus {
    EMPTY = 'EMPTY',           // Ô trống, chưa có pin
    FULL = 'FULL',             // Ô đã có pin sạc đầy, sẵn sàng để đổi
    CHARGING = 'CHARGING',     // Ô đang sạc pin
    OCCUPIED = 'OCCUPIED',     // Ô có pin nhưng chưa sạc đầy
    MAINTENANCE = 'MAINTENANCE'// Ô đang bảo trì, không sử dụng được
}

export enum SlotHistoryStatus {
    EMPTY = 'EMPTY',
    FULL = 'FULL',
    CHARGING = 'CHARGING',
    OCCUPIED = 'OCCUPIED',
    MAINTENANCE = 'MAINTENANCE'
}