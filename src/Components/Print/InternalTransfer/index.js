import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
    Font,
} from "@react-pdf/renderer";
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import { format } from "date-fns";
import Footer from "../Charts/Footer";
import { pluralizeUnit } from "../../../utils/pluralizeUnit";
import { capitalizeWords } from "../../../utils/toCapitalize";

const formatCurrencyPDF = (value) => `Rs. ${Number(value).toFixed(2)}`;

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
    // ────── Header ──────
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
        borderBottom: "1.5px solid #000",
        paddingBottom: 8,
        gap: 20,
    },
    headerLeft: {
        width: "35%",
    },
    headerRight: {
        width: "65%",
    },
    centerName: {
        fontFamily: "Roboto",
        fontSize: 16,
        fontWeight: "heavy",
        marginBottom: 0,
        lineHeight: 1.1,
    },
    contactInfo: {
        fontSize: 9,
        color: "#000",
        marginBottom: 1,
        lineHeight: 1.4,
    },
    contactLabel: {
        fontSize: 9,
        color: "#000",
        marginBottom: 2,
        fontWeight: 500,
    },
    // ────── Title ──────
    titleRow: {
        textAlign: "center",
        paddingVertical: 10,
        borderBottom: border,
        borderTop: border,
        marginBottom: 15,
    },
    titleText: {
        fontFamily: "Roboto",
        fontSize: 14,
        fontWeight: "heavy",
        textTransform: "uppercase",
        letterSpacing: 1,
    },
    // ────── Section Headers ──────
    sectionHeader: {
        fontFamily: "Roboto",
        fontSize: 11,
        fontWeight: "heavy",
        marginTop: 12,
        marginBottom: 8,
        paddingBottom: 4,
        borderBottom: border,
        textTransform: "uppercase",
    },
    // ────── Info Grid ──────
    infoRow: {
        flexDirection: "row",
        marginBottom: 5,
    },
    infoCol: {
        width: "50%",
    },
    infoLabel: {
        fontSize: 9,
        fontWeight: 600,
        marginBottom: 2,
    },
    infoValue: {
        fontSize: 10,
        fontWeight: 500,
    },
    // ────── Table ──────
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
        fontSize: 9,
        fontWeight: "heavy",
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
    cellSl: { width: "4%", paddingRight: 2 },
    cellMedicine: { width: "32%", paddingRight: 4 },
    cellQty: { width: "10%", textAlign: "center" },
    cellRemarks: { width: "22%", paddingLeft: 4 },
    cellText: {
        fontSize: 10,
    },
    cellTextCaps: {
        fontSize: 10,
        textTransform: "capitalize",
    },
    // ────── Summary ──────
    summaryRow: {
        flexDirection: "row",
        justifyContent: "flex-end",
        borderTop: border,
        paddingTop: 6,
        marginTop: 2,
        paddingRight: 6,
    },
    summaryText: {
        fontSize: 11,
        fontFamily: "Roboto",
        fontWeight: "heavy",
    },
});

const InternalTransferPDF = ({ requisition }) => {
    if (!requisition) return null;

    const formattedDate = requisition.createdAt
        ? format(new Date(requisition.createdAt), "dd-MMM-yyyy hh:mm a")
        : "";

    return (
        <Document>
            <Page size="A4" style={styles.page} wrap>
                {/* Top Center Header */}
                <View style={{ textAlign: "center", marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: "bold", fontFamily: "Roboto" }}>
                        Jagruti Rehabilitation Centre PVT LTD
                    </Text>
                </View>

                {/* Requisition Section */}
                <View style={{ marginBottom: 12, borderBottom: border, paddingBottom: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: 900, fontFamily: "Roboto", marginBottom: 4 }}>REQUISITION</Text>
                    <Text style={{ fontSize: 10, marginBottom: 2 }}>
                        Order No : {requisition.requisitionNumber || "—"}
                    </Text>
                    <Text style={{ fontSize: 10 }}>
                        Date : {formattedDate}
                    </Text>
                </View>

                {/* Supplier Section */}
                <View style={{ marginBottom: 12, borderBottom: border, paddingBottom: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: 900, fontFamily: "Roboto", marginBottom: 4 }}>SUPPLIER</Text>
                    <View style={{ flexDirection: "row", gap: 20 }}>
                        {/* Left Column */}
                        <View style={{ width: "50%" }}>
                            <Text style={{ fontSize: 10, marginBottom: 2 }}>
                                {requisition.type === "ORDER_FROM_SAAREYAN" ? "Sareyaan Pharma" : requisition.fulfillingCenter?.title || "—"}
                            </Text>
                            <Text style={{ fontSize: 10, marginBottom: 2 }}>
                                Address: {requisition.fulfillingCenter?.address || "Full address"}
                            </Text>
                        </View>
                        {/* Right Column */}
                        <View style={{ width: "50%" }}>
                            {requisition.dispatch?.dispatchedAt && (
                                <>
                                    <Text style={{ fontSize: 10, color: "#000", marginBottom: 2, fontWeight: 500 }}>
                                        Dispatched : {format(new Date(requisition.dispatch.dispatchedAt), "dd-MMM-yyyy hh:mm a")}
                                    </Text>
                                    {requisition.dispatch?.courierName && (
                                        <Text style={{ fontSize: 10, color: "#000", marginBottom: 1, fontWeight: 500 }}>
                                            Courier : {capitalizeWords(requisition.dispatch.courierName)}
                                        </Text>
                                    )}
                                    {requisition.dispatch?.courierId && (
                                        <Text style={{ fontSize: 10, color: "#000", fontWeight: 500 }}>
                                            Tracking ID : {requisition.dispatch.courierId}
                                        </Text>
                                    )}
                                </>
                            )}
                        </View>
                    </View>
                </View>

                {/* Recipient Section */}
                <View style={{ marginBottom: 12, borderBottom: border, paddingBottom: 8 }}>
                    <Text style={{ fontSize: 12, fontWeight: 900, fontFamily: "Roboto", marginBottom: 4 }}>RECIPIENT</Text>
                    <Text style={{ fontSize: 10, marginBottom: 2 }}>
                        {requisition.requestingCenter?.title || "—"}
                    </Text>
                    <Text style={{ fontSize: 10, marginBottom: 2 }}>
                        Address: {requisition.requestingCenter?.address || "Full address"}
                    </Text>
                    {requisition.receive?.receivedAt && (
                        <Text style={{ fontSize: 9, color: "#666" }}>
                            Received : {format(new Date(requisition.receive.receivedAt), "dd-MMM-yyyy hh:mm a")}
                        </Text>
                    )}
                </View>


                {/* Items Table */}
                {(requisition.items || []).length > 0 && (
                    <>
                        <View style={{ marginTop: 10 }}>
                            {/* Table Header */}
                            <View style={[styles.tableHeader, { paddingVertical: 5, gap: 4 }]}>
                                <View style={{ width: "3%", paddingRight: 2 }}>
                                    <Text style={styles.tableHeaderText}>No.</Text>
                                </View>
                                <View style={{ width: "41%", paddingRight: 4 }}>
                                    <Text style={styles.tableHeaderText}>Name</Text>
                                </View>
                                <View style={{ width: "13%", textAlign: "center" }}>
                                    <Text style={styles.tableHeaderText}>Quantity</Text>
                                </View>
                                {/* <View style={{ width: "14%", textAlign: "center" }}>
                                    <Text style={styles.tableHeaderText}>Base Rate</Text>
                                </View> */}
                                <View style={{ width: "11%", textAlign: "center" }}>
                                    <Text style={styles.tableHeaderText}>Rate</Text>
                                </View>
                                <View style={{ width: "11%", textAlign: "center" }}>
                                    <Text style={styles.tableHeaderText}>Amount</Text>
                                </View>
                                <View style={{ width: "21%", paddingLeft: 4 }}>
                                    <Text style={styles.tableHeaderText}>Batch</Text>
                                </View>
                            </View>

                            {/* Table Body */}
                            {requisition.items.map((item, idx) => {
                                const pharm = item.pharmacyId || {};
                                const med = pharm.medicineId || {};
                                const customId = pharm.id || "";
                                const medType = med.type || "";
                                const medicineName = pharm.medicineName || item.medicineName || "";
                                const strength = pharm.Strength || pharm.strength || item.strength || "";
                                const purchaseUnit = med.purchaseUnit || "";

                                const primaryLabel = [
                                    customId ? `[${customId}]` : "",
                                    medType,
                                    medicineName,
                                    strength,
                                ]
                                    .filter(Boolean)
                                    .join(" ");

                                const dispatchedQty = item.dispatchedQty ?? item.approvedQty ?? item.requestedQty ?? 0;

                                const conversion = med.conversion || {};
                                const conversionFactor = (conversion.baseQuantity || 1) / (conversion.purchaseQuantity || 1);
                                const purchasePrice = pharm.purchasePrice || 0;
                                // const baseRate = purchasePrice;
                                const rate = purchasePrice * (conversionFactor || 1);
                                // const baseUnit = med.baseUnit || "";
                                const amount = dispatchedQty * rate;
                                const batch = item.batch ? `${item.batch} (Manually)` : "Automatically";

                                return (
                                    <View
                                        key={item._id || idx}
                                        style={[styles.tableRow, idx % 2 !== 0 ? styles.tableRowAlt : {}, { gap: 4 }]}
                                        wrap={false}
                                    >
                                        <View style={{ width: "3%", paddingRight: 2 }}>
                                            <Text style={styles.cellText}>{idx + 1}</Text>
                                        </View>
                                        <View style={{ width: "41%", paddingRight: 4 }}>
                                            <Text style={styles.cellText}>{primaryLabel}</Text>
                                        </View>
                                        <View style={{ width: "13%", textAlign: "center" }}>
                                            <Text style={{ ...styles.cellText, textAlign: "center" }}>
                                                {dispatchedQty} {pluralizeUnit(purchaseUnit)}
                                            </Text>
                                        </View>
                                        {/* <View style={{ width: "14%", textAlign: "center" }}>
                                            <Text style={{ ...styles.cellText, textAlign: "center" }}>
                                                Rs. {Number(baseRate || 0).toFixed(2)}/- {pluralizeUnit(baseUnit)}
                                            </Text>
                                        </View> */}
                                        <View style={{ width: "11%", textAlign: "center" }}>
                                            <Text style={{ ...styles.cellText, textAlign: "center" }}>
                                                Rs. {Number(rate || 0).toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={{ width: "11%", textAlign: "center" }}>
                                            <Text style={{ ...styles.cellText, textAlign: "center" }}>
                                                Rs. {Number(amount || 0).toFixed(2)}
                                            </Text>
                                        </View>
                                        <View style={{ width: "21%", paddingLeft: 4 }}>
                                            <Text style={styles.cellText}>{batch}</Text>
                                        </View>
                                    </View>
                                );
                            })}

                            {/* Total Row */}
                            <View style={[styles.tableRow, { borderTop: border, paddingTop: 8, marginTop: 2 }]}>
                                <View style={{ width: "77%", textAlign: "right", paddingRight: 4 }}>
                                    <Text style={{ ...styles.cellText, textAlign: "right", fontWeight: 600 }}>Total</Text>
                                </View>
                                <View style={{ width: "11%", textAlign: "center" }}>
                                    <Text style={{ ...styles.cellText, textAlign: "center", fontWeight: 600 }}>
                                        {formatCurrencyPDF((requisition.items || []).reduce((sum, item) => {
                                            const pharm = item.pharmacyId || {};
                                            const med = pharm.medicineId || {};
                                            const dispatchedQty = item.dispatchedQty ?? item.approvedQty ?? item.requestedQty ?? 0;
                                            const conversion = med.conversion || {};
                                            const conversionFactor = (conversion.baseQuantity || 1) / (conversion.purchaseQuantity || 1);
                                            const purchasePrice = pharm.purchasePrice || 0;
                                            const baseRate = purchasePrice;
                                            const convertedQuantity = dispatchedQty * conversionFactor;
                                            return sum + (convertedQuantity * baseRate);
                                        }, 0))}
                                    </Text>
                                </View>
                                <View style={{ width: "12%" }} />
                            </View>
                        </View>

                        {/* Signature */}
                        <View style={{ marginTop: 50, paddingTop: 30 }}>
                            <View style={{ marginLeft: "auto", width: "35%" }}>
                                <View style={{ borderTop: border, paddingTop: 5, width: "100%" }} />
                                <Text style={{ fontSize: 12, fontWeight: 600, marginTop: 0, textAlign: "center" }}>
                                    Signature
                                </Text>
                            </View>
                        </View>
                    </>
                )}

                <Footer />
            </Page>
        </Document>
    );
};

export default InternalTransferPDF;
