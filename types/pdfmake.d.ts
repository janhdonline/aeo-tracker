declare module 'pdfmake/js/Printer' {
  import { TDocumentDefinitions, TVirtualFileSystem } from 'pdfmake';

  export default class PdfPrinter {
    constructor(
      fontDescriptors: Record<string, { normal: string; bold: string; italics: string; bolditalics: string }>,
      virtualfs?: TVirtualFileSystem,
      urlResolver?: any,
      localAccessPolicy?: any
    );
    createPdfKitDocument(
      docDefinition: TDocumentDefinitions,
      options?: Record<string, unknown>
    ): Promise<any>;
  }
}

declare module 'pdfmake/js/URLResolver' {
  export default class URLResolver {
    constructor();
    resolve(url: string, headers?: Record<string, string>): void;
  }
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>;
  export default vfs;
}

declare module 'pdfmake/build/pdfmake' {
  export * from 'pdfmake';
}