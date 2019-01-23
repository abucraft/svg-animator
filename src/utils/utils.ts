export function dispatchWindowResize() {
    window.dispatchEvent(new Event('resize'));
}