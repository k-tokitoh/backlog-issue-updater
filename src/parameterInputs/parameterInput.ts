import Client, { Issue } from "../client";

export type Params = { [key in string]: string | number };

export default abstract class ParameterInput {
  public abstract toParams(client: Client, issue: Issue): Promise<Params>;
}
