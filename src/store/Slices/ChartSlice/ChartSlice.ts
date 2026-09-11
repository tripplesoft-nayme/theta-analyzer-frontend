import { createSlice } from "@reduxjs/toolkit";

interface ChartBuilderState {
  programId: string;
  projectId: string;
  isPreview: boolean;
  isPublished: boolean;
  widgetConfigs: Record<string, unknown>;
  childPayload: Record<string, unknown>;
  selectedWidgets: string[];
  groupTitle: string;
  selectedTemplate: any | null;
  mediaWidgetInitialData: { files: any[]; title: string; groupId?: string } | null;
  hiddenWidgetIds: string[];
  activeConfigWidgetId: string | null;
}

const initialState: ChartBuilderState = {
  programId: "",
  projectId: "",
  isPreview: false,
  isPublished: false,
  widgetConfigs: {},
  childPayload: {},
  selectedWidgets: [],
  groupTitle: "",
  selectedTemplate: null,
  mediaWidgetInitialData: null,
  hiddenWidgetIds: [],
  activeConfigWidgetId: null,
};

const chartSlice = createSlice({
  name: "chartBuilder",
  initialState,
  reducers: {
    setProgramId: (state, action) => {
      state.programId = action.payload;
    },
    setProjectId: (state, action) => {
      state.projectId = action.payload;
    },
    setIsPreview: (state, action) => {
      state.isPreview = action.payload;
    },
    setIsPublished: (state, action) => {
      state.isPublished = action.payload;
    },
    setWidgetConfig: (
      state,
      action: { payload: { id: string; config: unknown } },
    ) => {
      state.widgetConfigs[action.payload.id] = action.payload.config;
    },
    setChildPayload: (state, action: { payload: Record<string, unknown> }) => {
      state.childPayload = action.payload;
    },
    setSelectedWidgets: (state, action: { payload: string[] }) => {
      state.selectedWidgets = action.payload;
    },
    setGroupTitle: (state, action: { payload: string }) => {
      state.groupTitle = action.payload;
    },
    setSelectedTemplate: (state, action: { payload: any | null }) => {
      state.selectedTemplate = action.payload;
    },
    setMediaWidgetInitialData: (state, action: { payload: { files: any[]; title: string; groupId?: string } | null }) => {
      state.mediaWidgetInitialData = action.payload;
    },
    hideWidget: (state, action: { payload: string }) => {
      if (!state.hiddenWidgetIds.includes(action.payload)) {
        state.hiddenWidgetIds.push(action.payload);
      }
    },
    resetHiddenWidgets: (state) => {
      state.hiddenWidgetIds = [];
    },
    setActiveConfigWidgetId: (state, action: { payload: string | null }) => {
      state.activeConfigWidgetId = action.payload;
    },
    resetChartState: () => initialState,
  },
});

export const {
  setProgramId,
  setProjectId,
  setIsPreview,
  setIsPublished,
  setWidgetConfig,
  setChildPayload,
  setSelectedWidgets,
  setGroupTitle,
  setSelectedTemplate,
  setMediaWidgetInitialData,
  hideWidget,
  resetHiddenWidgets,
  setActiveConfigWidgetId,
  resetChartState,
} = chartSlice.actions;

export default chartSlice.reducer;
