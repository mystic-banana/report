// Type definitions for Deno API
declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  export const env: Env;
}

// Type definitions for Deno modules
declare module "https://deno.land/std@0.177.0/http/server.ts" {
  export function serve(handler: (request: Request) => Response | Promise<Response>): void;
}

declare module "https://esm.sh/@supabase/supabase-js@2.21.0" {
  export function createClient(url: string, key: string, options?: any): any;
}

declare module "https://deno.land/x/puppeteer@16.2.0/mod.ts" {
  export default {
    launch: (options?: any) => Promise<any>
  };
}
