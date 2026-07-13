export function getSubmissionTemplate(courseTitle: string, mentorName: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1d1f;">
      <h2 style="color: #6366f1;">Course Submitted for Review</h2>
      <p>Hi ${mentorName},</p>
      <p>Your course <strong>"${courseTitle}"</strong> has been successfully submitted for review.</p>
      <p>Our admin team will review your content against our quality standards. You will receive an email once the review is complete.</p>
      <p>In the meantime, you can continue to preview your course as a student.</p>
      <br />
      <p>Best regards,<br />The Pharm LMS Team</p>
    </div>
  `;
}

export function getApprovalTemplate(courseTitle: string, mentorName: string, courseUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1d1f;">
      <h2 style="color: #10b981;">Course Approved & Published!</h2>
      <p>Hi ${mentorName},</p>
      <p>Congratulations! Your course <strong>"${courseTitle}"</strong> has been approved and is now live in the catalog.</p>
      <p>Students can now enroll and start learning from your content.</p>
      <a href="${courseUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View Live Course</a>
      <br /><br />
      <p>Best regards,<br />The Pharm LMS Team</p>
    </div>
  `;
}

export function getNewAssignmentEmailTemplate(opts: {
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
  assignmentsUrl: string;
}) {
  const { studentName, courseTitle, assignmentTitle, assignmentsUrl } = opts;
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1d1f;">
      <h2 style="color: #6366f1;">New assignment in ${courseTitle}</h2>
      <p>Hi ${studentName},</p>
      <p>Your mentor posted a new assignment: <strong>${assignmentTitle}</strong>.</p>
      <p>Complete it at your own pace from your assignments page.</p>
      <a href="${assignmentsUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View assignments</a>
      <br /><br />
      <p>Best regards,<br />Pharm LMS</p>
    </div>
  `;
}

export function getAssignmentSubmittedEmailTemplate(opts: {
  mentorName: string;
  studentName: string;
  courseTitle: string;
  assignmentTitle: string;
  reviewUrl: string;
}) {
  const { mentorName, studentName, courseTitle, assignmentTitle, reviewUrl } = opts;
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1d1f;">
      <h2 style="color: #6366f1;">New submission received</h2>
      <p>Hi ${mentorName},</p>
      <p><strong>${studentName}</strong> submitted work for <strong>${assignmentTitle}</strong> in <strong>${courseTitle}</strong>.</p>
      <a href="${reviewUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Review submission</a>
      <br /><br />
      <p>Pharm LMS</p>
    </div>
  `;
}

export function getCourseReviewReceivedEmailTemplate(opts: {
  mentorName: string;
  studentName: string;
  courseTitle: string;
  rating: number;
  commentPreview: string;
  reviewsUrl: string;
}) {
  const {
    mentorName,
    studentName,
    courseTitle,
    rating,
    commentPreview,
    reviewsUrl,
  } = opts;
  const commentBlock = commentPreview
    ? `<p style="margin:12px 0;padding:12px;background:#f4f4f5;border-radius:6px;">${commentPreview}</p>`
    : "";
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1d1f;">
      <h2 style="color: #6366f1;">New course review</h2>
      <p>Hi ${mentorName},</p>
      <p><strong>${studentName}</strong> left a <strong>${rating}★</strong> review for <strong>${courseTitle}</strong>.</p>
      ${commentBlock}
      <a href="${reviewsUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">View reviews</a>
      <br /><br />
      <p>Pharm LMS</p>
    </div>
  `;
}

export function getRejectionTemplate(courseTitle: string, mentorName: string, reason: string, editUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #1c1d1f;">
      <h2 style="color: #e11d48;">Course Requires Revision</h2>
      <p>Hi ${mentorName},</p>
      <p>We've reviewed your course <strong>"${courseTitle}"</strong> and found some areas that need improvement before it can be published.</p>
      <div style="background-color: #fff1f2; border: 1px solid #fda4af; padding: 15px; border-radius: 6px; color: #9f1239;">
        <strong>Feedback from Admin:</strong><br />
        ${reason}
      </div>
      <p>You can edit your course and resubmit it for review once you've addressed the feedback.</p>
      <a href="${editUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 10px;">Return to Studio</a>
      <br /><br />
      <p>Best regards,<br />The Pharm LMS Team</p>
    </div>
  `;
}
