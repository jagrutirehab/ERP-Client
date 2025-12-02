import React from "react";
const UndertakingDischargeFormFooter = ({ center }) => {
  const styles = {
    contactFooter: {
      width: "100%",
      padding: "30px 0",
      fontFamily: "Arial, sans-serif",
      boxSizing: "border-box",
      backgroundColor: "white",
    },
    contactInfoContainer: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 40px",
      color: "#444",
    },
    contactItem: {
      display: "flex",
      alignItems: "flex-start",
      flexBasis: "30%",
    },
    icon: {
      width: "24px",
      height: "24px",
      minWidth: "24px",
      fill: "#FFC000",
      marginRight: "10px",
    },
    details: {
      display: "flex",
      flexDirection: "column",
      fontSize: "10px",
      lineHeight: "1.5",
      paddingTop: "2px",
    },
    linkStyle: {
      color: "#444",
      textDecoration: "none",
      lineHeight: "1.5",
    },
    addressDetails: {
      maxWidth: "280px",
    },
    bottomBar: {
      height: "10px",
      backgroundColor: "#003366",
      width: "100%",
      marginTop: "20px",
      borderRadius: "70px 70px 0px 0px",
    },
  };

  return (
    <footer style={styles.contactFooter}>
      <div style={styles.contactInfoContainer}>
        {/* Phone Contact */}
        <div style={styles.contactItem}>
          <svg style={styles.icon} viewBox="0 0 24 24">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
          {/* Added Optional Chaining just in case data is slow to load */}
          <span style={styles.details}>{center?.numbers}</span>
        </div>

        {/* Website/Email Contact */}
        <div style={styles.contactItem}>
          <svg style={styles.icon} viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
          </svg>
          <div style={styles.details}>
            <a
              href="http://www.jagrutirehab.org"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.linkStyle}
            >
              www.jagrutirehab.org
            </a>
            <a href="mailto:info@jagrutirehab.org" style={styles.linkStyle}>
              info@jagrutirehab.org
            </a>
          </div>
        </div>

        {/* Location/Address Contact */}
        <div style={styles.contactItem}>
          <svg style={styles.icon} viewBox="0 0 24 24">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span style={{ ...styles.details, ...styles.addressDetails }}>
            {center?.address}
          </span>
        </div>
      </div>
      <div style={styles.bottomBar}></div>
    </footer>
  );
};

export default UndertakingDischargeFormFooter;
