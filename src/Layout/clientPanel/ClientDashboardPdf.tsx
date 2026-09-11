import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

export interface PdfWidgetItem {
  img: string;
  width: number;  // Capture width in PDF points
  height: number; // Capture height in PDF points
}

interface ClientDashboardPdfProps {
  items: PdfWidgetItem[];
  isDark: boolean;
  projectName?: string;
  programName?: string;
  formattedDate: string;
}

const ClientDashboardPdf = ({
  items,
  isDark,
  projectName,
  programName,
  formattedDate,
}: ClientDashboardPdfProps) => {
  const styles = StyleSheet.create({
    page: {
      paddingTop: 24,
      paddingBottom: 40,
      paddingHorizontal: 24,
      backgroundColor: isDark ? "#0b1329" : "#f8fafc",
      fontFamily: "Helvetica",
      display: "flex",
      flexDirection: "column",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      borderBottomWidth: 0.5,
      borderBottomColor: isDark ? "#1e293b" : "#e2e8f0",
      paddingBottom: 8,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 10,
      fontWeight: "bold",
      color: isDark ? "#f1f5f9" : "#0f172a",
    },
    headerSub: {
      fontSize: 8,
      color: isDark ? "#94a3b8" : "#64748b",
    },
    cardImage: {
      borderRadius: 6,
    },
    footer: {
      position: "absolute",
      bottom: 16,
      left: 24,
      right: 24,
      flexDirection: "row",
      justifyContent: "space-between",
      borderTopWidth: 0.5,
      borderTopColor: isDark ? "#1e293b" : "#e2e8f0",
      paddingTop: 8,
      fontSize: 7.5,
      color: isDark ? "#94a3b8" : "#64748b",
    },
  });

  const headerTitle = projectName || programName || "Dashboard Report";

  // Define standard document-wide page width (A4 landscape width = 842 points)
  const STANDARD_PAGE_WIDTH = 842;
  const HORIZONTAL_PADDING = 48; // 24 points padding left and right
  const AVAILABLE_CONTENT_WIDTH = STANDARD_PAGE_WIDTH - HORIZONTAL_PADDING; // 794 points

  return (
    <Document>
      {items.map((item, idx) => {
        // Calculate the aspect ratio of the captured widget
        const aspectRatio = item.height / (item.width || 1);

        // Proportional height scaling to maintain crisp layout proportions without stretch/distortion
        const scaledImageHeight = AVAILABLE_CONTENT_WIDTH * aspectRatio;

        // Dynamic page height: image height + Top padding (24) + Header & space (36) + Bottom padding (16) + Footer (16) + Safe buffer (48)
        // This safe vertical buffer guarantees @react-pdf/renderer NEVER overflows onto an accidental blank page!
        const pageHeight = scaledImageHeight + 140;

        return (
          <Page
            key={idx}
            size={[STANDARD_PAGE_WIDTH, pageHeight]}
            style={styles.page}
          >
            {/* Page Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{headerTitle.toUpperCase()}</Text>
              <Text style={styles.headerSub}>THETA ANALYZER REPORT</Text>
            </View>

            {/* Scale-Preserved Image Box */}
            <View style={{ width: AVAILABLE_CONTENT_WIDTH, height: scaledImageHeight }}>
              <Image
                src={item.img}
                style={[styles.cardImage, { width: AVAILABLE_CONTENT_WIDTH, height: scaledImageHeight }]}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text>Generated: {formattedDate}</Text>
              <Text>
                Page {idx + 1} of {items.length}
              </Text>
            </View>
          </Page>
        );
      })}
    </Document>
  );
};

export default ClientDashboardPdf;
