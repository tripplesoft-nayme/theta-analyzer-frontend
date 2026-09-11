export interface ISidebarItem {
  icon?: React.ReactElement;
  name?: string | React.ReactElement;
  path?: string;
  header?: string;
  description?: string;
  element?: React.ReactNode;
  hidden?: boolean;
  children?: ISidebarItem[];
  index?: boolean;
}
