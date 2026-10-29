import {adminAPI} from '../../../../lib/inquiry-api';
const handle=(request:Request)=>adminAPI(request,new URL(request.url).pathname.split('/').filter(Boolean).at(-1)!);
export const GET=handle;
export const POST=handle;
export const PATCH=handle;
