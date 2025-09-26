import { clsx, type ClassValue } from "clsx";

/**
 * Utilitaire pour combiner les classes CSS conditionnellement
 * Usage: cn("base-class", condition && "conditional-class", { "active": isActive })
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formatter un nombre d'élèves avec le bon pluriel
 */
export function formatStudentCount(count: number): string {
  return count === 1 ? `${count} élève` : `${count} élèves`;
}

/**
 * Obtenir les initiales d'un nom complet
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Formatter un nom de classe pour l'affichage
 */
export function formatClassName(className: string): string {
  return `Classe ${className.toUpperCase()}`;
}

/**
 * Couleurs de fond pour les badges par niveau
 */
export function getLevelBadgeStyle(level: number): { background: string; color: string } {
  const styles = {
    1: { background: 'var(--green-100)', color: 'var(--green-700)' },
    2: { background: 'var(--green-200)', color: 'var(--green-800)' },
    3: { background: 'var(--green-300)', color: 'var(--green-800)' },
    4: { background: 'var(--green-400)', color: 'var(--green-900)' },
  };
  
  return styles[level as keyof typeof styles] || styles[1];
}

/**
 * Débounce function pour optimiser les performances
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  waitFor: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), waitFor);
  };
} 