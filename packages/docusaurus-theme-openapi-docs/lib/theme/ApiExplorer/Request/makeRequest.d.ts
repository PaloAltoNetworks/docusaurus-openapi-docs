import sdk from "@paloaltonetworks/postman-collection";
import { Body } from "@theme/ApiExplorer/Body/slice";
declare function makeRequest(request: sdk.Request, proxy: string | undefined, _body: Body): Promise<any>;
export default makeRequest;
