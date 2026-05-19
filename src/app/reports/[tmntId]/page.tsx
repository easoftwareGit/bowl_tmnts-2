"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { useParams, useRouter } from "next/navigation";

const styles = StyleSheet.create({
  page: {
    padding: 40,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});

function MyReport() {
  return (
    <Document title="My Title" >
      <Page size="LETTER" style={styles.page}>
        <View>          
          <Text style={styles.title}>Player Report</Text>
          <Text>Hello World!</Text>
        </View>
      </Page>
    </Document>
  );
}

export default function ReportPreviewPage() {

  const params = useParams();
  const router = useRouter();
  const tmntId = params.tmntId as string;

  const handleBackToTmntButtonClick = () => {
    router.push(`/dataEntry/runTmnt/${tmntId}`);
  };

  return (
    <div className="container mt-4">      
      <button
        type="button"
        className="btn btn-primary"
        onClick={handleBackToTmntButtonClick}
      >
        Back to Run Tournament
      </button>
      {/* <PDFDownloadLink document={<MyReport />} fileName="report.pdf">Download PDF</PDFDownloadLink> */}
      <PDFViewer style={{ width: "100%", height: "800px" }}>       
        <MyReport />
      </PDFViewer>
    </div>
  );
}