import Footer from '../Charts/Footer';
import PropTypes from 'prop-types';
import { Document, Page, Font, StyleSheet } from '@react-pdf/renderer';
import Roboto from "../../../assets/fonts/Roboto-Bold.ttf";
import Body from './Body';
import DoctorSignature from '../Charts/DoctorSignature';
import Header from './Header';


Font.register({
    family: "Roboto",
    fonts: [{ src: Roboto, fontWeight: "heavy" }],
});

const styles = StyleSheet.create({
    page: {
        fontFamily: "Helvetica",
        fontSize: 11,
        padding: 30,
        lineHeight: 1.5,
    },
})



const ClinicalTest = ({ clinicalTest, charts }) => {

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Header
                    date={clinicalTest?.createdAt}
                    patient={clinicalTest?.patientId || {}}
                    doctor={clinicalTest?.doctorId || {}}
                />
                <Body clinicalTest={clinicalTest} charts={charts} />
                <DoctorSignature doctor={clinicalTest?.doctorId} />
                <Footer />
            </Page>
        </Document>
    )
}

ClinicalTest.propTypes = {
    center: PropTypes.object,
    clinicalTest: PropTypes.object,
}

export default ClinicalTest;