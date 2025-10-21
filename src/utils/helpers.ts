export default class Helpers {
    static calcDistance(
        lat1: number,
        lon1: number,
        lat2: number,
        lon2: number
    ): number {
        const toRad = (x: number) => (x * Math.PI) / 180;
        const R = 6371;
        const dLat = toRad(lat2 - lat1);
        const dLon = toRad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(lat1)) *
                Math.cos(toRad(lat2)) *
                Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    static isPickupTimeValid(
        expectedPickupTime: Date,
        openTime: string,
        closeTime: string
    ): boolean {
        const [openHour, openMinute, openSecond] = openTime
            .split(':')
            .map(Number);
        const [closeHour, closeMinute, closeSecond] = closeTime
            .split(':')
            .map(Number);

        const openDate = new Date(expectedPickupTime);
        openDate.setHours(openHour, openMinute, openSecond || 0, 0);

        const closeDate = new Date(expectedPickupTime);
        closeDate.setHours(closeHour, closeMinute, closeSecond || 0, 0);

        return (
            expectedPickupTime >= openDate && expectedPickupTime <= closeDate
        );
    }
}
