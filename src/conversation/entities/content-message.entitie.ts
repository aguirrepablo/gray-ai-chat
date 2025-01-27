
export type ContentMessage =
    | TextContent;

export interface TextContent {
    text: string;
}

// export class FileContent {
//     constructor(public role: Role, public content: Content[]) {}
// }