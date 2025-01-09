import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import miamiDadeLogo from "../assets/images/miami-dade-county-logo.png";
import mdAdoptLogo from "../assets/images/md-adopt-logo.png";
import toscanoSignature from "../assets/images/toscano-signature.png";

Font.register({
  family: "Roboto",
  fonts: [
    { src: "/src/assets/fonts/roboto.ttf", fontWeight: "normal" },
    { src: "/src/assets/fonts/roboto-bold.ttf", fontWeight: "bold" },
    { src: "/src/assets/fonts/roboto-italic.ttf", fontStyle: "italic" },
  ],
});

Font.register({
  family: "Verdana",
  fonts: [
    { src: "/src/assets/fonts/verdana.ttf", fontWeight: "normal" },
    { src: "/src/assets/fonts/verdana-bold.ttf", fontWeight: "bold" },
  ],
});

// Define styles for the PDF
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Roboto",
  },
  headerContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 10,
    paddingRight: 10,
  },
  headerImageLeft: {
    width: 100,
    height: 50,
    objectFit: "fit",
    marginTop: 30,
  },
  headerImageRight: {
    width: 100,
    objectFit: "fit",
  },
  header: {
    textAlign: "center",
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    textAlign: "center",
    fontFamily: "Verdana",
    fontWeight: "bold",
  },
  section: {
    marginBottom: 15,
  },
  paragraphContainer: {
    marginBottom: 15,
    paddingLeft: 10,
    paddingRight: 10,
  },
  label: {
    fontWeight: "bold",
  },
  row: {
    flexDirection: "row",
  },
  field: {
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 9,
    marginTop: 10,
  },
  finePrint: {
    fontSize: 7,
    marginTop: 10,
  },
  terms: {
    fontStyle: "italic",
    paddingTop: 10,
    paddingBottom: 10,
  },
});

const currDate = new Date().toLocaleDateString("en-US");

// Define the PDF structure
const MDASTIPForm = ({ entryData }) => (
  <Document>
    {console.log(entryData)}
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.headerContainer}>
        <Image style={styles.headerImageLeft} src={miamiDadeLogo} />
        <View style={styles.header}>
          <Text style={styles.title}>Miami-Dade Animal Services</Text>
          <Text style={styles.title}>TIP Program</Text>
          <Text>3599 NW 79 Ave</Text>
          <Text>Doral, FL 33122</Text>
        </View>
        <Image style={styles.headerImageRight} src={mdAdoptLogo} />
      </View>

      {/* Date Section */}
      <View style={styles.section}>
        <Text>
          <Text style={styles.label}>Today’s Date:</Text>
          {currDate}
        </Text>
      </View>

      {/* Trapper Details */}
      <View style={styles.section}>
        <Text>
          <Text style={styles.label}>Name: </Text>
          {entryData.trapper.firstName} {entryData.trapper.lastName}
        </Text>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Text style={{ flex: 1 }}>
            <Text style={styles.label}>Address:</Text>
            {entryData.trapper.address.street}, {entryData.trapper.address.city}
            , {entryData.trapper.address.state} {entryData.trapper.address.zip}
          </Text>
          <Text style={{ flex: 1 }}>
            <Text style={styles.label}>Apt:</Text>
            {entryData.trapper.address.aptartment}
          </Text>
        </View>
        <Text>
          <Text style={styles.label}>Phone:</Text>
          {entryData.trapper.phone}
        </Text>
      </View>

      {/* Cat Details */}
      <View style={styles.section}>
        <Text style={styles.label}>Animal Information:</Text>
        <Text>
          <Text style={styles.label}>Animal ID: </Text>
          {entryData.catId}
        </Text>
        <Text>
          <Text style={styles.label}>Name: </Text>
          {entryData.catName}
        </Text>
        <Text>
          <Text style={styles.label}>Breed: </Text>
          {entryData.breed}
        </Text>
        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Text style={{ flex: 1 }}>
            <Text style={styles.label}>Color:</Text> {entryData.color}
          </Text>
          <Text style={{ flex: 1 }}>
            <Text style={styles.label}>Sex:</Text> {entryData.sex}
          </Text>
          <Text style={{ flex: 2 }}>
            <Text style={styles.label}>Age:</Text> {entryData.age}
          </Text>
        </View>
        {/* Capture Details */}
        <View style={styles.row}>
          <Text style={{ flex: 1 }}>
            <Text style={styles.label}>Crossing Location: </Text>
            {entryData.crossStreet}
          </Text>
          <Text style={{ flex: 1 }}>
            <Text style={styles.label}>Crossing Zip Code: </Text>
            {entryData.crossZip}
          </Text>
        </View>
        <Text>
          <Text style={styles.label}>Intake Date: </Text>
          {entryData.intakePickupDate}
        </Text>
        <Text>
          <Text style={styles.label}>Pick-up Date: </Text>
          {entryData.intakePickupDate}
        </Text>
      </View>

      {/* Program Guidelines */}
      <View style={styles.paragraphContainer}>
        <Text style={styles.paragraph}>
          The purpose of the Program is to humanely manage free roaming
          community cat population by providing a monetary incentive to
          community cat trappers for community cats to be vaccinated, sterilized
          and eartipped by the Street Cat Clinic on behalf of the Animal
          Services Department. The following guidelines must be followed in
          order to receive the incentive:
        </Text>
        <Text style={styles.paragraph}>
          Cats will be returned by the trapper to the area from which cats were
          trapped, once services have been performed and the cats are medically
          cleared for release. The trapper shall be paid fifteen dollars
          ($15.00) for each cat eligible(*) to receive TNVR services. TNVR
          services shall be solely and exclusively defined by ASD, which shall
          determine, at its sole discretion, eligibility for TNVR services.
          {"\n"}ASD reserves the right to reject TNVR services, if in the best
          interest of the cat.{"\n"}Trapper shall trap and/or transport the cats
          to the Street Cat Clinic; all cats must be returned to their original
          location (colony).{"\n"}Trapper must treat each cat humanely and with
          dignity and respect.{"\n"}Failure of the trapper to pick up or deliver
          the cat in a timely and proper manner, may result in the withholding
          of the incentive.{"\n"}The trapper will not engage in malicious
          activities that may damage the reputation of ASD, the Street Cat
          Clinic, its other rescue partners, employees or volunteers.{"\n"}
          Trappers should keep and maintain records of all cats they have
          brought to the Street Cat Clinic or ASD for TNVR.
        </Text>
        <Text style={styles.finePrint}>
          (*)Eligible Cats: For the purposes of Miami-Dade County Animal
          Services, an eligible cat for the TNVR Incentive Program contemplated
          to participate in this program shall refer to a cat that was intended
          to receive sterilization and other services under ASD’s TNVR program,
          even if, unbeknownst to the trapper, the cat’s age, health, injury, or
          prior sterilization may prevent the cat from receiving spay/neuter
          services.
        </Text>
      </View>

      {/* Signature Section */}
      <View
        style={{ flexDirection: "row", alignItems: "flex-end", height: 50 }}
      >
        <View style={{ flex: 1, padding: 7 }}>
          <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
            <Image style={{ flex: 1 }} src={entryData.trapper.signature} />
            <Text style={{ flex: 1 }}>
              {entryData.trapper.firstName} {entryData.trapper.lastName}
            </Text>
            <Text style={{ flex: 1 }}>{currDate}</Text>
          </View>
          <View style={{ flexDirection: "row", borderTop: "1px solid black" }}>
            <Text style={{ flex: 1 }}>Signature</Text>
            <Text style={{ flex: 1 }}>Name</Text>
            <Text style={{ flex: 1 }}>Date</Text>
          </View>
        </View>
        <View style={{ flex: 1, padding: 7 }}>
          <View style={{ flexDirection: "row" }}>
            <Text style={{ flex: 1 }}></Text>
          </View>
          <View style={{ flexDirection: "row", borderTop: "1px solid black" }}>
            <Text style={{ flex: 1 }}>Witness</Text>
            <Text style={{ flex: 1 }}>Date</Text>
          </View>
        </View>
      </View>

      {/* Terms Section */}
      <Text style={styles.terms}>
        By signing below, the TIP Coordinator certifies the information for each
        TIP participant has been verified against our Shelter Management
        Application information and are entitled to received $15.00 under the
        TIP Program.
      </Text>

      {/* TIP Coordinator Section */}
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingRight: 50,
          }}
        >
          <Text>
            <Text style={styles.label}>TIP Coordinator: </Text>
            Matthew Toscano
          </Text>
          <Text>
            <Text style={styles.label}>Date: </Text>
            {currDate}
          </Text>
        </View>
        <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
          <Text style={styles.label}>Signature: </Text>
          <Image style={{ width: 100, height: 50 }} src={toscanoSignature} />
        </View>
      </View>
    </Page>
  </Document>
);

export default MDASTIPForm;
