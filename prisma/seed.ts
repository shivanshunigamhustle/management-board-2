import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function daysFromNow(days: number, hour = 10, minute = 0) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d;
}

async function main() {
  const passwordHash = await bcrypt.hash("demo1234", 10);

  // ---------- Users ----------
  const admin = await prisma.user.upsert({
    where: { email: "admin@demo.com" },
    update: { name: "Priya Sharma", role: "ADMIN" },
    create: { name: "Priya Sharma", email: "admin@demo.com", passwordHash, role: "ADMIN" },
  });

  const admin2 = await prisma.user.upsert({
    where: { email: "admin2@demo.com" },
    update: { name: "David Okonkwo", role: "ADMIN" },
    create: { name: "David Okonkwo", email: "admin2@demo.com", passwordHash, role: "ADMIN" },
  });

  const member = await prisma.user.upsert({
    where: { email: "member@demo.com" },
    update: { name: "Arjun Mehta", role: "MEMBER" },
    create: { name: "Arjun Mehta", email: "member@demo.com", passwordHash, role: "MEMBER" },
  });

  const member2 = await prisma.user.upsert({
    where: { email: "member2@demo.com" },
    update: { name: "Kavita Rao", role: "MEMBER" },
    create: { name: "Kavita Rao", email: "member2@demo.com", passwordHash, role: "MEMBER" },
  });

  const member3 = await prisma.user.upsert({
    where: { email: "member3@demo.com" },
    update: { name: "Fatima Al-Sayed", role: "MEMBER" },
    create: { name: "Fatima Al-Sayed", email: "member3@demo.com", passwordHash, role: "MEMBER" },
  });

  const member4 = await prisma.user.upsert({
    where: { email: "member4@demo.com" },
    update: { name: "Lucas Bianchi", role: "MEMBER" },
    create: { name: "Lucas Bianchi", email: "member4@demo.com", passwordHash, role: "MEMBER" },
  });

  const allMembers = [member, member2, member3, member4];
  const allUsers = [admin, admin2, ...allMembers];

  // ---------- Clean slate for everything except users ----------
  await prisma.meeting.deleteMany();
  await prisma.document.deleteMany();
  await prisma.category.deleteMany();
  await prisma.activityLog.deleteMany();

  // ---------- Categories (main + subcategories) ----------
  const board = await prisma.category.create({ data: { name: "Board of Directors" } });
  const auditCommittee = await prisma.category.create({
    data: { name: "Audit Committee", parentId: board.id },
  });
  const riskCommittee = await prisma.category.create({
    data: { name: "Risk Committee", parentId: board.id },
  });
  const governanceCommittee = await prisma.category.create({
    data: { name: "Governance & Nomination Committee", parentId: board.id },
  });
  const financeCommittee = await prisma.category.create({
    data: { name: "Finance Committee", parentId: board.id },
  });

  const now = new Date();

  // ================= 1. Upcoming board meeting (SCHEDULED, with pack + resolution) =================
  const q3Meeting = await prisma.meeting.create({
    data: {
      title: "Q3 Board Meeting",
      categoryId: board.id,
      type: "MEETING",
      scheduledAt: daysFromNow(5, 10, 0),
      status: "SCHEDULED",
      joinLink: "https://meet.example.com/q3-board",
      description: "Quarterly review of financials, strategy, and risk.",
      agendaItems: {
        create: [
          { order: 1, title: "Approval of previous minutes" },
          { order: 2, title: "CFO financial update" },
          { order: 3, title: "Resolution: approve FY26 capex budget" },
          { order: 4, title: "Risk & compliance update" },
          { order: 5, title: "Any other business" },
        ],
      },
      resolutions: {
        create: [
          { text: "Approve the FY26 capital expenditure budget of $2.4M" },
          { text: "Approve the appointment of an external auditor for FY26" },
        ],
      },
      attendances: {
        create: [
          { userId: admin.id, status: "INVITED", meetingRole: "PRESENTER" },
          { userId: admin2.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member2.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member3.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member4.id, status: "INVITED", meetingRole: "OBSERVER" },
        ],
      },
      actionItems: {
        create: [
          {
            assignedToId: member.id,
            description: "Review risk register before the meeting",
            dueDate: daysFromNow(3),
            status: "OPEN",
          },
          {
            assignedToId: member3.id,
            description: "Prepare governance committee summary slide",
            dueDate: daysFromNow(4),
            status: "OPEN",
          },
        ],
      },
    },
  });

  const q3Pack = await prisma.document.create({
    data: {
      meetingId: q3Meeting.id,
      uploadedById: admin.id,
      fileName: "Q3-Board-Pack.pdf",
      fileUrl: "/uploads/q3-board-pack.pdf",
      fileType: "PDF",
      version: 1,
    },
  });

  await prisma.document.create({
    data: {
      meetingId: q3Meeting.id,
      uploadedById: admin.id,
      fileName: "Q3-Financial-Summary.xlsx",
      fileUrl: "/uploads/q3-financial-summary.xlsx",
      fileType: "XLSX",
      version: 2,
      restricted: true,
    },
  });

  await prisma.agendaItem.updateMany({
    where: { meetingId: q3Meeting.id, title: "CFO financial update" },
    data: { documentId: q3Pack.id },
  });

  await prisma.comment.createMany({
    data: [
      { documentId: q3Pack.id, userId: member.id, content: "Page 14 capex table looks off vs. last quarter — can we confirm figures?" },
      { documentId: q3Pack.id, userId: admin.id, content: "Good catch, corrected version going out today." },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      { meetingId: q3Meeting.id, userId: admin.id, content: "Reminder: please review the capex slides before Monday." },
      { meetingId: q3Meeting.id, userId: member2.id, content: "Will do — reviewing this afternoon." },
    ],
  });

  // ================= 2. Live meeting happening now =================
  const liveMeeting = await prisma.meeting.create({
    data: {
      title: "Special Session — M&A Update",
      categoryId: board.id,
      type: "MEETING",
      scheduledAt: new Date(now.getTime() - 1000 * 60 * 20),
      status: "LIVE",
      joinLink: "https://meet.example.com/ma-update",
      description: "Confidential briefing on the proposed acquisition of a regional logistics partner.",
      agendaItems: {
        create: [
          { order: 1, title: "NDA & confidentiality reminder" },
          { order: 2, title: "Deal structure overview" },
          { order: 3, title: "Resolution: authorize non-binding LOI" },
        ],
      },
      resolutions: {
        create: [{ text: "Authorize management to sign a non-binding Letter of Intent" }],
      },
      attendances: {
        create: [
          { userId: admin.id, status: "PRESENT", meetingRole: "PRESENTER", signedAt: now },
          { userId: admin2.id, status: "PRESENT", meetingRole: "VOTER", signedAt: now },
          { userId: member.id, status: "PRESENT", meetingRole: "VOTER", signedAt: now },
          { userId: member2.id, status: "ABSENT", meetingRole: "VOTER" },
          { userId: member3.id, status: "PRESENT", meetingRole: "VOTER", signedAt: now },
        ],
      },
    },
  });

  const maDoc = await prisma.document.create({
    data: {
      meetingId: liveMeeting.id,
      uploadedById: admin.id,
      fileName: "MA-Deal-Brief-Confidential.pdf",
      fileUrl: "/uploads/ma-deal-brief-confidential.pdf",
      fileType: "PDF",
      version: 1,
      restricted: true,
    },
  });

  await prisma.vote.createMany({
    data: [
      {
        resolutionId: (await prisma.resolution.findFirstOrThrow({ where: { meetingId: liveMeeting.id } })).id,
        userId: admin.id,
        choice: "FOR",
      },
    ],
  });

  await prisma.chatMessage.createMany({
    data: [
      { meetingId: liveMeeting.id, userId: admin.id, content: "Starting now — everyone please confirm you've signed the NDA acknowledgement." },
      { meetingId: liveMeeting.id, userId: member.id, content: "Confirmed." },
      { meetingId: liveMeeting.id, userId: member3.id, content: "Confirmed, joining from mobile." },
    ],
  });

  await prisma.comment.create({
    data: { documentId: maDoc.id, userId: admin2.id, content: "Section 3 valuation range needs a footnote on FX assumptions." },
  });

  // ================= 3–5. Completed meetings with minutes =================
  const q2Meeting = await prisma.meeting.create({
    data: {
      title: "Q2 Board Meeting",
      categoryId: board.id,
      type: "MEETING",
      scheduledAt: daysFromNow(-20, 10, 0),
      status: "COMPLETED",
      description: "Quarterly review — completed.",
      agendaItems: {
        create: [
          { order: 1, title: "Approval of previous minutes" },
          { order: 2, title: "CEO update" },
          { order: 3, title: "Resolution: approve updated vendor contract terms" },
        ],
      },
      resolutions: { create: [{ text: "Approve updated terms with primary logistics vendor" }] },
      attendances: {
        create: [
          { userId: admin.id, status: "PRESENT", meetingRole: "PRESENTER", signedAt: daysFromNow(-20) },
          { userId: member.id, status: "PRESENT", meetingRole: "VOTER", signedAt: daysFromNow(-20) },
          { userId: member2.id, status: "ABSENT", meetingRole: "VOTER" },
          { userId: member3.id, status: "PRESENT", meetingRole: "VOTER", signedAt: daysFromNow(-20) },
        ],
      },
      actionItems: {
        create: [
          { assignedToId: member2.id, description: "Circulate updated vendor contract", status: "DONE" },
          { assignedToId: member.id, description: "Follow up with legal on indemnity clause", status: "DONE" },
        ],
      },
      minutes: {
        create: {
          content:
            "The board reviewed Q2 performance and approved the updated vendor contract terms. Legal to finalize redlines by end of month.",
          finalizedAt: daysFromNow(-20),
        },
      },
    },
  });

  await prisma.document.create({
    data: {
      meetingId: q2Meeting.id,
      uploadedById: admin.id,
      fileName: "Q2-Board-Pack.pdf",
      fileUrl: "/uploads/q2-board-pack.pdf",
      fileType: "PDF",
      version: 1,
    },
  });

  const q2Resolution = await prisma.resolution.findFirstOrThrow({ where: { meetingId: q2Meeting.id } });
  await prisma.vote.createMany({
    data: [
      { resolutionId: q2Resolution.id, userId: admin.id, choice: "FOR" },
      { resolutionId: q2Resolution.id, userId: member.id, choice: "FOR" },
      { resolutionId: q2Resolution.id, userId: member3.id, choice: "ABSTAIN" },
    ],
  });

  const auditMeeting = await prisma.meeting.create({
    data: {
      title: "Audit Committee — Annual Review",
      categoryId: auditCommittee.id,
      type: "MEETING",
      scheduledAt: daysFromNow(-35, 14, 0),
      status: "COMPLETED",
      description: "Annual review of internal controls and external audit findings.",
      agendaItems: {
        create: [
          { order: 1, title: "External auditor's report" },
          { order: 2, title: "Internal controls assessment" },
          { order: 3, title: "Resolution: accept audit findings" },
        ],
      },
      resolutions: { create: [{ text: "Accept the FY25 external audit findings and management response" }] },
      attendances: {
        create: [
          { userId: admin.id, status: "PRESENT", meetingRole: "PRESENTER", signedAt: daysFromNow(-35) },
          { userId: member2.id, status: "PRESENT", meetingRole: "VOTER", signedAt: daysFromNow(-35) },
          { userId: member4.id, status: "PRESENT", meetingRole: "VOTER", signedAt: daysFromNow(-35) },
        ],
      },
      actionItems: {
        create: [
          { assignedToId: member2.id, description: "Close out 2 minor audit findings with finance team", status: "OPEN", dueDate: daysFromNow(10) },
        ],
      },
      minutes: {
        create: {
          content: "Committee accepted the FY25 audit findings. Two minor findings to be closed by finance within 30 days.",
          finalizedAt: daysFromNow(-35),
        },
      },
    },
  });

  await prisma.document.create({
    data: {
      meetingId: auditMeeting.id,
      uploadedById: admin.id,
      fileName: "FY25-External-Audit-Report.pdf",
      fileUrl: "/uploads/fy25-external-audit-report.pdf",
      fileType: "PDF",
      version: 1,
      restricted: true,
    },
  });

  const riskMeeting = await prisma.meeting.create({
    data: {
      title: "Risk Committee — Quarterly Risk Review",
      categoryId: riskCommittee.id,
      type: "MEETING",
      scheduledAt: daysFromNow(-10, 9, 30),
      status: "COMPLETED",
      description: "Review of the enterprise risk register and emerging risks.",
      agendaItems: {
        create: [
          { order: 1, title: "Risk register walkthrough" },
          { order: 2, title: "Cybersecurity posture update" },
          { order: 3, title: "Emerging risks discussion" },
        ],
      },
      attendances: {
        create: [
          { userId: admin2.id, status: "PRESENT", meetingRole: "PRESENTER", signedAt: daysFromNow(-10) },
          { userId: member.id, status: "PRESENT", meetingRole: "VOTER", signedAt: daysFromNow(-10) },
          { userId: member4.id, status: "ABSENT", meetingRole: "VOTER" },
        ],
      },
      actionItems: {
        create: [
          { assignedToId: member.id, description: "Draft updated cybersecurity incident response plan", status: "OPEN", dueDate: daysFromNow(15) },
        ],
      },
      minutes: {
        create: {
          content: "Risk register reviewed with no critical changes. Cybersecurity plan to be refreshed within Q3.",
          finalizedAt: daysFromNow(-10),
        },
      },
    },
  });

  await prisma.document.create({
    data: {
      meetingId: riskMeeting.id,
      uploadedById: admin2.id,
      fileName: "Enterprise-Risk-Register-Q2.pdf",
      fileUrl: "/uploads/enterprise-risk-register-q2.pdf",
      fileType: "PDF",
      version: 3,
    },
  });

  // ================= 6. Archived meeting =================
  const archivedMeeting = await prisma.meeting.create({
    data: {
      title: "Governance Committee — Board Composition Review",
      categoryId: governanceCommittee.id,
      type: "MEETING",
      scheduledAt: daysFromNow(-90, 11, 0),
      status: "ARCHIVED",
      description: "Annual review of board composition, independence, and succession planning.",
      agendaItems: {
        create: [
          { order: 1, title: "Board skills matrix review" },
          { order: 2, title: "Succession planning update" },
        ],
      },
      attendances: {
        create: [
          { userId: admin.id, status: "PRESENT", meetingRole: "PRESENTER", signedAt: daysFromNow(-90) },
          { userId: member3.id, status: "PRESENT", meetingRole: "VOTER", signedAt: daysFromNow(-90) },
        ],
      },
      minutes: {
        create: {
          content: "Board composition reviewed against skills matrix; no changes recommended before next AGM.",
          finalizedAt: daysFromNow(-90),
        },
      },
    },
  });

  await prisma.document.create({
    data: {
      meetingId: archivedMeeting.id,
      uploadedById: admin.id,
      fileName: "Board-Skills-Matrix-2025.pdf",
      fileUrl: "/uploads/board-skills-matrix-2025.pdf",
      fileType: "PDF",
      version: 1,
    },
  });

  // ================= 7. Meeting scheduled to auto-archive (demonstrates scheduled archival) =================
  const dueForArchival = await prisma.meeting.create({
    data: {
      title: "Finance Committee — Monthly Flash Review",
      categoryId: financeCommittee.id,
      type: "MEETING",
      scheduledAt: daysFromNow(-45, 9, 0),
      status: "COMPLETED",
      scheduledArchiveAt: daysFromNow(-1),
      description: "Monthly flash financial review.",
      agendaItems: { create: [{ order: 1, title: "Monthly flash numbers" }] },
      attendances: {
        create: [{ userId: admin2.id, status: "PRESENT", meetingRole: "PRESENTER", signedAt: daysFromNow(-45) }],
      },
      minutes: {
        create: { content: "Flash numbers reviewed, no material variance.", finalizedAt: daysFromNow(-45) },
      },
    },
  });
  void dueForArchival;

  // ================= 8–9. Circulars =================
  await prisma.meeting.create({
    data: {
      title: "Audit Committee Circular — Related Party Transactions",
      categoryId: auditCommittee.id,
      type: "CIRCULAR",
      scheduledAt: daysFromNow(2, 17, 0),
      status: "SCHEDULED",
      description: "Circular resolution for review of related party transactions.",
      resolutions: { create: [{ text: "Approve disclosed related-party transactions for the quarter" }] },
      attendances: {
        create: [
          { userId: admin.id, status: "INVITED", meetingRole: "PRESENTER" },
          { userId: member.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member2.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member3.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member4.id, status: "INVITED", meetingRole: "VOTER" },
        ],
      },
    },
  });

  const financeCircular = await prisma.meeting.create({
    data: {
      title: "Finance Committee Circular — FY26 Budget Approval",
      categoryId: financeCommittee.id,
      type: "CIRCULAR",
      scheduledAt: daysFromNow(7, 17, 0),
      status: "SCHEDULED",
      description: "Circular resolution to approve the consolidated FY26 operating budget.",
      resolutions: { create: [{ text: "Approve the consolidated FY26 operating budget" }] },
      attendances: {
        create: [
          { userId: admin2.id, status: "INVITED", meetingRole: "PRESENTER" },
          { userId: member.id, status: "INVITED", meetingRole: "VOTER" },
          { userId: member4.id, status: "INVITED", meetingRole: "VOTER" },
        ],
      },
    },
  });

  await prisma.document.create({
    data: {
      meetingId: financeCircular.id,
      uploadedById: admin2.id,
      fileName: "FY26-Consolidated-Budget-Draft.xlsx",
      fileUrl: "/uploads/fy26-consolidated-budget-draft.xlsx",
      fileType: "XLSX",
      version: 1,
    },
  });

  // ================= General library documents (not tied to a meeting) =================
  await prisma.document.createMany({
    data: [
      {
        meetingId: null,
        uploadedById: admin.id,
        fileName: "Board-Charter-2026.pdf",
        fileUrl: "/uploads/board-charter-2026.pdf",
        fileType: "PDF",
        version: 2,
      },
      {
        meetingId: null,
        uploadedById: admin.id,
        fileName: "Code-of-Conduct.pdf",
        fileUrl: "/uploads/code-of-conduct.pdf",
        fileType: "PDF",
        version: 1,
      },
      {
        meetingId: null,
        uploadedById: admin2.id,
        fileName: "Delegation-of-Authority-Matrix.xlsx",
        fileUrl: "/uploads/delegation-of-authority-matrix.xlsx",
        fileType: "XLSX",
        version: 4,
        restricted: true,
      },
      {
        meetingId: null,
        uploadedById: admin.id,
        fileName: "Director-Onboarding-Pack.pptx",
        fileUrl: "/uploads/director-onboarding-pack.pptx",
        fileType: "PPTX",
        version: 1,
      },
    ],
  });

  // ================= Action items sprinkled across dashboards (not tied to the meetings above) =================
  await prisma.actionItem.createMany({
    data: [
      {
        meetingId: q3Meeting.id,
        assignedToId: member4.id,
        description: "Confirm dial-in works for the observer seat before the meeting",
        status: "OPEN",
        dueDate: daysFromNow(4),
      },
      {
        meetingId: q2Meeting.id,
        assignedToId: member3.id,
        description: "Archive superseded vendor contract version",
        status: "DONE",
      },
    ],
  });

  // ================= Activity log — realistic spread across users and actions =================
  await prisma.activityLog.createMany({
    data: [
      { userId: admin.id, action: "LOGIN", targetType: "SESSION" },
      { userId: admin2.id, action: "LOGIN", targetType: "SESSION" },
      { userId: member.id, action: "LOGIN", targetType: "SESSION" },
      { userId: member2.id, action: "LOGIN", targetType: "SESSION" },
      { userId: member3.id, action: "LOGIN", targetType: "SESSION" },
      { userId: admin.id, action: "SCHEDULE_MEETING", targetType: "MEETING", targetId: q3Meeting.id },
      { userId: admin.id, action: "UPLOAD_DOCUMENT", targetType: "DOCUMENT", targetId: q3Meeting.id },
      { userId: admin.id, action: "CIRCULATE_PACK", targetType: "MEETING", targetId: q3Meeting.id },
      { userId: member.id, action: "COMMENT_DOCUMENT", targetType: "DOCUMENT", targetId: q3Pack.id },
      { userId: admin.id, action: "COMMENT_DOCUMENT", targetType: "DOCUMENT", targetId: q3Pack.id },
      { userId: admin.id, action: "SCHEDULE_MEETING", targetType: "MEETING", targetId: liveMeeting.id },
      { userId: admin.id, action: "TOGGLE_DOCUMENT_RESTRICTED", targetType: "DOCUMENT", targetId: maDoc.id },
      { userId: admin.id, action: "CAST_VOTE", targetType: "RESOLUTION" },
      { userId: member.id, action: "SIGN_ATTENDANCE", targetType: "MEETING", targetId: q2Meeting.id },
      { userId: member.id, action: "CAST_VOTE", targetType: "RESOLUTION" },
      { userId: member3.id, action: "CAST_VOTE", targetType: "RESOLUTION" },
      { userId: admin.id, action: "FINALIZE_MINUTES", targetType: "MEETING", targetId: q2Meeting.id },
      { userId: admin.id, action: "FINALIZE_MINUTES", targetType: "MEETING", targetId: auditMeeting.id },
      { userId: admin2.id, action: "FINALIZE_MINUTES", targetType: "MEETING", targetId: riskMeeting.id },
      { userId: member2.id, action: "UPDATE_ACTION_ITEM", targetType: "ACTION_ITEM" },
      { userId: member3.id, action: "UPDATE_ACTION_ITEM", targetType: "ACTION_ITEM" },
      { userId: member4.id, action: "SIGN_ATTENDANCE", targetType: "MEETING", targetId: liveMeeting.id },
      { userId: admin.id, action: "CREATE_USER", targetType: "USER" },
      { userId: admin.id, action: "ARCHIVE_MEETING", targetType: "MEETING", targetId: archivedMeeting.id },
    ],
  });

  console.log(
    `Seed complete: ${allUsers.length} users, 5 categories, 9 meetings/circulars, documents, votes, comments, chat, and activity log.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
