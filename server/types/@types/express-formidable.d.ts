declare module 'express-formidable';

declare module 'excel4node' {
  export interface Style {
    font?: {
      color?: string;
      bold?: boolean;
      size?: number;
    };
    fill?: {
      type?: string;
      patternType?: string;
      bgColor?: string;
    };
    alignment?: {
      horizontal?: string;
      vertical?: string;
    };
    numberFormat?: string;
  }

  export interface Worksheet {
    cell(row: number, col: number): Cell;
    column(col: number): Column;
    addRow(values?: any[]): Row;
  }

  export interface Cell {
    string(value: string): Cell;
    date(value: Date): Cell;
    number(value: number): Cell;
    style(style: Style): Cell;
  }

  export interface Row {
    // Row methods would go here
  }

  export interface Column {
    setWidth(width: number): Column;
  }

  export interface Workbook {
    addWorksheet(name: string): Worksheet;
    createStyle(style: Style): Style;
    writeToBuffer(): Promise<Buffer>;
  }

  export class Workbook implements Workbook {
    addWorksheet(name: string): Worksheet;
    createStyle(style: Style): Style;
    writeToBuffer(): Promise<Buffer>;
  }
}
