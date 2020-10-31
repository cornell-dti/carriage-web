import { parseAddress } from 'addresser';

export function createKeys(property: string, values: string[]) {
  return values.map((v) => ({ [property]: v }));
}

export function formatAddress(address: string): string {
  let addressString;
  try {
    // type declaration in addresser is incorrect
    addressString = parseAddress(address) as any;
  } catch {
    addressString = parseAddress(`${address}, Ithaca, NY 14850`) as any;
  }
  return addressString.formattedAddress;
}
