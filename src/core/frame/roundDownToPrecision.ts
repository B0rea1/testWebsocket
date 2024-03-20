export default function roundDownToPrecision(value: number, precision: number): number {
    if (precision <= 0) {
        throw new Error("Precision must be a positive number");
    }
    
    const factor = 1 / precision;
    const roundedValue = Math.floor(value * factor) / factor;
    
    return roundedValue;
}