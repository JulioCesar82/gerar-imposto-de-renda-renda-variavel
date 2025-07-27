export const tryDownloadFile = (blob: any, fileName: string) => {
    // Create a download link
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);

    a.click();
    
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
};