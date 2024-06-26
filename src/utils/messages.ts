export const getTokenGatingMessage = (balance: number, required: number): string | undefined => {
  if (required > balance) {
    return `Connect a wallet with ${required} $LTAI`;
  }
  return undefined;
};
