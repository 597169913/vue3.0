export const Vector = {
    length(v) {
        return Math.sqrt(v.x * v.x + v.y * v.y)
    },
    normalize(v) {
        var inv = 1 / this.length(v)
        return {x: v.x * inv, y: v.y * inv}
    },
    add(v1, v2) {
        return {x: v1.x + v2.x, y: v1.y + v2.y}
    },
    multiply(v1, f) {
        return {x: v1.x * f, y: v1.y * f}
    },
    sub(v1, v2) {
        return {x: v1.x - v2.x, y: v1.y - v2.y}
    },
    dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    },
    angle(v1, v2) {
        return Math.acos(this.dot(v1, v2) / (this.length(v1) * this.length(v2))) * 180 / Math.PI;
    },
    distance(v1, v2) {
        return Math.sqrt(
            (v1.x - v2.x) * (v1.x - v2.x)
            + (v1.y - v2.y) * (v1.y - v2.y)
        )
    },
    scale(v, s) {
        return {x: v.x * s, y: v.y * s};
    }
}
export default Vector