export interface IClientPanelStats {
  title: string;
  growth?: number | string;
  value: number | string;
  growth_type: "up" | "down" | undefined | string;
  description?: string;
  link_text?: string;
  link?: string;
  icon?: string;
  icon_bg_color?: string;
}
