// src/app/reports/components/ReportNotFound.tsx

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

type Props = {
  reportId: string;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  error: {
    fontSize: 14,
    color: "red",
  },
});

export default function ReportNotFound({ reportId }: Props) {
  return (
    <Document title="Report Not Found">
      <Page size="LETTER" style={styles.page}>
        <View>
          <Text style={styles.title}>Report Not Found</Text>

          <Text style={styles.error}>
            Unknown report id: {reportId}
          </Text>
        </View>
      </Page>
    </Document>
  );
}