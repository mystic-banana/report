declare module 'html2pdf.js' {
  function html2pdf(): {
    set: (options: any) => any;
    from: (element: HTMLElement) => any;
    save: () => Promise<any>;
  };
  
  export default html2pdf;
}
