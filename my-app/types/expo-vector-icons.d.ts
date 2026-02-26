declare module '@expo/vector-icons/Ionicons' {
  import type { ComponentType } from 'react';
  const Ionicons: ComponentType<{
    name: string;
    size?: number;
    color?: string;
    [key: string]: unknown;
  }> & { glyphMap: Record<string, number> };
  export default Ionicons;
}
