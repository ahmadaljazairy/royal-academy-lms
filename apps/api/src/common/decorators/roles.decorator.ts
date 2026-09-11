import { SetMetadata} from "@nestjs/common";
import type { Role } from "@template/types";

export const ROLES_KEY = 'ROLES';
export const Roles = (...roles : Role[]) => SetMetadata(ROLES_KEY, roles);