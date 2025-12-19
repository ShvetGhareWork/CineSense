// Test file to check if theme imports work
import { colors, typography } from './src/constants/theme';

console.log('Colors:', Object.keys(colors).length);
console.log('Typography variants:', Object.keys(typography).filter(k => typeof typography[k] === 'object' && typography[k].fontSize));

export default function Test() {
  return null;
}
