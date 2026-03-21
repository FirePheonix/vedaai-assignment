import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"
import type { QuestionPaper } from "@/lib/schemas"

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 11,
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 56,
    color: "#111",
  },
  schoolName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 4,
  },
  subjectLine: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 2,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
  },
  metaItem: {
    fontSize: 11,
  },
  metaBold: {
    fontFamily: "Helvetica-Bold",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#aaa",
    marginVertical: 6,
  },
  compulsory: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 10,
  },
  studentInfoRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 6,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
  },
  underline: {
    borderBottomWidth: 1,
    borderBottomColor: "#111",
    width: 140,
    marginLeft: 4,
    marginBottom: 0,
  },
  studentBlock: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    marginBottom: 6,
    marginTop: 8,
  },
  sectionQType: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginBottom: 2,
  },
  sectionInstruction: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    marginBottom: 8,
    color: "#444",
  },
  questionRow: {
    flexDirection: "row",
    marginBottom: 8,
    paddingLeft: 4,
  },
  qIndex: {
    width: 20,
    fontSize: 11,
    textAlign: "right",
    paddingRight: 4,
    flexShrink: 0,
  },
  qText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },
  endText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginTop: 12,
  },
  answerKeyTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    marginTop: 20,
    marginBottom: 8,
  },
  answerRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingLeft: 4,
  },
})

function PaperDocument({ paper }: { paper: QuestionPaper }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <Text style={styles.schoolName}>{paper.schoolName || "School Name"}</Text>
        <Text style={styles.subjectLine}>Subject: {paper.subject}</Text>
        <Text style={styles.subjectLine}>Class: {paper.className}</Text>

        {/* Meta */}
        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>
            Time Allowed: <Text style={styles.metaBold}>{paper.timeAllowed}</Text>
          </Text>
          <Text style={styles.metaItem}>
            Maximum Marks: <Text style={styles.metaBold}>{paper.maximumMarks}</Text>
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.compulsory}>All questions are compulsory unless stated otherwise.</Text>

        {/* Student info */}
        <View style={styles.studentBlock}>
          <View style={styles.studentInfoRow}>
            <Text>Name: </Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.studentInfoRow}>
            <Text>Roll Number: </Text>
            <View style={styles.underline} />
          </View>
          <View style={styles.studentInfoRow}>
            <Text>Class: {paper.className} Section: </Text>
            <View style={styles.underline} />
          </View>
        </View>

        {/* Sections */}
        {paper.sections.map((section, si) => (
          <View key={section.id}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionQType}>{section.questionType}</Text>
            <Text style={styles.sectionInstruction}>{section.instruction}</Text>

            {section.questions.map((q, qi) => (
              <View key={q.id} style={styles.questionRow}>
                <Text style={styles.qIndex}>{qi + 1}.</Text>
                <Text style={styles.qText}>
                  [{q.difficulty}] {q.text} [{q.marks} Marks]
                </Text>
              </View>
            ))}

            {si === paper.sections.length - 1 && (
              <Text style={styles.endText}>End of Question Paper</Text>
            )}
          </View>
        ))}

        {/* Answer Key */}
        {paper.answerKey && paper.answerKey.length > 0 && (
          <View>
            <Text style={styles.answerKeyTitle}>Answer Key:</Text>
            {paper.answerKey.map((ak, i) => (
              <View key={ak.questionId} style={styles.answerRow}>
                <Text style={styles.qIndex}>{i + 1}.</Text>
                <Text style={styles.qText}>{ak.answer}</Text>
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  )
}

export async function downloadPaperPDF(paper: QuestionPaper) {
  const blob = await pdf(<PaperDocument paper={paper} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `${paper.subject}-${paper.className}-paper.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
