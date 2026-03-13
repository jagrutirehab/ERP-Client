import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import { format } from "date-fns";
import Footer from "../Charts/Footer";
import { capitalizeWords } from "../../../utils/toCapitalize";

Font.register({
  family: "Roboto",
  fonts: [{ src: Roboto, fontWeight: "heavy" }],
});

const border = "1px solid #000";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 30,
    paddingBottom: 18,
    paddingLeft: 25,
    paddingRight: 25,
    flexDirection: "column",
  },
  // Header
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  justifyBetween: {
    justifyContent: "space-between",
  },
  col6: {
    width: "50%",
  },
  headerCenterName: {
    fontFamily: "Roboto",
    fontSize: 15,
    fontWeight: "heavy",
  },
  fontHeavy: {
    fontFamily: "Roboto",
    fontWeight: "heavy",
    fontSize: 12,
  },
  fontMd: {
    fontSize: 10,
  },
  textCaps: {
    textTransform: "capitalize",
  },
  padding5: {
    paddingTop: 5,
  },
  // Title
  titleRow: {
    textAlign: "center",
    borderTop: border,
    borderBottom: border,
    paddingVertical: 6,
    marginTop: 10,
    marginBottom: 10,
  },
  titleText: {
    fontFamily: "Roboto",
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  // Patient info
  infoSection: {
    flexDirection: "row",
    borderBottom: border,
    paddingBottom: 8,
    paddingTop: 5,
    marginBottom: 10,
  },
  infoCol: {
    width: "50%",
  },
  infoLabel: {
    fontSize: 9,
    color: "#555",
  },
  infoValue: {
    fontFamily: "Roboto",
    fontSize: 10,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  // Table
  tableHeader: {
    flexDirection: "row",
    borderBottom: border,
    borderTop: border,
    backgroundColor: "#e8e8e8",
    paddingVertical: 7,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableHeaderText: {
    fontFamily: "Roboto",
    fontSize: 8,
    textTransform: "uppercase",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottom: "0.5px solid #bbb",
    alignItems: "center",
  },
  tableRowAlt: {
    backgroundColor: "#f8f8f8",
  },
  tableRowNotAllowed: {
    backgroundColor: "#fde0e0",
  },
  cellSl: { width: "4%", paddingRight: 2 },
  cellItem: { width: "16%", paddingRight: 4 },
  cellCategory: { width: "11%", paddingRight: 4 },
  cellRisk: { width: "10%", paddingRight: 4 },
  cellAllowed: { width: "11%", paddingRight: 4 },
  cellQty: { width: "5%", textAlign: "center" },
  cellRemarks: { width: "12%", paddingLeft: 4 },
  cellHandedOver: { width: "18%", paddingLeft: 4 },
  cellAttachment: { width: "13%", paddingLeft: 4 },
  cellText: {
    fontSize: 9,
  },
  cellTextCaps: {
    fontSize: 9,
    textTransform: "capitalize",
  },
  riskHigh: {
    fontSize: 9,
    fontFamily: "Roboto",
  },
  riskModerate: {
    fontSize: 9,
  },
  riskLow: {
    fontSize: 9,
  },
  // Summary
  summaryRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    borderTop: border,
    paddingTop: 5,
    marginTop: 2,
  },
  summaryText: {
    fontSize: 10,
    fontFamily: "Roboto",
  },
  // Signatures
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 60,
    gap: 20,
  },
  signatureBox: {
    flex: 1,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottom: "1.5px solid #000",
    height: 50,
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 9,
    fontFamily: "Roboto",
  },
  // Image Attachments
  attachmentsTitle: {
    fontFamily: "Roboto",
    fontSize: 11,
    marginTop: 20,
    marginBottom: 8,
    borderBottom: border,
    paddingBottom: 4,
  },
  imageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  imageBox: {
    width: "47%",
    alignItems: "center",
    marginBottom: 10,
  },
  imageThumb: {
    width: "100%",
    height: 180,
    objectFit: "contain",
    border: "0.5px solid #ccc",
  },
  imageLabel: {
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
    textTransform: "capitalize",
  },
});

const breakLongText = (text, chunkSize = 15) => {
  if (!text) return "-";
  if (text.length <= chunkSize) return text;
  const match = text.match(new RegExp(`.{1,${chunkSize}}`, "g"));
  return match ? match.join("\n") : text;
};

const BelongingsPDF = ({ items, patient, date, center, handedOverTo }) => {
  const formattedDate = date
    ? format(new Date(date), "dd MMM yyyy, hh:mm a")
    : "";
  const totalQty = items.reduce((sum, i) => sum + (i.quantity || 1), 0);

  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        {/* Header */}
        <View>
          <View
            style={{
              ...styles.row,
              ...styles.justifyBetween,
              alignItems: "center",
            }}
          >
            <View style={styles.col6}>
              <Text style={styles.headerCenterName}>
                {center?.name || "JAGRUTI REHABILITATION CENTRE"}
              </Text>
            </View>
            <View style={styles.col6}>
              <Text style={{ whiteSpace: "pre-line", fontSize: 10 }}>
                {center?.address || ""}
              </Text>
              <Text style={styles.padding5}>
                {center?.numbers || ""}
              </Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={styles.titleText}>Patient Belongings Record</Text>
        </View>

        {/* Patient Info */}
        <View style={styles.infoSection}>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient: </Text>
              <Text style={{ ...styles.infoValue, ...styles.textCaps }}>
                {patient?.name?.toUpperCase() || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Patient UID: </Text>
              <Text style={styles.infoValue}>
                {patient?.id?.prefix || ""}
                {patient?.id?.value || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone: </Text>
              <Text style={styles.infoValue}>
                {patient?.phoneNumber || "N/A"}
              </Text>
            </View>
          </View>
          <View style={styles.infoCol}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date & Time: </Text>
              <Text style={styles.infoValue}>{formattedDate}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Gender: </Text>
              <Text style={styles.infoValue}>
                {patient?.gender || "N/A"}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Admission: </Text>
              <Text style={styles.infoValue}>
                {patient?.addmission?.addmissionDate
                  ? format(new Date(patient.addmission.addmissionDate), "dd MMM yyyy")
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Table */}
        <View>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.cellSl}>
              <Text style={styles.tableHeaderText}>#</Text>
            </View>
            <View style={styles.cellCategory}>
              <Text style={styles.tableHeaderText}>Category</Text>
            </View>
            <View style={styles.cellItem}>
              <Text style={styles.tableHeaderText}>Item</Text>
            </View>
            <View style={styles.cellRisk}>
              <Text style={styles.tableHeaderText}>Associated Risk</Text>
            </View>
            <View style={styles.cellAllowed}>
              <Text style={styles.tableHeaderText}>Allowed With Patient</Text>
            </View>
            <View style={styles.cellQty}>
              <Text style={styles.tableHeaderText}>Qty</Text>
            </View>
            <View style={styles.cellRemarks}>
              <Text style={styles.tableHeaderText}>Remarks</Text>
            </View>
            <View style={styles.cellHandedOver}>
              <Text style={styles.tableHeaderText}>Handover Status</Text>
            </View>
            <View style={styles.cellAttachment}>
              <Text style={styles.tableHeaderText}>Attachment</Text>
            </View>
          </View>

          {/* Table Body */}
          {[...items]
            .sort((a, b) => (a.category || "").localeCompare(b.category || ""))
            .map((item, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                item.allowedWithPatient?.toLowerCase() === "no"
                  ? styles.tableRowNotAllowed
                  : idx % 2 !== 0 ? styles.tableRowAlt : {},
              ]}
              wrap={false}
            >
              <View style={styles.cellSl}>
                <Text style={styles.cellText}>{idx + 1}</Text>
              </View>
              <View style={styles.cellCategory}>
                <Text style={styles.cellTextCaps}>{capitalizeWords(item.category || "-")}</Text>
              </View>
              <View style={styles.cellItem}>
                <Text style={styles.cellTextCaps}>
                  {item.name || item.customName || "-"}
                </Text>
              </View>
              <View style={styles.cellRisk}>
                <Text
                  style={
                    item.associatedRisk?.toLowerCase() === "high"
                      ? styles.riskHigh
                      : styles.cellText
                  }
                >
                  {capitalizeWords(item.associatedRisk || "-")}
                </Text>
              </View>
              <View style={styles.cellAllowed}>
                <Text style={styles.cellText}>
                  {capitalizeWords(item.allowedWithPatient || "-")}
                </Text>
              </View>
              <View style={styles.cellQty}>
                <Text style={styles.cellText}>{item.quantity || 1}</Text>
              </View>
              <View style={styles.cellRemarks}>
                <Text style={styles.cellTextCaps}>{capitalizeWords(item.remarks || "-")}</Text>
              </View>
              <View style={styles.cellHandedOver}>
                <Text style={{ fontSize: 7, textTransform: "capitalize" }}>{item.handedOverTo ? `Handed Over to ${item.handedOverTo}` : "-"}</Text>
              </View>
              <View style={styles.cellAttachment}>
                <Text style={{ fontSize: 7 }}>{breakLongText(item.imageName, 15)}</Text>
              </View>
            </View>
          ))}

          {/* Summary */}
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              Total: {items.length} item(s), {totalQty} qty
            </Text>
          </View>
        </View>

        {/* Image Attachments */}
        {items.some((i) => i.image) && (
          <View>
            <Text style={styles.attachmentsTitle}>Attachments</Text>
            <View style={styles.imageGrid}>
              {items
                .filter((i) => i.image)
                .map((item, idx) => (
                  <View key={idx} style={styles.imageBox} wrap={false}>
                    <Image src={item.image} style={styles.imageThumb} />
                    <Text style={styles.imageLabel}>
                      {item.name || item.customName || "Item"}{" "}
                      ({item.category || "N/A"})
                    </Text>
                  </View>
                ))}
            </View>
          </View>
        )}

        {/* Signatures */}
        <View style={styles.signatureSection} wrap={false}>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Patient / Attendant</Text>
          </View>
          <View style={styles.signatureBox}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureLabel}>Authorized Signatory</Text>
          </View>
        </View>

        {/* Footer */}
        <Footer />
      </Page>
    </Document>
  );
};

export default BelongingsPDF;
