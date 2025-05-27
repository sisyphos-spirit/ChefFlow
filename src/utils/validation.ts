// Utilidades de validación para formularios de recetas

export function isEmpty(value: string | undefined | null): boolean {
  return !value || value.trim() === '';
};

export function isPositiveNumber(value: string | number): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return !isNaN(num) && num > 0;
};
