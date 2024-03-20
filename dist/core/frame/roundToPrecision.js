export default function roundToPrecision(value, precision) {
    if (precision <= 0) {
        throw new Error("Precision must be a positive number");
    }
    const factor = 1 / precision;
    const roundedValue = Math.round(value * factor) / factor;
    return roundedValue;
}
