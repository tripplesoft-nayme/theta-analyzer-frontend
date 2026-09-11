/**
 * useWidgetConfig
 *
 * Drop-in replacement for the local `showWidget` useState pattern used across
 * every chart module. Routes through Redux so only one config panel can be
 * open at a time — opening a new panel automatically closes any other.
 *
 * Usage (identical API to the old useState pattern):
 *   const { showWidget, handleToggleWidget, handleCloseWidget } =
 *     useWidgetConfig(widgetId, isPreview);
 */
import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setActiveConfigWidgetId } from "@/store/Slices/ChartSlice/ChartSlice";

export const useWidgetConfig = (widgetId: string, isPreview = false) => {
  const dispatch = useAppDispatch();
  const activeId = useAppSelector(
    (state) => state.chartSlice.activeConfigWidgetId,
  );

  const showWidget = !isPreview && activeId === widgetId;

  const handleToggleWidget = useCallback(() => {
    if (isPreview) return;
    dispatch(setActiveConfigWidgetId(showWidget ? null : widgetId));
  }, [dispatch, isPreview, showWidget, widgetId]);

  const handleCloseWidget = useCallback(() => {
    dispatch(setActiveConfigWidgetId(null));
  }, [dispatch]);

  return { showWidget, handleToggleWidget, handleCloseWidget };
};
