export const bareInputNames = [
  "statusName",
  "customFieldsWithItems",
  "customFieldsWithoutItems",
] as const;

export type BareInputName = typeof bareInputNames[number];
export type BareInputs = { [key in BareInputName]?: string };
