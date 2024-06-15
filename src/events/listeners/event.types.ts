import { Subjects } from "./subjects";
type DataObject = {
  [key: string]: number | string;
};

export interface EventType {
  messageId: string;
  type: Subjects.EMAIL_SEND;
  body: DataObject;
}
