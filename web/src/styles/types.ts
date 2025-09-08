import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';

export interface Theme {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
}

declare module '@emotion/react' {
  export interface Theme {
    colors: typeof colors;
    typography: typeof typography;
    spacing: typeof spacing;
  }
}
