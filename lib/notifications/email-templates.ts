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
