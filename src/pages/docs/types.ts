export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export type ResponseColor = 'emerald' | 'amber' | 'red' | 'blue';

export interface EndpointParam {
  name: string;
  req: 'required' | 'optional';
  type: string;
  desc: string;
  defaultVal?: string;
}

export interface ResponseSpec {
  code: string;
  label: string;
  color: ResponseColor;
  text: string;
  body: string;
}

export interface EndpointSnippets {
  curl: string;
  go: string;
  python: string;
  typescript: string;
}

export interface TryItConfig {
  defaultMethod?: HttpMethod;
  defaultPathParams?: Record<string, string>;
  defaultQueryParams?: Record<string, string>;
  defaultHeaders?: Record<string, string>;
  defaultBody?: string;
}

export interface EndpointDoc {
  id: string;
  category: string;
  title: string;
  method: HttpMethod;
  path: string;
  auth: string;
  authType: 'api-key' | 'bearer-jwt';
  description: string;
  hasWarning?: boolean;
  warningCallout?: {
    title: string;
    message: string;
  };
  params: EndpointParam[];
  responses: ResponseSpec[];
  snippets: EndpointSnippets;
  tryItConfig?: TryItConfig;
}

export interface EndpointGroup {
  id: string;
  category: string;
  title: string;
  authBadge: string;
  endpoints: EndpointDoc[];
}
