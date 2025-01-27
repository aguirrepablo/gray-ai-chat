import { Role } from "../enums/role.enum";
import { Content } from "./content.entitie";

export class Message {
    constructor(public role: Role, public content: Content[]) {}
}