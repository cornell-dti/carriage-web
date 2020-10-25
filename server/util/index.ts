import addresser from 'addresser';

export function createKeys(property: string, values: string[]) {
  return values.map((v) => ({ [property]: v }));
}

export function formatAddress(address: string): string {
  let addressString = address;
  if (!address.includes(',')) {
    addressString += ', Ithaca, NY 14850';
  }
  // type declaration in addresser is incorrect
  return (addresser.parseAddress(addressString) as any).formattedAddress;
}
