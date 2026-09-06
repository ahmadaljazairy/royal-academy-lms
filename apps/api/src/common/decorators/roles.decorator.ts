import { SetMetadata} from "@nestjs/common";
import type { SystemRole } from "@template/types";

export const ROLES_KEY = 'ROLES';
export const Roles = (...roles : SystemRole[]) => SetMetadata(ROLES_KEY, roles);