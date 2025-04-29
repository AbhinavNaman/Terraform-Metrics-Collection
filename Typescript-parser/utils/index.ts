// const sanitizeString = (str: string) => {
//     return str.replace(/[{}]/g, "\\$&");
//   };

export function sanitizeString(str: any): string {
  if (typeof str !== 'string') {
    str = String(str ?? '');
  }
  return str.replace(/[{}]/g, "\\$&");
}

export const formatPGJsonArray = (arr: any[]): string => {
  return `{${arr.map(obj => `"${JSON.stringify(obj).replace(/"/g, '\\"')}"`).join(",")}}`;
};


  
export const formatPGArray = (arr: string[]) => `{${arr.map(sanitizeString).join(",")}}`;